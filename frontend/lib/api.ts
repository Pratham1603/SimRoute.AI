import axios from "axios";

// ---- Axios Instance ----
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  timeout: 120000,  // 120s to accommodate DINOv2 model loading + inference
});

// ---- Types ----
export interface PredictionResponse {
  mask_url: string;
  overlay_url: string;
  iou_score: number;
  latency_ms: number;
  resolution: string;
  class_distribution: Record<string, number>;
}

export interface MetricsResponse {
  global_accuracy: number;
  mean_iou: number;
  parameters: string;
  epochs: number[];
  train_loss: number[];
  val_loss: number[];
  iou_history: number[];
  per_class_iou: Record<string, number>;
  confusion_matrix: number[][];
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  thumbnail_url: string;
  iou_score: number;
}

// ---- API Functions ----

/** POST /predict — Upload an image for segmentation */
export async function runPrediction(file: File): Promise<PredictionResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<PredictionResponse>("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** GET /metrics — Fetch training metrics */
export async function fetchMetrics(): Promise<MetricsResponse> {
  const { data } = await api.get<MetricsResponse>("/metrics");
  return data;
}

/** GET /history — Fetch prediction history */
export async function fetchHistory(): Promise<HistoryItem[]> {
  const { data } = await api.get<HistoryItem[]>("/history");
  return data;
}

export default api;
