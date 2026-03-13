"use client";

import { motion } from "framer-motion";
import {
  Database,
  Brain,
  Layers,
  Map,
  Navigation,
  Scan,
  Upload,
  ArrowRight,
  Zap,
  Cpu,
} from "lucide-react";
import HeroVideoBackground from "./hero-video-background";
import Footer from "./footer";

const FEATURES = [
  {
    step: "01",
    title: "Data Ingestion",
    desc: "Synthetic desert imagery with pixel-perfect ground truth labels.",
    icon: Database,
  },
  {
    step: "02",
    title: "Deep Learning Model",
    desc: "DeepLab v3+ with ResNet-101 backbone for robust feature extraction.",
    icon: Brain,
  },
  {
    step: "03",
    title: "Semantic Segmentation",
    desc: "Pixel-level classification across 10 terrain categories.",
    icon: Layers,
  },
  {
    step: "04",
    title: "Terrain Understanding",
    desc: "Real-time interpretation of rocks, vegetation, and obstacles.",
    icon: Map,
  },
  {
    step: "05",
    title: "Autonomous Navigation",
    desc: "Path planning and safe navigation decisions for off-road vehicles.",
    icon: Navigation,
  },
];

const fadeUp: any = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
};

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <motion.div
      key="landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 lg:px-16 pt-20 pb-32">
        {/* Premium Full-Image Hero Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Base Image with Aggressive Dry Desert Filter (removes green) */}
          <img 
            src="/hero-image.png" 
            alt="SimRouteAI Hero Visualization" 
            className="w-full h-full object-cover filter saturate-[0.7] sepia-[0.6] hue-rotate-[-30deg] brightness-[0.9] opacity-80"
          />
          
          {/* Procedural AI perception layer (Scanning lines & Masks) */}
          <HeroVideoBackground />

          {/* Enhanced readability overlay for landing page */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/90" 
            aria-hidden 
          />
          {/* Extra deep transition layer for section blending */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" 
            aria-hidden 
          />
        </div>

        {/* Logo + Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 flex items-center gap-4 mb-12"
        >
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0">
            <img
              src="/simroute-logo.png"
              alt="SimRouteAI"
              className="w-full h-full object-contain p-2"
            />
            <div className="absolute inset-0 rounded-2xl ring-2 ring-cyan-400/30 ring-offset-2 ring-offset-transparent" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-7xl font-black tracking-tight text-white leading-tight">
              SimRoute<span className="text-cyan-400">.AI</span>
            </h1>
            <p className="text-base lg:text-lg text-cyan-300 font-bold mt-1 tracking-wide uppercase">
              AI-Powered Off-Road Terrain Understanding
            </p>
          </div>
        </motion.div>

        {/* Hero Text */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.p
            {...fadeUp}
            transition={{ delay: 0.2 }}
            className="text-xl lg:text-3xl text-white font-medium text-center max-w-3xl mb-6 leading-relaxed"
          >
            Autonomous off-road navigation powered by advanced 
            pixel-level semantic segmentation.
          </motion.p>
          <motion.p
            {...fadeUp}
            transition={{ delay: 0.3 }}
            className="text-base lg:text-lg text-white/70 text-center max-w-2xl mb-12 leading-relaxed"
          >
            Developing robust AI to interpret complex desert environments — from shifting dunes 
            to dry vegetation and rocky terrain.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-5"
          >
            <motion.button
              onClick={() => onNavigate("upload")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-10 py-4.5 rounded-2xl
                       bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg
                       shadow-[0_20px_50px_rgba(8,145,178,0.3)] border border-cyan-400/30
                       hover:shadow-[0_20px_60px_rgba(8,145,178,0.4)] transition-all cursor-pointer"
            >
              <Scan className="w-5 h-5" />
              Try Live Demo
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => onNavigate("upload")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-10 py-4.5 rounded-2xl
                       bg-white/10 backdrop-blur-md text-white font-bold text-lg
                       border border-white/20 hover:bg-white/20 hover:border-cyan-500/50
                       transition-all cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              Upload Image
            </motion.button>
          </motion.div>

          {/* Enter Dashboard link */}
          <motion.button
            onClick={() => onNavigate("dashboard")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 text-sm font-bold text-white/40 hover:text-cyan-400 transition-colors cursor-pointer
                     flex items-center gap-2 group uppercase tracking-widest"
          >
            <span>Enter Pro Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </section>

      {/* ═══════════ FEATURE SECTION ═══════════ */}
      <section className="relative px-6 lg:px-16 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 dark:text-white text-slate-900">
            AI Perception Pipeline
          </h2>
          <p className="max-w-xl mx-auto dark:text-white/60 text-slate-600">
            From raw imagery to autonomous navigation decisions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="glass-card rounded-2xl p-6 border border-white/[0.06] relative
                       hover:border-cyan-500/30 transition-colors group cursor-default"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center
                           border border-cyan-400/20 group-hover:border-cyan-400/40"
                >
                  <feature.icon className="w-6 h-6 text-cyan-400" />
                </motion.div>
                <span className="text-xs font-black font-mono text-cyan-400/80">
                  {feature.step}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white text-slate-800">{feature.title}</h3>
              <p className="text-sm leading-relaxed dark:text-white/60 text-slate-600">
                {feature.desc}
              </p>
              {i < FEATURES.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA to Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            onClick={() => onNavigate("dashboard")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                     bg-white/5 border border-white/10 text-white/80 hover:border-cyan-500/50
                     hover:text-cyan-400 transition-all cursor-pointer text-sm font-medium"
          >
            <Zap className="w-4 h-4" />
            View Full Dashboard
          </motion.button>
        </motion.div>
      </section>

      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(10,15,30,0.9), transparent)",
        }}
      />

      <Footer />
    </motion.div>
  );
}
