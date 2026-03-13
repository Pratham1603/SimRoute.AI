# SimRoute.AI 🚙🌵 

![SimRoute.AI Banner](mlogo.png)

**SimRoute.AI** is an AI-powered semantic segmentation project designed for autonomous off-road navigation. It leverages a state-of-the-art **DINOv2** visual foundation model combined with a **SegmentationHeadConvNeXt** decoder to understand complex desert environments at the pixel level. 

The project features a full-stack architecture with a **Flask/PyTorch** backend for real-time inference and a beautiful **Next.js/React** frontend dashboard for visualization and performance tracking.

---

## 🌟 Key Features

- **Pixel-Level Terrain Classification:** Accurately segments 10 distinct off-road classes (Rocks, Lush Bushes, Dry Grass, Sky, Logs, etc.) to aid autonomous navigation logic.
- **Deep Learning Pipeline:** Utilizes `facebookresearch/dinov2_vits14` as the backbone with a lightweight, custom-trained `ConvNeXt` segmentation head.
- **Real-Time Inference API:** A robust Python Flask backend running on CUDA/CPU that processes uploaded imagery, applies the segmentation mask, and computes class distributions in real time.
- **Interactive Pro Dashboard:** A stunning, modern web interface built with Next.js, Tailwind CSS, and Framer Motion. 
  - Drag-and-drop image uploading.
  - Interactive Before/After image comparison sliders.
  - Live data visualization of training metrics (IoU, Accuracy, Loss) using Recharts.

---

## 🏗️ System Architecture

### 1. The ML Model & Backend (`/backend` & `/dataset/Offroad_Segmentation_Scripts`)
- **Frameworks:** PyTorch, Torchvision, OpenCV, Flask.
- **Backbone:** DINOv2 (Vision Transformer).
- **Decoder:** Custom ConvNeXt block.
- **API Endpoints:** 
  - `POST /predict` — Receives an image and returns the segmentation mask, blended overlay, computation latency, and pixel class distribution.
  - `GET /metrics` — Serves the actual 60-epoch training history (Loss, Val Loss, mIoU) and test-set per-class IoU scores.
  - `GET /health` — Confirms if the API is online and whether the model is loaded onto the GPU (`cuda`).

### 2. The Frontend (`/frontend`)
- **Technology Stack:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS.
- **UI Components:** Framer Motion (animations), Lucide Icons, Recharts (data visualization), Radix UI primitives.
- **Responsibilities:** Consumes backend REST endpoints to beautifully render the segmentation results and training progression for users and judges.

---

## ⚙️ Installation & Setup

To run this project locally, you need to spin up both the Backend AI Server and the Frontend Web App.

### Prerequisites
- Python 3.9+ 
- Node.js 18+ & npm
- (Optional but recommended) NVIDIA GPU with CUDA support for faster inference.

### Step 1: Start the AI Backend (Flask + PyTorch)
First, ensure you have your pre-trained model checkpoint (`segmentation_head.pth`) located in `dataset/Offroad_Segmentation_Scripts/`.

```bash
# Navigate to the backend directory
cd backend

# Install the required Python dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```
> Note: On the first run, PyTorch will automatically download the DINOv2 backbone weights from TorchHub (~80MB). Wait until the console prints: **`Models ready! Starting Flask server...`** on port 5000.

### Step 2: Start the Web Dashboard (Next.js)
Open a new terminal window.

```bash
# Navigate to the frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the Next.js development server
npm run dev
```

### Step 3: Access the Application
Open your web browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🚀 Usage Guide

1. **Dashboard Navigation:** Use the left sidebar to navigate between **Home**, **Upload Image**, and **Metrics**.
2. **Predicting Terrain:** 
   - Go to the **Upload Image** tab.
   - Drag and drop any desert off-road image (or use one from the `demo_images/` directory).
   - Click the sparkling **Run Segmentation** button.
3. **Evaluating Results:** 
   - The app will securely send the image to the Python backend and transition to the **Results** page.
   - Use the interactive slider to compare the raw input with the model's semantic understanding.
   - Expand the **Raw Output Data** dropdown to see the JSON payload returned by the API (including latency and exact pixel percentages).
4. **Analyzing Training:** Go to the **Metrics** page to see real Loss and IoU progressions over the 60 epochs of training data.

---

## 📦 Project Structure

```text
SimRoute.AI/
├── backend/                  # Flask REST API Server
│   ├── app.py                # Server entry point + PyTorch Inference logic
│   ├── requirements.txt      # Python dependencies
│   └── outputs/              # Generated segmentation images
├── frontend/                 # Next.js Web Dashboard
│   ├── app/                  # Next.js pages & routing
│   ├── components/           # React UI components (Uploader, Results, Metrics)
│   ├── lib/                  # Utility functions (Axios API connection)
│   └── public/               # Static assets
├── dataset/Offroad_Segmentation_Scripts/
│   ├── segmentation_head.pth # The trained model weights
│   ├── train_segmentation.py # The training script
│   ├── test_segmentation.py  # The evaluation/testing script
│   └── train_stats/          # Historic training loss & accuracy JSON data
└── demo_images/              # 5 pre-selected test images for easy execution
```

*Note: For GitHub limits, the raw 2GB image datasets used for training have been excluded from this repository.*

---

*Built for the ultimate off-road autonomous driving challenge.*
