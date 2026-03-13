"use client";

import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Globe, Mail } from "lucide-react";

export default function Footer({ isDarkMode = true }: { isDarkMode?: boolean }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`relative mt-auto py-12 px-6 border-t transition-colors overflow-hidden
                       ${isDarkMode ? "border-white/[0.06] bg-black/20 backdrop-blur-md" : "border-slate-100 bg-white/60 backdrop-blur-lg"}`}>
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10 relative z-10">
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 ring-1 ring-cyan-400/20">
              <img src="/simroute-logo.png" alt="SimRouteAI" className="w-full h-full object-contain p-1" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              SimRoute<span className="text-cyan-400">.AI</span>
            </span>
          </div>
          <p className={`text-sm leading-relaxed ${isDarkMode ? "text-white/50" : "text-slate-600"}`}>
            Leading the frontier of autonomous off-road navigation with advanced 
            semantic scene understanding and synthetic data simulation.
          </p>
          <div className={`flex items-center gap-4 ${isDarkMode ? "text-white/40" : "text-slate-400"}`}>
            <motion.a whileHover={{ y: -2, color: isDarkMode ? "#fff" : "#0f172a" }} href="#" className="transition-colors"><Github className="w-4 h-4" /></motion.a>
            <motion.a whileHover={{ y: -2, color: isDarkMode ? "#fff" : "#0f172a" }} href="#" className="transition-colors"><Twitter className="w-4 h-4" /></motion.a>
            <motion.a whileHover={{ y: -2, color: isDarkMode ? "#fff" : "#0f172a" }} href="#" className="transition-colors"><Linkedin className="w-4 h-4" /></motion.a>
            <motion.a whileHover={{ y: -2, color: isDarkMode ? "#fff" : "#0f172a" }} href="#" className="transition-colors"><Mail className="w-4 h-4" /></motion.a>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 md:gap-16">
          <div className="space-y-4">
            <h4 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? "text-cyan-400/80" : "text-blue-600"}`}>Platform</h4>
            <ul className={`space-y-2 text-sm ${isDarkMode ? "text-white/40" : "text-slate-500"}`}>
              <li><a href="#" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Documentation</a></li>
              <li><a href="#" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>API Reference</a></li>
              <li><a href="#" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Model Specs</a></li>
              <li><a href="#" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Pricing</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? "text-cyan-400/80" : "text-blue-600"}`}>Resources</h4>
            <ul className={`space-y-2 text-sm ${isDarkMode ? "text-white/40" : "text-slate-500"}`}>
              <li><a href="#" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Research Paper</a></li>
              <li><a href="#" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Case Studies</a></li>
              <li><a href="#" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Blog</a></li>
              <li><a href="#" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Status</a></li>
            </ul>
          </div>
          <div className="space-y-4 col-span-2 sm:col-span-1">
            <h4 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? "text-cyan-400/80" : "text-blue-600"}`}>Legal</h4>
            <ul className={`space-y-2 text-sm ${isDarkMode ? "text-white/40" : "text-slate-500"}`}>
              <li><a href="#" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Privacy Policy</a></li>
              <li><a href="#" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Terms of Service</a></li>
              <li><a href="#" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Security</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-xs transition-colors relative z-10
                      ${isDarkMode ? "border-white/[0.04] text-white/30" : "border-slate-100 text-slate-400"}`}>
        <p>© {currentYear} SimRoute.AI — All Rights Reserved.</p>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            Global Edge Network
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400/50">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-pulse" />
            Systems Operational
          </span>
        </div>
      </div>
    </footer>
  );
}
