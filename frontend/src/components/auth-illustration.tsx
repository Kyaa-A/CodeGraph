"use client";

import { motion } from "framer-motion";

// Login Illustration
export function LoginIllustration() {
  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center">
      <svg viewBox="0 0 500 500" className="w-full h-full max-w-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="loginGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="loginGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Background Orbs */}
        <motion.circle 
          cx="100" cy="100" r="80" 
          fill="url(#loginGrad1)"
          initial={{ y: 20 }}
          animate={{ y: [-10, 20, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle 
          cx="400" cy="400" r="100" 
          fill="url(#loginGrad2)"
          initial={{ y: -20 }}
          animate={{ y: [20, -10, 20] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Central Computer/Device */}
        <motion.g
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Monitor */}
          <rect x="150" y="180" width="200" height="140" rx="12" fill="white" stroke="#e2e8f0" strokeWidth="2" />
          <rect x="160" y="190" width="180" height="110" rx="4" fill="#f8fafc" />
          
          {/* Screen Content */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <rect x="175" y="205" width="100" height="8" rx="2" fill="#e2e8f0" />
            <rect x="175" y="220" width="80" height="6" rx="2" fill="#cbd5e1" />
            <rect x="175" y="232" width="120" height="6" rx="2" fill="#cbd5e1" />
            <rect x="175" y="244" width="90" height="6" rx="2" fill="#cbd5e1" />
            
            {/* Code lines */}
            <rect x="175" y="265" width="40" height="6" rx="2" fill="#fbbf24" />
            <rect x="220" y="265" width="30" height="6" rx="2" fill="#38bdf8" />
            <rect x="175" y="277" width="60" height="6" rx="2" fill="#22c55e" />
          </motion.g>
          
          {/* Monitor Stand */}
          <path d="M230 320h40v10h-40z" fill="#e2e8f0" />
          <path d="M210 330h80v8a4 4 0 01-4 4h-72a4 4 0 01-4-4z" fill="#cbd5e1" />
          
          {/* Lock Icon on Screen */}
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 200 }}
          >
            <circle cx="250" cy="245" r="25" fill="#fbbf24" fillOpacity="0.2" />
            <rect x="240" y="238" width="20" height="16" rx="2" fill="#f59e0b" />
            <path d="M245 238v-4a5 5 0 0110 0v4" stroke="#f59e0b" strokeWidth="2" fill="none" />
            <circle cx="250" cy="246" r="2" fill="white" />
          </motion.g>
        </motion.g>
        
        {/* Floating Elements */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "250px 250px" }}
        >
          {/* Checkmark */}
          <g transform="translate(80, 200)">
            <circle cx="0" cy="0" r="15" fill="#22c55e" fillOpacity="0.9" />
            <path d="M-5 0l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          
          {/* Code Bracket */}
          <g transform="translate(420, 150)">
            <rect x="-15" y="-20" width="30" height="40" rx="4" fill="#38bdf8" fillOpacity="0.9" />
            <path d="M-5-8l-4 8 4 8M5-8l4 8-4 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          
          {/* Key */}
          <g transform="translate(100, 380)">
            <circle cx="0" cy="0" r="15" fill="#a855f7" fillOpacity="0.9" />
            <circle cx="0" cy="0" r="4" fill="white" />
            <path d="M8 0h6M11-3v6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </g>
        </motion.g>
        
        {/* Connection Lines */}
        <motion.path 
          d="M80 200q30-50 70-20M420 150q-50-30-70 20M100 380q30 30 70 20"
          stroke="#94a3b8" 
          strokeWidth="1.5" 
          strokeDasharray="5,5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1 }}
        />
      </svg>
    </div>
  );
}

// Signup Illustration
export function SignupIllustration() {
  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center">
      <svg viewBox="0 0 500 500" className="w-full h-full max-w-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="signupGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="signupGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Background Orbs */}
        <motion.circle 
          cx="120" cy="120" r="70" 
          fill="url(#signupGrad1)"
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle 
          cx="380" cy="380" r="90" 
          fill="url(#signupGrad2)"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 0.9, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* User Profiles Stack */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background User */}
          <motion.g
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <rect x="140" y="160" width="100" height="130" rx="12" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2" />
            <circle cx="190" cy="200" r="20" fill="#cbd5e1" />
            <circle cx="190" cy="195" r="8" fill="#94a3b8" />
            <path d="M175 215q15 8 30 0" stroke="#94a3b8" strokeWidth="2" fill="none" />
            <rect x="160" y="235" width="60" height="6" rx="2" fill="#cbd5e1" />
            <rect x="170" y="247" width="40" height="4" rx="2" fill="#e2e8f0" />
          </motion.g>
          
          {/* Main User Card */}
          <motion.g
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <rect x="200" y="180" width="120" height="150" rx="16" fill="white" stroke="#fbbf24" strokeWidth="2" filter="url(#glow)" />
            <rect x="210" y="190" width="100" height="130" rx="10" fill="#fffbeb" />
            
            {/* User Avatar */}
            <circle cx="260" cy="230" r="28" fill="url(#signupGrad1)" />
            <circle cx="260" cy="220" r="10" fill="#f59e0b" />
            <path d="M240 245q20 12 40 0" stroke="#f59e0b" strokeWidth="2" fill="none" />
            
            {/* User Info */}
            <rect x="225" y="270" width="70" height="8" rx="2" fill="#fbbf24" />
            <rect x="240" y="285" width="40" height="4" rx="2" fill="#fcd34d" />
            
            {/* Verified Badge */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
            >
              <circle cx="288" cy="206" r="12" fill="#22c55e" />
              <path d="M283 206l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.g>
          </motion.g>
          
          {/* Secondary User */}
          <motion.g
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <rect x="320" y="170" width="90" height="120" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
            <circle cx="365" cy="210" r="18" fill="#e2e8f0" />
            <circle cx="365" cy="205" r="7" fill="#94a3b8" />
            <rect x="340" y="240" width="50" height="5" rx="2" fill="#cbd5e1" />
          </motion.g>
        </motion.g>
        
        {/* Floating Badges */}
        <motion.g
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <g transform="translate(100, 320)">
            <rect x="-30" y="-15" width="60" height="30" rx="15" fill="#fbbf24" fillOpacity="0.9" />
            <text x="0" y="4" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">AI</text>
          </g>
        </motion.g>
        
        <motion.g
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <g transform="translate(400, 180)">
            <rect x="-35" y="-15" width="70" height="30" rx="15" fill="#38bdf8" fillOpacity="0.9" />
            <text x="0" y="4" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">PRO</text>
          </g>
        </motion.g>
        
        {/* Rocket Launch */}
        <motion.g
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, type: "spring" }}
        >
          <g transform="translate(380, 280)">
            <path d="M0-20l8 20h-16z" fill="#f59e0b" />
            <circle cx="0" cy="-20" r="4" fill="#fbbf24" />
            <motion.path 
              d="M-4 0l-2 10M4 0l2 10" 
              stroke="#ef4444" 
              strokeWidth="2" 
              strokeLinecap="round"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </g>
        </motion.g>
      </svg>
    </div>
  );
}

// Dashboard Welcome Illustration
export function DashboardWelcomeIllustration() {
  return (
    <div className="relative w-full h-full min-h-[200px]">
      <svg viewBox="0 0 400 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Background */}
        <ellipse cx="320" cy="100" rx="60" ry="60" fill="url(#dashGrad)" />
        
        {/* Trophy */}
        <motion.g
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          transform="translate(300, 60)"
        >
          <path d="M10 0h20v8c0 11-7 20-16 22v8h8v4H18v-4h8v-8C17 28 10 19 10 8z" fill="#fbbf24" />
          <path d="M5 2v6c0 8 5 15 12 17" stroke="#f59e0b" strokeWidth="2" fill="none" />
          <path d="M35 2v6c0 8-5 15-12 17" stroke="#f59e0b" strokeWidth="2" fill="none" />
          <rect x="12" y="32" width="16" height="4" fill="#d97706" />
          <circle cx="20" cy="24" r="3" fill="#fde68a" />
        </motion.g>
        
        {/* Progress Rings */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          transform="translate(360, 140)"
        >
          <circle cx="0" cy="0" r="20" fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="30 30" />
        </motion.g>
        
        {/* Chart Bars */}
        <motion.g
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          transform="translate(260, 130)"
          style={{ transformOrigin: "0 0" }}
        >
          <rect x="0" y="20" width="12" height="30" rx="2" fill="#22c55e" />
          <rect x="18" y="10" width="12" height="40" rx="2" fill="#fbbf24" />
          <rect x="36" y="0" width="12" height="50" rx="2" fill="#38bdf8" />
        </motion.g>
      </svg>
    </div>
  );
}
