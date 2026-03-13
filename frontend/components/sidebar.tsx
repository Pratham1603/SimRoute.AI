"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  Image as ImageIcon,
  BarChart3,
  Info,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Menu,
  X,
  Home,
  Moon,
  Sun,
} from "lucide-react";

/** Navigation items */
const NAV_ITEMS = [
  { id: "landing", label: "Home", icon: Home },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "upload", label: "Upload Image", icon: Upload },
  { id: "results", label: "Results", icon: ImageIcon },
  { id: "metrics", label: "Metrics", icon: BarChart3 },
  { id: "about", label: "About", icon: Info },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ activePage, onNavigate, isDarkMode = true }: SidebarProps & { isDarkMode?: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Brand Header with Logo */}
      <div className={`flex items-center gap-3 px-5 py-6 border-b transition-colors ${isDarkMode ? "border-white/[0.06]" : "border-slate-100"}`}>
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden shrink-0">
          <img
            src="/simroute-logo.png"
            alt="SimRouteAI"
            className="w-full h-full object-contain p-1"
          />
          <div className="absolute inset-0 rounded-xl ring-1 ring-cyan-400/20" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="min-w-0"
          >
            <h1 className="text-base font-bold tracking-tight leading-none">
              SimRoute<span className="text-cyan-400">.AI</span>
            </h1>
            <p className={`text-[10px] mt-0.5 tracking-wider uppercase truncate font-medium
                          ${isDarkMode ? "text-white/40" : "text-slate-400"}`}>
              Offroad Segmentation
            </p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNav(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-300 cursor-pointer relative overflow-hidden group
                ${
                  isActive
                    ? "text-cyan-400"
                    : isDarkMode ? "text-white/50 hover:text-white/90" : "text-slate-600 hover:text-slate-900"
                }
              `}
            >
              {/* Active background glow */}
              {isActive && (
                <motion.div
                  layoutId="nav-active-bg"
                  className="absolute inset-0 rounded-xl bg-white/[0.08]"
                  style={{
                    boxShadow: "inset 0 0 20px rgba(6, 182, 212, 0.08), 0 0 30px rgba(6, 182, 212, 0.05)",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              {/* Neon left indicator */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-cyan-400"
                  style={{
                    boxShadow: "0 0 8px rgba(6, 182, 212, 0.6), 0 0 20px rgba(6, 182, 212, 0.3)",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              {/* Icon with transition */}
              <motion.div
                animate={{ rotate: isActive ? 0 : 0, scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                <item.icon className={`w-[18px] h-[18px] shrink-0 transition-colors duration-300
                  ${isActive ? "text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]" : "group-hover:text-white/80"}
                `} />
              </motion.div>

              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative z-10"
                >
                  {item.label}
                </motion.span>
              )}

              {/* Active dot on the right */}
              {isActive && !collapsed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`ml-auto w-1.5 h-1.5 rounded-full relative z-10 
                            ${isDarkMode ? "bg-cyan-400" : "bg-blue-600"}`}
                  style={{
                    boxShadow: isDarkMode ? "0 0 6px rgba(6, 182, 212, 0.6)" : "none",
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Status Footer */}
      {!collapsed && (
        <div className="px-5 py-4 border-t border-white/[0.06] space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-white/35">
            <span className="relative w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
              <span className="absolute inset-0 rounded-full bg-emerald-400" />
            </span>
            API Online
          </div>
          <div className="flex items-center gap-2.5 text-xs text-white/35">
            <span className="relative w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-orange-400 animate-pulse" />
            </span>
            GPU Ready
          </div>
          <div className={`mt-3 px-3 py-2 rounded-lg border transition-colors
                          ${isDarkMode ? "bg-white/[0.04] border-white/[0.06]" : "bg-slate-50 border-slate-200"}`}>
            <p className={`text-[10px] uppercase tracking-wider ${isDarkMode ? "text-white/30" : "text-slate-400"}`}>Model</p>
            <p className={`text-xs font-mono mt-0.5 ${isDarkMode ? "text-white/60" : "text-slate-600"}`}>DeepLab v3+ ResNet101</p>
          </div>
        </div>
      )}

      {/* Collapse Toggle (Desktop) */}
      <div className="mt-auto border-t border-white/[0.06] flex flex-col">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-4 text-white/30 
                     hover:text-white/70 transition-colors cursor-pointer items-center justify-center"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-[60] p-2 rounded-xl glass-dark text-white cursor-pointer"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        className={`
          sidebar-desktop fixed top-0 left-0 h-screen z-[56] flex flex-col
          transition-all duration-300 overflow-hidden
          border-r
          ${isDarkMode 
            ? "bg-[#0a0f1e] text-white border-white/[0.06]" 
            : "bg-white text-slate-900 border-slate-200"}
          ${mobileOpen ? "open" : ""}
        `}
        style={{
          boxShadow: isDarkMode 
            ? "4px 0 30px rgba(0, 0, 0, 0.4), 1px 0 0 rgba(6, 182, 212, 0.08)"
            : "4px 0 30px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden absolute top-4 right-4 text-white/50 hover:text-white z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {sidebarContent}
      </motion.aside>
    </>
  );
}
