"use client";

import React from "react";
import { ShieldCheck, Cpu, Terminal, ExternalLink, Zap } from "lucide-react";

interface NavbarProps {
  selectedArch: string;
  onSelectArch: (arch: string) => void;
  onOpenColabModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedArch,
  onSelectArch,
  onOpenColabModal
}) => {
  return (
    <nav className="border-b border-gpu-border bg-gpu-surface/80 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="h-9 w-9 rounded-lg bg-gpu-accent/20 border border-gpu-accent/50 flex items-center justify-center text-gpu-accent shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg tracking-tight text-white">TRITONGUARD</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              v1.0 Formal
            </span>
          </div>
          <p className="text-xs text-slate-400">Autonomous GPU Memory Invariant Verifier</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Hardware Target Selector */}
        <div className="flex items-center space-x-2 bg-gpu-bg border border-gpu-border px-3 py-1.5 rounded-lg text-xs">
          <Cpu className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-400">Target Arch:</span>
          <select
            value={selectedArch}
            onChange={(e) => onSelectArch(e.target.value)}
            className="bg-transparent text-white font-mono focus:outline-none cursor-pointer"
          >
            <option value="sm_75" className="bg-gpu-surface">NVIDIA Turing sm_75 (T4)</option>
            <option value="sm_80" className="bg-gpu-surface">NVIDIA Ampere sm_80 (A100)</option>
            <option value="sm_90" className="bg-gpu-surface">NVIDIA Hopper sm_90 (H100)</option>
          </select>
        </div>

        {/* Google Colab Free Tier Bridge */}
        <button
          onClick={onOpenColabModal}
          className="flex items-center space-x-1.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-all"
        >
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span>Google Colab T4 Bridge</span>
        </button>

        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 transition-colors"
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Documentation</span>
        </a>
      </div>
    </nav>
  );
};
