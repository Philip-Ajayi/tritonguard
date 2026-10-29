
"use client";

import React from "react";
import { ShieldCheck, Cpu, Terminal, Zap } from "lucide-react";

interface NavbarProps {
  selectedArch: string;
  onSelectArch: (arch: string) => void;
  onOpenColabModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedArch,
  onSelectArch,
  onOpenColabModal,
}) => {
  return (
    <nav className="sticky top-0 z-50 border-b border-gpu-border px-6 py-3 flex items-center justify-between gap-5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-400/[0.09] border border-emerald-400/25 flex items-center justify-center text-emerald-300">
          <ShieldCheck className="h-5 w-5" strokeWidth={1.8} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[15px] tracking-[-0.035em] text-white">
              TritonGuard
            </span>
            <span className="text-[10px] font-mono text-slate-500 border border-gpu-border rounded-md px-1.5 py-0.5">
              v1.0
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            GPU memory verification
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 bg-gpu-bg border border-gpu-border px-3 py-2 rounded-lg text-xs">
          <Cpu className="h-4 w-4 text-slate-500 shrink-0" />

          <label htmlFor="target-architecture" className="text-slate-400">
            Hardware
          </label>

          <select
            id="target-architecture"
            value={selectedArch}
            onChange={(e) => onSelectArch(e.target.value)}
            className="max-w-[190px] bg-transparent text-slate-200 font-mono text-xs focus:outline-none cursor-pointer"
          >
            <option value="sm_75" className="bg-gpu-surface">
              T4 · sm_75
            </option>
            <option value="sm_80" className="bg-gpu-surface">
              A100 · sm_80
            </option>
            <option value="sm_90" className="bg-gpu-surface">
              H100 · sm_90
            </option>
          </select>
        </div>

        <button
          onClick={onOpenColabModal}
          className="flex items-center gap-2 text-xs font-medium text-amber-200 bg-amber-400/[0.07] hover:bg-amber-400/[0.13] border border-amber-400/20 px-3 py-2 rounded-lg"
        >
          <Zap className="h-3.5 w-3.5 text-amber-300" />
          <span>Connect GPU</span>
        </button>

        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-2 px-1 py-2"
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Docs</span>
        </a>
      </div>
    </nav>
  );
};
