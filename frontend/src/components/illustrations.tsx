"use client";

import { motion } from "framer-motion";

// Hero Illustration - Learning & AI Theme
export function HeroIllustration() {
  return (
    <div className="relative w-full h-full min-h-[400px]">
      <svg viewBox="0 0 500 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background Gradient Orbs */}
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.05" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Floating Orbs */}
        <motion.circle 
          cx="80" cy="80" r="60" 
          fill="url(#grad1)"
          initial={{ y: 0 }}
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle 
          cx="420" cy="320" r="80" 
          fill="url(#grad2)"
          initial={{ y: 0 }}
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Central Learning Hub */}
        <motion.g 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Main Circle */}
          <circle cx="250" cy="200" r="120" fill="white" fillOpacity="0.8" stroke="#fbbf24" strokeWidth="2" />
          
          {/* Brain/AI Icon */}
          <path 
            d="M200 180c0-20 15-35 35-35s35 15 35 35c0 15-10 25-20 30v15h-30v-15c-10-5-20-15-20-30z" 
            stroke="#f59e0b" 
            strokeWidth="3" 
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="235" cy="175" r="4" fill="#f59e0b" />
          <circle cx="265" cy="175" r="4" fill="#f59e0b" />
          <path d="M240 195q10 5 20 0" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" />
          
          {/* Connection Lines */}
          <motion.path 
            d="M150 150l-30-20M350 150l30-20M150 250l-30 20M350 250l30 20"
            stroke="#94a3b8" 
            strokeWidth="2" 
            strokeDasharray="5,5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
        </motion.g>
        
        {/* Orbiting Elements */}
        <motion.g 
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "250px 200px" }}
        >
          {/* Book Icon */}
          <g transform="translate(130, 80)">
            <rect x="0" y="0" width="40" height="50" rx="5" fill="#fbbf24" fillOpacity="0.9" />
            <path d="M8 10h24M8 20h24M8 30h20" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </g>
          
          {/* Code Icon */}
          <g transform="translate(330, 80)">
            <rect x="0" y="0" width="40" height="50" rx="5" fill="#38bdf8" fillOpacity="0.9" />
            <path d="M12 18l-4 7 4 7M28 18l4 7-4 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          
          {/* Check Icon */}
          <g transform="translate(130, 270)">
            <rect x="0" y="0" width="40" height="50" rx="5" fill="#22c55e" fillOpacity="0.9" />
            <path d="M10 25l7 7 13-14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          
          {/* Chat Icon */}
          <g transform="translate(330, 270)">
            <rect x="0" y="0" width="40" height="50" rx="5" fill="#a855f7" fillOpacity="0.9" />
            <path d="M10 15h20M10 25h15M10 35h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </g>
        </motion.g>
        
        {/* Floating Code Snippets */}
        <motion.text 
          x="50" y="350" 
          fill="#94a3b8" 
          fontSize="12" 
          fontFamily="monospace"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          {"{ learn: true }"}
        </motion.text>
        <motion.text 
          x="380" y="50" 
          fill="#94a3b8" 
          fontSize="12" 
          fontFamily="monospace"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
        >
          {"const AI = help()"}
        </motion.text>
      </svg>
    </div>
  );
}

// Course Placeholder Thumbnail
export function CoursePlaceholder({ letter = "C", color = "amber" }: { letter?: string; color?: "amber" | "blue" | "green" | "purple" }) {
  const colors = {
    amber: { bg: "#fbbf24", gradient: "from-amber-400 to-amber-600" },
    blue: { bg: "#38bdf8", gradient: "from-blue-400 to-blue-600" },
    green: { bg: "#22c55e", gradient: "from-green-400 to-green-600" },
    purple: { bg: "#a855f7", gradient: "from-purple-400 to-purple-600" },
  };
  
  const c = colors[color];
  
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br opacity-20 blur-2xl" style={{ background: `linear-gradient(135deg, ${c.bg}, transparent)` }} />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-gradient-to-tr opacity-20 blur-xl" style={{ background: `linear-gradient(45deg, ${c.bg}, transparent)` }} />
      
      {/* Central Icon */}
      <div className={`relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-xl`}>
        <span className="text-3xl font-bold text-white font-heading">{letter}</span>
        
        {/* Shine Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/30 to-transparent" />
      </div>
      
      {/* Decorative Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 100L100 0" stroke="currentColor" strokeWidth="0.5" />
        <path d="M20 100L100 20" stroke="currentColor" strokeWidth="0.5" />
        <path d="M40 100L100 40" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

// Empty State Illustration
export function EmptyStateIllustration({ type = "courses" }: { type?: "courses" | "lessons" | "search" }) {
  const illustrations = {
    courses: {
      icon: (
        <g>
          <rect x="30" y="20" width="60" height="80" rx="4" fill="none" stroke="#fbbf24" strokeWidth="3" />
          <path d="M40 40h40M40 55h40M40 70h30" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="90" r="8" fill="#fbbf24" />
        </g>
      ),
      title: "No courses yet",
    },
    lessons: {
      icon: (
        <g>
          <rect x="30" y="30" width="60" height="60" rx="4" fill="none" stroke="#38bdf8" strokeWidth="3" />
          <path d="M45 50l10 10 20-20" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ),
      title: "No lessons yet",
    },
    search: {
      icon: (
        <g>
          <circle cx="55" cy="50" r="20" fill="none" stroke="#a855f7" strokeWidth="3" />
          <path d="M70 65l15 15" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
        </g>
      ),
      title: "No results found",
    },
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div 
        className="w-32 h-32 relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-transparent rounded-3xl" />
        <svg viewBox="0 0 120 120" className="w-full h-full relative z-10">
          {illustrations[type].icon}
        </svg>
      </motion.div>
    </div>
  );
}

// Feature Card Icon
export function FeatureIcon({ type }: { type: "ai" | "interactive" | "track" | "community" }) {
  const icons = {
    ai: (
      <svg viewBox="0 0 64 64" className="w-12 h-12">
        <defs>
          <linearGradient id="ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <rect x="12" y="12" width="40" height="40" rx="10" fill="url(#ai-grad)" />
        <path d="M24 28c0-4 3-7 8-7s8 3 8 7c0 3-2 5-4 6v3h-8v-3c-2-1-4-3-4-6z" fill="white" />
        <circle cx="30" cy="26" r="1.5" fill="#f59e0b" />
        <circle cx="34" cy="26" r="1.5" fill="#f59e0b" />
        <path d="M28 34q4 2 8 0" stroke="#f59e0b" strokeWidth="1" fill="none" />
      </svg>
    ),
    interactive: (
      <svg viewBox="0 0 64 64" className="w-12 h-12">
        <defs>
          <linearGradient id="int-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <rect x="12" y="12" width="40" height="40" rx="10" fill="url(#int-grad)" />
        <rect x="20" y="24" width="24" height="20" rx="3" fill="white" />
        <path d="M24 30l-4 8h24l-4-8-4 4-4-4-4 4z" fill="#0ea5e9" />
      </svg>
    ),
    track: (
      <svg viewBox="0 0 64 64" className="w-12 h-12">
        <defs>
          <linearGradient id="track-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        <rect x="12" y="12" width="40" height="40" rx="10" fill="url(#track-grad)" />
        <path d="M20 36l8 8 16-16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="44" cy="22" r="4" fill="white" />
      </svg>
    ),
    community: (
      <svg viewBox="0 0 64 64" className="w-12 h-12">
        <defs>
          <linearGradient id="comm-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <rect x="12" y="12" width="40" height="40" rx="10" fill="url(#comm-grad)" />
        <circle cx="26" cy="26" r="5" fill="white" />
        <circle cx="38" cy="26" r="5" fill="white" />
        <circle cx="32" cy="38" r="5" fill="white" />
        <path d="M26 31c-3 0-6 2-6 5M38 31c3 0 6 2 6 5M32 43c-4 0-8 2-8 6h16c0-4-4-6-8-6z" stroke="white" strokeWidth="2" fill="none" />
      </svg>
    ),
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 3 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {icons[type]}
    </motion.div>
  );
}

// Loading Animation
export function LoadingAnimation({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-16 h-16" };
  
  return (
    <div className={`relative ${sizes[size]}`}>
      <motion.div
        className="absolute inset-0 rounded-xl border-4 border-amber-200 border-t-amber-500"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-amber-600">AI</span>
      </div>
    </div>
  );
}

// Success Animation
export function SuccessAnimation() {
  return (
    <motion.svg 
      viewBox="0 0 100 100" 
      className="w-20 h-20"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <motion.circle 
        cx="50" cy="50" r="40" 
        fill="#22c55e"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path 
        d="M30 52l13 13 27-27" 
        stroke="white" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </motion.svg>
  );
}

// Background Pattern
export function BackgroundPattern() {
  return (
    <svg 
      className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}
