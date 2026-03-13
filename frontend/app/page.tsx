"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/sidebar";
import LandingPage from "@/components/landing-page";
import ImageUploader from "@/components/uploader";
import ResultView from "@/components/result-view";
import MetricsCharts from "@/components/metrics-charts";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { useCountUp } from "@/lib/use-count-up";
import {
  Layers,
  Target,
  Database,
  Zap,
  ArrowRight,
  Globe,
  Cpu,
  Brain,
  Scan,
  Route,
  Moon,
  Sun,
} from "lucide-react";

/** Type for segmentation results shared between Uploader → ResultView */
interface SegmentationResult {
  original: string;
  mask: string;
  overlay: string;
  latency: number;
  resolution: string;
  classDistribution: Record<string, number>;
}

/** Page transition variants */
const pageVariants: any = {
  initial: { opacity: 0, y: 24, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -16, filter: "blur(4px)" },
};

/** Stagger children container */
const staggerContainer: any = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp: any = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
};

export default function Home() {
  const [activePage, setActivePage] = useState("landing");
  const [segResult, setSegResult] = useState<SegmentationResult | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to Night mode

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Animated counters for KPIs (now with continuous fluctuation)
  const iouCounter = useCountUp(0.783, 2200, 3, true);
  const accCounter = useCountUp(92.4, 2000, 1, true);
  const dataCounter = useCountUp(15000, 2500, 0, true);

  /** Terrain classes */
  const terrainClasses = [
    { name: "Trees", color: "#22c55e", icon: "🌳" },
    { name: "Lush Bushes", color: "#14b8a6", icon: "🌿" },
    { name: "Dry Grass", color: "#eab308", icon: "🌾" },
    { name: "Dry Bushes", color: "#f97316", icon: "🥀" },
    { name: "Ground Clutter", color: "#a8a29e", icon: "🍂" },
    { name: "Flowers", color: "#ec4899", icon: "🌸" },
    { name: "Logs", color: "#92400e", icon: "🪵" },
    { name: "Rocks", color: "#64748b", icon: "🪨" },
    { name: "Landscape", color: "#d97706", icon: "🏜️" },
    { name: "Sky", color: "#3b82f6", icon: "☁️" },
  ];

  return (
    <div className={`flex min-h-screen relative transition-colors duration-500 ${isDarkMode ? "dark bg-slate-950" : "bg-slate-50"}`}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} isDarkMode={isDarkMode} />

      <main className="main-content-offset flex-1 ml-[260px] min-h-screen relative z-10 overflow-y-auto">
        {/* ── Top-Right Theme Toggle ── */}
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer group
                        ${isDarkMode 
                          ? "glass-dark border-white/10 text-white hover:text-cyan-400" 
                          : "bg-white border-slate-200 text-slate-600 shadow-sm hover:text-blue-600"}`}
          >
            {isDarkMode ? (
              <Moon className="w-4 h-4 transition-transform group-hover:scale-110" />
            ) : (
              <Sun className="w-4 h-4 transition-transform group-hover:scale-110" />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ═══════════════ LANDING PAGE ═══════════════ */}
          {activePage === "landing" && (
            <LandingPage onNavigate={setActivePage} />
          )}

          {/* ═══════════════ DASHBOARD ═══════════════ */}
          {activePage === "dashboard" && (
            <motion.div
              key="dashboard"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="p-6 lg:p-10 space-y-10"
            >
              {/* ── HERO SECTION ── */}
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative rounded-2xl overflow-hidden min-h-[380px] glass-over-video border border-white/[0.06]"
              >
                {/* Subtle grid overlay */}
                <div className="absolute inset-0 grid-overlay-animated pointer-events-none opacity-60" />
                {/* Accent glows */}
                <div className="absolute top-[-30%] right-[-15%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[350px] h-[350px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="relative z-10 p-10 lg:p-14 max-w-3xl flex items-start gap-6"
                >
                  <motion.div variants={fadeUp} className="shrink-0 hidden sm:block">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-cyan-400/30">
                      <img src="/simroute-logo.png" alt="SimRouteAI" className="w-full h-full object-contain p-1.5" />
                    </div>
                  </motion.div>
                  <div>
                    <motion.div variants={fadeUp}>
                      <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                        Mission Critical AI
                      </div>
                    </motion.div>

                    <motion.h1
                      variants={fadeUp}
                      className={`text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] ${isDarkMode ? "text-white" : "text-slate-900"}`}
                    >
                      Offroad Semantic
                      <br />
                      Scene <span className="gradient-text glow-text">Segmentation</span>
                    </motion.h1>

                    <motion.p
                      variants={fadeUp}
                      className={`mt-5 text-base lg:text-lg leading-relaxed max-w-xl ${isDarkMode ? "text-white/70" : "text-slate-600"}`}
                    >
                      AI-powered pixel-level terrain classification for autonomous off-road
                      navigation. Deep learning meets desert environments.
                    </motion.p>

                    <motion.div variants={fadeUp} className="mt-8">
                      <motion.button
                        onClick={() => setActivePage("upload")}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-glow inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl
                                 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white font-semibold text-sm
                                 shadow-2xl shadow-cyan-500/25 cursor-pointer border border-cyan-400/20"
                      >
                        <Scan className="w-4 h-4" />
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.section>

              {/* ── KPI STAT CARDS ── */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5"
              >
                <motion.div ref={iouCounter.ref} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                  <Card className="glass-card overflow-hidden border-white/[0.06]">
                    <CardContent className="py-6 px-6 relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-[60px]" />
                      <div className="flex items-center gap-2 mb-3 relative">
                        <motion.div
                          whileHover={{ rotate: 12, scale: 1.05 }}
                          className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-400/20"
                        >
                          <Target className="w-4 h-4 text-cyan-400" />
                        </motion.div>
                        <span className="text-[11px] text-white/50 uppercase tracking-[0.1em] font-semibold">
                          Mean IoU
                        </span>
                      </div>
                      <p className="text-4xl font-black font-mono tracking-tight count-up dark:text-white text-content">
                        {iouCounter.value}
                      </p>
                      <p className="mt-1.5 text-xs text-white/50">Intersection over Union</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div ref={accCounter.ref} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                  <Card className="glass-card overflow-hidden border-white/[0.06]">
                    <CardContent className="py-6 px-6 relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-[60px]" />
                      <div className="flex items-center gap-2 mb-3 relative">
                        <motion.div
                          whileHover={{ rotate: 12, scale: 1.05 }}
                          className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-400/20"
                        >
                          <Layers className="w-4 h-4 text-emerald-400" />
                        </motion.div>
                        <span className="text-[11px] text-white/50 uppercase tracking-[0.1em] font-semibold">
                          Accuracy
                        </span>
                      </div>
                      <p className="text-4xl font-black font-mono tracking-tight count-up dark:text-white text-content">
                        {accCounter.value}%
                      </p>
                      <p className="mt-1.5 text-xs text-white/50">Global pixel accuracy</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div ref={dataCounter.ref} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                  <Card className="glass-card overflow-hidden border-white/[0.06]">
                    <CardContent className="py-6 px-6 relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-[60px]" />
                      <div className="flex items-center gap-2 mb-3 relative">
                        <motion.div
                          whileHover={{ rotate: 12, scale: 1.05 }}
                          className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-400/20"
                        >
                          <Database className="w-4 h-4 text-orange-400" />
                        </motion.div>
                        <span className="text-[11px] text-white/50 uppercase tracking-[0.1em] font-semibold">
                          Dataset
                        </span>
                      </div>
                      <p className="text-4xl font-black font-mono tracking-tight count-up dark:text-white text-content">
                        {dataCounter.value.toLocaleString()}+
                      </p>
                      <p className="mt-1.5 text-xs text-white/50">Synthetic training images</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.section>

              {/* ── TERRAIN CLASSES GRID ── */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-400/30"
                  >
                    <Route className="w-5 h-5 text-cyan-400" />
                  </motion.div>
                  <div>
                    <h2 className="text-lg font-bold dark:text-white text-slate-800">Target Terrain Classes</h2>
                    <p className="text-xs dark:text-white/50 text-slate-500">10 semantic categories for pixel-level classification</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {terrainClasses.map((cls, i) => (
                    <motion.div
                      key={cls.name}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04, type: "spring", stiffness: 300 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <Card className="glass-card group cursor-default border-white/[0.06]">
                        <CardContent className="py-3.5 px-4 flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-md shrink-0 transition-all duration-300
                                       group-hover:shadow-[0_0_12px_currentColor]"
                            style={{ backgroundColor: cls.color, color: cls.color }}
                          />
                          <span className="text-sm font-medium dark:text-white/90 text-slate-700">{cls.icon} {cls.name}</span>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* ── FOOTER ── */}
              <Footer isDarkMode={isDarkMode} />
            </motion.div>
          )}

          {/* ═══════════════ UPLOAD ═══════════════ */}
          {activePage === "upload" && (
            <motion.div
              key="upload"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="p-6 lg:p-10 min-h-[80vh]"
            >
              <ImageUploader
                onResult={setSegResult}
                onNavigateResults={() => setActivePage("results")}
              />
            </motion.div>
          )}

          {/* ═══════════════ RESULTS ═══════════════ */}
          {activePage === "results" && (
            <motion.div
              key="results"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="p-6 lg:p-10 min-h-[80vh]"
            >
              <ResultView result={segResult} />
            </motion.div>
          )}

          {/* ═══════════════ METRICS ═══════════════ */}
          {activePage === "metrics" && (
            <motion.div
              key="metrics"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="p-6 lg:p-10 min-h-[80vh]"
            >
              <MetricsCharts />
            </motion.div>
          )}

          {/* ═══════════════ ABOUT ═══════════════ */}
          {activePage === "about" && (
            <motion.div
              key="about"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 min-h-[80vh] flex flex-col items-center justify-center text-center"
            >
              <div className="space-y-3">
                <h2 className={`text-4xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-950"}`}>About This Project</h2>
                <p className={`text-xl max-w-2xl ${isDarkMode ? "text-white/60" : "text-slate-600"}`}>
                  The science behind autonomous off-road navigation.
                </p>
              </div>

              <Card className="glass-card overflow-hidden border-white/[0.06] w-full">
                <CardContent className="py-8 px-8 space-y-5">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-400/30">
                      <Globe className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Synthetic Data & Digital Twins</h3>
                  </div>
                  <p className={`leading-relaxed ${isDarkMode ? "text-white/70" : "text-slate-600"}`}>
                    Training robust AI models for complex offroad environments requires massive amounts of diverse, accurately labeled data. Generating this data in the physical world is often prohibitively expensive, time-consuming, and dangerous — particularly when dealing with extreme terrain, unpredictable lighting, and edge-case scenarios. Human annotation of pixel-level segmentation masks for nature scenes is also prone to massive inconsistencies.
                  </p>
                  <p className={`leading-relaxed ${isDarkMode ? "text-white/70" : "text-slate-600"}`}>
                    <strong className={isDarkMode ? "text-white" : "text-slate-900"}>Falcon Digital Twin by Duality AI</strong> solves this by creating ultra-realistic, physics-accurate desert simulations rendered in real-time. By leveraging <strong className={isDarkMode ? "text-white" : "text-slate-900"}>synthetic data</strong>, we programmatically generate pixel-perfect segmentation masks without annotation errors. This allows us to train our model on thousands of distinct environmental permutations (varying sun angles, rock distributions, vegetation density) — rapidly accelerating the AI pipeline and minimizing the Sim2Real semantic gap for robotics and autonomous vehicles.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card overflow-hidden border-white/[0.06] w-full">
                <CardContent className="py-8 px-8 space-y-5">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-400/30">
                      <Brain className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>State-of-the-Art AI Pipeline</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { step: "01", title: "Foundation Model", desc: "We utilize DINOv2 (Vision Transformer) from Meta Research as our backbone. Pre-trained using self-supervised learning on 142 million images, it instantly grasps complex visual features like depth, lighting, and semantic parts without requiring labeled data.", icon: Brain },
                      { step: "02", title: "ConvNeXt Decoder", desc: "A lightweight, modern Convolutional Neural Network (ConvNeXt) serves as the segmentation head. It is fine-tuned specifically on our synthetic dataset to decode DINOv2's high-dimensional patch embeddings into 10 distinct off-road terrain classes.", icon: Cpu },
                      { step: "03", title: "Real-time Inference", desc: "Our PyTorch/Flask backend computes pixel-level predictions on the fly using CUDA hardware acceleration. It dynamically blends the output masks over original images to guide path planning logic for autonomous rovers mapping uncharted territory.", icon: Scan },
                    ].map((item) => (
                      <motion.div
                        key={item.step}
                        whileHover={{ y: -4 }}
                        className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors h-full flex flex-col"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-black font-mono text-cyan-400">{item.step}</span>
                          <item.icon className={`w-4 h-4 ${isDarkMode ? "text-white/50" : "text-slate-400"}`} />
                        </div>
                        <h4 className={`text-base font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>{item.title}</h4>
                        <p className={`text-sm leading-relaxed ${isDarkMode ? "text-white/60" : "text-slate-500"}`}>{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card overflow-hidden border-white/[0.06] w-full">
                <CardContent className="py-8 px-8 space-y-5">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
                      <Layers className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Complete Technology Stack</h3>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {[
                      "PyTorch 2.0+", "DINOv2 ViT-S/14", "ConvNeXt Decoder", "Python 3.10", "Flask REST API", 
                      "OpenCV", "CUDA / cuDNN", "Next.js 15 App Router", "React 19", "TypeScript", 
                      "Tailwind CSS 3", "Framer Motion", "Recharts DataViz", "Lucide Icons", "Duality AI Falcon"
                    ].map((tag) => (
                      <motion.span
                        key={tag}
                        whileHover={{ scale: 1.05 }}
                        className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors cursor-default shadow-sm
                                   ${isDarkMode 
                                     ? "bg-white/5 border-white/10 text-white/80 hover:border-cyan-500/40 hover:bg-cyan-500/10" 
                                     : "bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-500/40 hover:bg-blue-50/50"}`}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
