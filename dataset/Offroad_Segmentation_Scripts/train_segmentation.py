"""
Segmentation Training Script - ROUND 2 (Backbone Fine-tuning)
Loads best checkpoint from Round 1 and unfreezes DINOv2 backbone
Target: mIoU > 0.44
"""

import torch
from torch.utils.data import Dataset, DataLoader
import numpy as np
from torch import nn
import torch.nn.functional as F
import matplotlib.pyplot as plt
import torch.optim as optim
import torchvision.transforms as transforms
from PIL import Image
import cv2
import os
import torchvision
from tqdm import tqdm
import json

plt.switch_backend('Agg')


# ============================================================================
# CONFIG — ROUND 2
# ============================================================================
BATCH_SIZE  = 4
N_EPOCHS    = 60        # fresh 60 epochs
LR          = 5e-5      # lower LR for fine-tuning
PATIENCE    = 20        # more patience
DEVICE      = torch.device('cuda' if torch.cuda.is_available() else 'cpu')


# ============================================================================
# CLASS WEIGHTS
# ============================================================================
CLASS_WEIGHTS = torch.tensor([
    2.0,   # Background
    3.0,   # Trees
    5.0,   # Lush Bushes
    2.5,   # Dry Grass
    4.0,   # Dry Bushes
    4.0,   # Ground Clutter
    5.0,   # Logs
    3.0,   # Rocks
    1.5,   # Landscape
    0.5,   # Sky
], dtype=torch.float32)


# ============================================================================
# COMBINED LOSS
# ============================================================================
class CombinedLoss(nn.Module):
    def __init__(self, weights, ce_w=0.5, dice_w=0.5):
        super().__init__()
        self.ce     = nn.CrossEntropyLoss(weight=weights.to(DEVICE))
        self.ce_w   = ce_w
        self.dice_w = dice_w

    def dice_loss(self, pred, target, num_classes=10):
        pred  = torch.softmax(pred, dim=1)
        total = 0.0
        for c in range(num_classes):
            p = pred[:, c]
            t = (target == c).float()
            intersection = (p * t).sum()
            total += 1 - (2 * intersection + 1) / (p.sum() + t.sum() + 1)
        return total / num_classes

    def forward(self, pred, target):
        return self.ce_w * self.ce(pred, target) + \
               self.dice_w * self.dice_loss(pred, target)


# ============================================================================
# Mask Conversion
# ============================================================================
value_map = {
    0: 0, 100: 1, 200: 2, 300: 3, 500: 4,
    550: 5, 700: 6, 800: 7, 7100: 8, 10000: 9
}
n_classes = len(value_map)


def convert_mask(mask):
    arr     = np.array(mask)
    new_arr = np.zeros_like(arr, dtype=np.uint8)
    for raw_value, new_value in value_map.items():
        new_arr[arr == raw_value] = new_value
    return Image.fromarray(new_arr)


# ============================================================================
# Dataset
# ============================================================================
class MaskDataset(Dataset):
    def __init__(self, data_dir, transform=None, mask_transform=None):
        self.image_dir      = os.path.join(data_dir, 'Color_Images')
        self.masks_dir      = os.path.join(data_dir, 'Segmentation')
        self.transform      = transform
        self.mask_transform = mask_transform
        self.data_ids       = os.listdir(self.image_dir)

    def __len__(self):
        return len(self.data_ids)

    def __getitem__(self, idx):
        data_id  = self.data_ids[idx]
        img_path = os.path.join(self.image_dir, data_id)
        msk_path = os.path.join(self.masks_dir, data_id)
        image = Image.open(img_path).convert("RGB")
        mask  = Image.open(msk_path)
        mask  = convert_mask(mask)
        if self.transform:
            image = self.transform(image)
            mask  = self.mask_transform(mask) * 255
        return image, mask


# ============================================================================
# Model — same architecture as Round 1 (must match to load weights)
# ============================================================================
class SegmentationHeadConvNeXt(nn.Module):
    def __init__(self, in_channels, out_channels, tokenW, tokenH):
        super().__init__()
        self.H, self.W = tokenH, tokenW

        self.stem = nn.Sequential(
            nn.Conv2d(in_channels, 256, kernel_size=7, padding=3),
            nn.BatchNorm2d(256),
            nn.GELU()
        )
        self.block = nn.Sequential(
            nn.Conv2d(256, 256, kernel_size=7, padding=3, groups=256),
            nn.GELU(),
            nn.Conv2d(256, 256, kernel_size=1),
            nn.GELU(),
            nn.Conv2d(256, 256, kernel_size=7, padding=3, groups=256),
            nn.GELU(),
            nn.Conv2d(256, 256, kernel_size=1),
            nn.GELU(),
            nn.Conv2d(256, 128, kernel_size=1),
            nn.GELU(),
        )
        self.dropout    = nn.Dropout2d(p=0.1)
        self.classifier = nn.Conv2d(128, out_channels, 1)

    def forward(self, x):
        B, N, C = x.shape
        x = x.reshape(B, self.H, self.W, C).permute(0, 3, 1, 2)
        x = self.stem(x)
        x = self.block(x)
        x = self.dropout(x)
        return self.classifier(x)


# ============================================================================
# Metrics
# ============================================================================
def compute_iou(pred, target, num_classes=10, ignore_index=255):
    pred   = torch.argmax(pred, dim=1).view(-1)
    target = target.view(-1)
    iou_per_class = []
    for class_id in range(num_classes):
        if class_id == ignore_index:
            continue
        pred_inds   = pred == class_id
        target_inds = target == class_id
        intersection = (pred_inds & target_inds).sum().float()
        union        = (pred_inds | target_inds).sum().float()
        if union == 0:
            iou_per_class.append(float('nan'))
        else:
            iou_per_class.append((intersection / union).cpu().numpy())
    return np.nanmean(iou_per_class)


def compute_dice(pred, target, num_classes=10, smooth=1e-6):
    pred   = torch.argmax(pred, dim=1).view(-1)
    target = target.view(-1)
    dice_per_class = []
    for class_id in range(num_classes):
        p            = pred == class_id
        t            = target == class_id
        intersection = (p & t).sum().float()
        dice         = (2. * intersection + smooth) / (
                        p.sum().float() + t.sum().float() + smooth)
        dice_per_class.append(dice.cpu().numpy())
    return np.mean(dice_per_class)


def compute_pixel_accuracy(pred, target):
    pred_classes = torch.argmax(pred, dim=1)
    return (pred_classes == target).float().mean().cpu().numpy()


def evaluate_metrics(model, backbone, loader, device, num_classes=10):
    model.eval()
    backbone.eval()
    ious, dices, accs = [], [], []
    with torch.no_grad():
        for imgs, labels in tqdm(loader, desc="Evaluating", leave=False):
            imgs, labels = imgs.to(device), labels.to(device)
            feats   = backbone.forward_features(imgs)["x_norm_patchtokens"]
            logits  = model(feats)
            outputs = F.interpolate(logits, size=imgs.shape[2:],
                                    mode="bilinear", align_corners=False)
            labels  = labels.squeeze(1).long()
            ious.append(compute_iou(outputs, labels, num_classes))
            dices.append(compute_dice(outputs, labels, num_classes))
            accs.append(compute_pixel_accuracy(outputs, labels))
    model.train()
    backbone.train()
    return np.nanmean(ious), np.mean(dices), np.mean(accs)


# ============================================================================
# Plotting & Saving — identical to Round 1
# ============================================================================
def save_training_plots(history, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    epochs = range(1, len(history['train_loss']) + 1)

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    axes[0,0].plot(epochs, history['train_loss'], label='train')
    axes[0,0].plot(epochs, history['val_loss'],   label='val')
    axes[0,0].set_title('Loss vs Epoch'); axes[0,0].set_xlabel('Epoch')
    axes[0,0].set_ylabel('Loss'); axes[0,0].legend(); axes[0,0].grid(True)

    axes[0,1].plot(epochs, history['train_iou'], label='train')
    axes[0,1].plot(epochs, history['val_iou'],   label='val')
    axes[0,1].set_title('IoU vs Epoch'); axes[0,1].set_xlabel('Epoch')
    axes[0,1].set_ylabel('IoU'); axes[0,1].legend(); axes[0,1].grid(True)

    axes[1,0].plot(epochs, history['train_dice'], label='train')
    axes[1,0].plot(epochs, history['val_dice'],   label='val')
    axes[1,0].set_title('Dice Score vs Epoch'); axes[1,0].set_xlabel('Epoch')
    axes[1,0].set_ylabel('Dice'); axes[1,0].legend(); axes[1,0].grid(True)

    axes[1,1].plot(epochs, history['train_pixel_acc'], label='train')
    axes[1,1].plot(epochs, history['val_pixel_acc'],   label='val')
    axes[1,1].set_title('Pixel Accuracy vs Epoch'); axes[1,1].set_xlabel('Epoch')
    axes[1,1].set_ylabel('Accuracy'); axes[1,1].legend(); axes[1,1].grid(True)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'all_metrics_curves.png'), dpi=150)
    plt.close()

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    axes[0].plot(epochs, history['train_iou'], label='Train IoU')
    axes[0].set_title('Train IoU vs Epoch'); axes[0].grid(True); axes[0].legend()
    axes[1].plot(epochs, history['val_iou'],   label='Val IoU')
    axes[1].set_title('Validation IoU vs Epoch'); axes[1].grid(True); axes[1].legend()
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'iou_curves.png'), dpi=150)
    plt.close()

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    axes[0].plot(epochs, history['train_dice'], label='Train Dice')
    axes[0].set_title('Train Dice vs Epoch'); axes[0].grid(True); axes[0].legend()
    axes[1].plot(epochs, history['val_dice'],   label='Val Dice')
    axes[1].set_title('Validation Dice vs Epoch'); axes[1].grid(True); axes[1].legend()
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'dice_curves.png'), dpi=150)
    plt.close()

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    axes[0].plot(epochs, history['train_loss'], label='train')
    axes[0].plot(epochs, history['val_loss'],   label='val')
    axes[0].set_title('Loss'); axes[0].grid(True); axes[0].legend()
    axes[1].plot(epochs, history['train_pixel_acc'], label='train')
    axes[1].plot(epochs, history['val_pixel_acc'],   label='val')
    axes[1].set_title('Pixel Accuracy'); axes[1].grid(True); axes[1].legend()
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'training_curves.png'), dpi=150)
    plt.close()
    print(f"All plots saved to '{output_dir}/'")


def save_history_to_file(history, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, 'evaluation_metrics.txt')
    with open(filepath, 'w') as f:
        f.write("TRAINING RESULTS - ROUND 2\n")
        f.write("=" * 50 + "\n\n")
        f.write("Final Metrics:\n")
        f.write(f"  Final Train Loss:     {history['train_loss'][-1]:.4f}\n")
        f.write(f"  Final Val Loss:       {history['val_loss'][-1]:.4f}\n")
        f.write(f"  Final Train IoU:      {history['train_iou'][-1]:.4f}\n")
        f.write(f"  Final Val IoU:        {history['val_iou'][-1]:.4f}\n")
        f.write(f"  Final Train Dice:     {history['train_dice'][-1]:.4f}\n")
        f.write(f"  Final Val Dice:       {history['val_dice'][-1]:.4f}\n")
        f.write(f"  Final Train Accuracy: {history['train_pixel_acc'][-1]:.4f}\n")
        f.write(f"  Final Val Accuracy:   {history['val_pixel_acc'][-1]:.4f}\n")
        f.write("=" * 50 + "\n\n")
        f.write("Best Results:\n")
        f.write(f"  Best Val IoU:      {max(history['val_iou']):.4f} (Epoch {np.argmax(history['val_iou'])+1})\n")
        f.write(f"  Best Val Dice:     {max(history['val_dice']):.4f} (Epoch {np.argmax(history['val_dice'])+1})\n")
        f.write(f"  Best Val Accuracy: {max(history['val_pixel_acc']):.4f} (Epoch {np.argmax(history['val_pixel_acc'])+1})\n")
        f.write(f"  Lowest Val Loss:   {min(history['val_loss']):.4f} (Epoch {np.argmin(history['val_loss'])+1})\n")
        f.write("=" * 50 + "\n\n")
        f.write("Per-Epoch History:\n")
        f.write("-" * 100 + "\n")
        headers = ['Epoch','Train Loss','Val Loss','Train IoU','Val IoU',
                   'Train Dice','Val Dice','Train Acc','Val Acc']
        f.write("{:<8} {:<12} {:<12} {:<12} {:<12} {:<12} {:<12} {:<12} {:<12}\n".format(*headers))
        f.write("-" * 100 + "\n")
        for i in range(len(history['train_loss'])):
            f.write("{:<8} {:<12.4f} {:<12.4f} {:<12.4f} {:<12.4f} {:<12.4f} {:<12.4f} {:<12.4f} {:<12.4f}\n".format(
                i+1,
                history['train_loss'][i], history['val_loss'][i],
                history['train_iou'][i],  history['val_iou'][i],
                history['train_dice'][i], history['val_dice'][i],
                history['train_pixel_acc'][i], history['val_pixel_acc'][i]
            ))
    print(f"Saved evaluation metrics to {filepath}")


# ============================================================================
# Main
# ============================================================================
def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, 'train_stats')
    os.makedirs(output_dir, exist_ok=True)

    print(f"Using device: {DEVICE}")
    print(f"Batch size:   {BATCH_SIZE}")
    print(f"Max epochs:   {N_EPOCHS}  (early stop patience={PATIENCE})")
    print(f"Learning rate:{LR}")
    print(f"MODE: ROUND 2 — Backbone fine-tuning")

    w = int(((960 / 2) // 14) * 14)
    h = int(((540 / 2) // 14) * 14)

    transform = transforms.Compose([
        transforms.Resize((h, w)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    mask_transform = transforms.Compose([
        transforms.Resize((h, w)),
        transforms.ToTensor(),
    ])

    data_dir = os.path.join(script_dir, '..', 'Offroad_Segmentation_Training_Dataset', 'train')
    val_dir  = os.path.join(script_dir, '..', 'Offroad_Segmentation_Training_Dataset', 'val')

    trainset = MaskDataset(data_dir=data_dir, transform=transform,
                           mask_transform=mask_transform)
    valset   = MaskDataset(data_dir=val_dir,  transform=transform,
                           mask_transform=mask_transform)

    train_loader = DataLoader(trainset, batch_size=BATCH_SIZE,
                              shuffle=True,  num_workers=2, pin_memory=True)
    val_loader   = DataLoader(valset,   batch_size=BATCH_SIZE,
                              shuffle=False, num_workers=2, pin_memory=True)

    print(f"Training samples:   {len(trainset)}")
    print(f"Validation samples: {len(valset)}")

    # ── DINOv2 backbone ───────────────────────────────────────────────────
    print("\nLoading DINOv2 backbone...")
    backbone_model = torch.hub.load(
        repo_or_dir="facebookresearch/dinov2", model="dinov2_vits14")
    backbone_model.to(DEVICE)

    # ── Unfreeze last 2 transformer blocks + norm layer ───────────────────
    for param in backbone_model.parameters():
        param.requires_grad = False                    # freeze all first

    for block in backbone_model.blocks[-2:]:           # unfreeze last 2
        for param in block.parameters():
            param.requires_grad = True

    for param in backbone_model.norm.parameters():     # unfreeze norm
        param.requires_grad = True

    unfrozen = sum(p.numel() for p in backbone_model.parameters()
                   if p.requires_grad)
    print(f"Backbone loaded! Unfrozen params: {unfrozen:,}")

    # ── Get embedding dim ─────────────────────────────────────────────────
    imgs, _ = next(iter(train_loader))
    backbone_model.eval()
    with torch.no_grad():
        output = backbone_model.forward_features(
            imgs.to(DEVICE))["x_norm_patchtokens"]
    n_embedding = output.shape[2]
    print(f"Embedding dim: {n_embedding}  |  Patch shape: {output.shape}")

    # ── Load classifier from Round 1 checkpoint ───────────────────────────
    classifier = SegmentationHeadConvNeXt(
        in_channels=n_embedding,
        out_channels=n_classes,
        tokenW=w // 14,
        tokenH=h // 14,
    ).to(DEVICE)

    best_model_path = os.path.join(script_dir, 'segmentation_head.pth')
    classifier.load_state_dict(
        torch.load(best_model_path, map_location=DEVICE))
    print(f"✅ Loaded Round 1 checkpoint — starting from Val IoU=0.3744")

    # ── Loss ─────────────────────────────────────────────────────────────
    criterion = CombinedLoss(CLASS_WEIGHTS)

    # ── Separate LRs: backbone 10x lower than head ────────────────────────
    optimizer = optim.AdamW([
        {'params': [p for p in backbone_model.parameters()
                    if p.requires_grad],
         'lr': LR * 0.1,           # 5e-6 for backbone blocks
         'weight_decay': 1e-5},
        {'params': classifier.parameters(),
         'lr': LR,                  # 5e-5 for head
         'weight_decay': 1e-4},
    ])

    # ── Fresh cosine LR cycle ─────────────────────────────────────────────
    scheduler = optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=N_EPOCHS, eta_min=1e-7)

    # ── Mixed precision ───────────────────────────────────────────────────
    scaler = torch.amp.GradScaler('cuda', enabled=DEVICE.type == 'cuda')

    # ── History ───────────────────────────────────────────────────────────
    history = {k: [] for k in [
        'train_loss','val_loss','train_iou','val_iou',
        'train_dice','val_dice','train_pixel_acc','val_pixel_acc'
    ]}

    best_val_iou     = 0.3744   # start from Round 1 best
    patience_counter = 0

    print("\nStarting Round 2 training...")
    print("=" * 80)

    for epoch in range(1, N_EPOCHS + 1):

        # ── Train ─────────────────────────────────────────────────────────
        classifier.train()
        backbone_model.train()
        train_losses = []

        pbar = tqdm(train_loader,
                    desc=f"Epoch {epoch}/{N_EPOCHS} [Train]",
                    leave=False)
        for imgs, labels in pbar:
            imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)

            # ← NO torch.no_grad() here — backbone now trains too
            with torch.amp.autocast('cuda', enabled=DEVICE.type == 'cuda'):
                feats   = backbone_model.forward_features(
                    imgs)["x_norm_patchtokens"]
                logits  = classifier(feats)
                outputs = F.interpolate(logits, size=imgs.shape[2:],
                                        mode="bilinear", align_corners=False)
                labels_sq = labels.squeeze(1).long()
                loss = criterion(outputs, labels_sq)

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
            optimizer.zero_grad()

            train_losses.append(loss.item())
            pbar.set_postfix(loss=f"{loss.item():.4f}")

        # ── Validate ──────────────────────────────────────────────────────
        classifier.eval()
        backbone_model.eval()
        val_losses = []
        with torch.no_grad():
            for imgs, labels in tqdm(val_loader,
                                     desc=f"Epoch {epoch}/{N_EPOCHS} [Val]",
                                     leave=False):
                imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
                with torch.amp.autocast('cuda', enabled=DEVICE.type == 'cuda'):
                    feats   = backbone_model.forward_features(
                        imgs)["x_norm_patchtokens"]
                    logits  = classifier(feats)
                    outputs = F.interpolate(logits, size=imgs.shape[2:],
                                            mode="bilinear", align_corners=False)
                    labels_sq = labels.squeeze(1).long()
                    val_losses.append(criterion(outputs, labels_sq).item())

        # ── Metrics ───────────────────────────────────────────────────────
        tr_iou, tr_dice, tr_acc = evaluate_metrics(
            classifier, backbone_model, train_loader, DEVICE)
        vl_iou, vl_dice, vl_acc = evaluate_metrics(
            classifier, backbone_model, val_loader, DEVICE)

        scheduler.step()

        ep_tr_loss = np.mean(train_losses)
        ep_vl_loss = np.mean(val_losses)

        history['train_loss'].append(float(ep_tr_loss))
        history['val_loss'].append(float(ep_vl_loss))
        history['train_iou'].append(float(tr_iou))
        history['val_iou'].append(float(vl_iou))
        history['train_dice'].append(float(tr_dice))
        history['val_dice'].append(float(vl_dice))
        history['train_pixel_acc'].append(float(tr_acc))
        history['val_pixel_acc'].append(float(vl_acc))

        print(f"Epoch {epoch:3d}/{N_EPOCHS} | "
              f"Loss {ep_tr_loss:.4f}/{ep_vl_loss:.4f} | "
              f"IoU  {tr_iou:.4f}/{vl_iou:.4f} | "
              f"Dice {tr_dice:.4f}/{vl_dice:.4f} | "
              f"Acc  {tr_acc:.4f}/{vl_acc:.4f} | "
              f"LR {scheduler.get_last_lr()[0]:.2e}")

        # ── Save best & early stopping ────────────────────────────────────
        if vl_iou > best_val_iou:
            best_val_iou     = vl_iou
            patience_counter = 0
            torch.save(classifier.state_dict(), best_model_path)
            print(f"  ✅ Best saved → Val IoU={vl_iou:.4f}")
        else:
            patience_counter += 1
            if patience_counter >= PATIENCE:
                print(f"\n⏹  Early stopping at epoch {epoch} "
                      f"(no improvement for {PATIENCE} epochs)")
                break

    # ── Final output ──────────────────────────────────────────────────────
    print("\n" + "=" * 80)
    print(f"ROUND 2 COMPLETE  |  Best Val IoU: {best_val_iou:.4f}")
    print("=" * 80)

    save_training_plots(history, output_dir)
    save_history_to_file(history, output_dir)

    with open(os.path.join(output_dir, 'history_round2.json'), 'w') as f:
        json.dump(history, f, indent=2)

    print(f"\nAll outputs saved to: {output_dir}/")
    print(f"Best model saved to:  {best_model_path}")


if __name__ == "__main__":
    main()