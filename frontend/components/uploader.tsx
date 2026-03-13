"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Loader2, Sparkles, ImageIcon, Zap, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { runPrediction } from "@/lib/api";

interface UploaderProps {
  onResult: (result: {
    original: string;
    mask: string;
    overlay: string;
    latency: number;
    resolution: string;
    classDistribution: Record<string, number>;
  }) => void;
  onNavigateResults: () => void;
}

export default function ImageUploader({ onResult, onNavigateResults }: UploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setProgress(0);
    setError(null);
  };

  const runSegmentation = async () => {
    if (!file || !preview) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    // Start progress animation (runs in parallel with real API call)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90; // Hold at 90% until API completes
        }
        return prev + Math.random() * 8 + 2;
      });
    }, 300);

    try {
      // Real API call to Flask backend
      const response = await runPrediction(file);

      clearInterval(progressInterval);
      setProgress(100);

      onResult({
        original: preview,
        mask: response.mask_url,
        overlay: response.overlay_url,
        latency: response.latency_ms,
        resolution: response.resolution,
        classDistribution: response.class_distribution,
      });

      setIsProcessing(false);
      await new Promise((r) => setTimeout(r, 400));
      onNavigateResults();
    } catch (err: any) {
      clearInterval(progressInterval);
      setIsProcessing(false);
      setProgress(0);
      const message = err?.response?.data?.error || err?.message || "Failed to connect to the AI server. Make sure the backend is running.";
      setError(message);
      console.error("Segmentation error:", err);
    }
  };

  const sampleImages = [
    { label: "Desert Canyon", gradient: "from-amber-300 via-orange-200 to-yellow-100", icon: "🏜️" },
    { label: "Rocky Terrain", gradient: "from-stone-400 via-stone-300 to-stone-200", icon: "🪨" },
    { label: "Bush Trail", gradient: "from-emerald-300 via-green-200 to-teal-100", icon: "🌿" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 } as any}
      >
        <h2 className="text-3xl font-bold tracking-tight text-white">Upload Image</h2>
        <p className="mt-2 text-white/60">
          Upload a desert terrain image for AI-powered semantic segmentation.
        </p>
      </motion.div>

      {/* ── Dropzone ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="glass-card overflow-hidden border-2 border-dashed border-white/20 transition-all duration-500 hover:border-white/40"
              style={{
                borderColor: isDragging ? "white" : undefined,
              }}>
          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              {!preview ? (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`
                    flex flex-col items-center justify-center py-24 px-8 cursor-pointer
                    transition-all duration-500 relative overflow-hidden
                    ${isDragging ? "bg-cyan-500/10" : "bg-white/5 hover:bg-white/10"}
                  `}
                >
                  {/* Background grid */}
                  <div className="absolute inset-0 grid-overlay pointer-events-none opacity-50" />

                  <motion.div
                    animate={{
                      y: isDragging ? -8 : 0,
                      scale: isDragging ? 1.1 : 1,
                    }}
                    className={`
                      w-20 h-20 rounded-2xl flex items-center justify-center mb-6
                      transition-all duration-500 relative
                      ${isDragging
                        ? "bg-white/20 border border-white/30"
                        : "bg-white/10 border border-white/10"
                      }
                    `}
                  >
                    <Upload className={`w-8 h-8 transition-colors duration-300 ${isDragging ? "text-cyan-400" : "text-white/60"}`} />
                  </motion.div>

                  <p className="text-lg font-semibold text-white relative">
                    {isDragging ? "Drop your image here" : "Drag & drop your desert image"}
                  </p>
                  <p className="mt-2 text-sm text-white/60 relative">
                    or click to browse · Supports PNG, JPG, JPEG
                  </p>

                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Uploaded preview" className="w-full max-h-[500px] object-contain bg-black/5" />

                  {/* Close button */}
                  <button
                    onClick={clearFile}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md
                             text-white flex items-center justify-center hover:bg-black/70
                             transition-all hover:scale-110 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* File info */}
                  <div className="absolute bottom-4 left-4 glass-dark rounded-xl px-4 py-2 text-xs font-medium text-white">
                    📄 {file?.name}
                  </div>

                  {/* Progress bar overlay - AI scanning effect */}
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/50 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden"
                    >
                      {/* Scanning grid */}
                      <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />
                      {/* Scanning line */}
                      <motion.div
                        animate={{ top: ["0%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                      />
                      <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                        </motion.div>
                        <p className="text-white font-semibold text-sm mb-1">AI Processing</p>
                        <p className="text-cyan-300/80 text-xs mb-4">Running semantic segmentation...</p>
                        <div className="w-56 h-2 rounded-full bg-white/10 overflow-hidden border border-cyan-400/20">
                          <motion.div
                            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 rounded-full"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <p className="text-white/70 text-xs mt-3 font-mono">{progress}%</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Action Button ── */}
      {preview && !isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3"
        >
          <button
            onClick={runSegmentation}
            disabled={isProcessing}
            className="btn-glow inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl
                     bg-white/10 text-white font-semibold text-sm
                     hover:bg-white/20 cursor-pointer border border-white/20
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            Run Segmentation
            <Zap className="w-4 h-4 text-orange-400" />
          </button>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 text-sm max-w-md"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ── Sample Gallery ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-sm font-semibold text-white/60 mb-3">
          Quick Start — Sample Images
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {sampleImages.map((img, i) => (
            <motion.div
              key={img.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <Card className="glass-card cursor-pointer overflow-hidden group border-white/[0.06]">
                <CardContent className="p-0">
                  <div
                    className={`h-32 bg-gradient-to-br ${img.gradient} flex items-center justify-center
                                group-hover:scale-105 transition-transform duration-700 relative opacity-90`}
                  >
                    <span className="text-3xl">{img.icon}</span>
                    <div className="absolute inset-0 grid-overlay opacity-20" />
                  </div>
                  <div className="p-3.5 bg-white/5">
                    <p className="text-xs font-semibold text-white/90">{img.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
