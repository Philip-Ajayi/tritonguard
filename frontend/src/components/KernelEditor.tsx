"use client";

import React from "react";
import { Play, Sparkles, Code2, RotateCcw } from "lucide-react";
import { SampleKernel } from "@/types";

interface KernelEditorProps {
  code: string;
  onChangeCode: (code: string) => void;
  samples: SampleKernel[];
  onSelectSample: (sample: SampleKernel) => void;
  onRunAudit: () => void;
  onSynthesizeSwizzle: () => void;
  loadingAudit: boolean;
  loadingSwizzle: boolean;
}

export const KernelEditor: React.FC<KernelEditorProps> = ({
  code,
  onChangeCode,
  samples,
  onSelectSample,
  onRunAudit,
  onSynthesizeSwizzle,
  loadingAudit,
  loadingSwizzle,
}) => {
  return (
    <div className="bg-gpu-surface border border-gpu-border rounded-xl overflow-hidden flex flex-col h-full">
      {/* Editor Header Bar */}
      <div className="bg-gpu-bg border-b border-gpu-border px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code2 className="h-4 w-4 text-gpu-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Triton Kernel Source (Python AST)
          </span>
        </div>

        {/* Canonical Kernel Preset Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400">Presets:</span>
          <div className="flex space-x-1">
            {samples.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSample(s)}
                className="text-[11px] px-2 py-1 rounded bg-gpu-surface hover:bg-slate-800 text-slate-300 border border-gpu-border transition-all"
              >
                {s.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Code Textarea Area */}
      <div className="relative flex-1 min-h-[380px]">
        <textarea
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          spellCheck={false}
          className="w-full h-full bg-gpu-surface p-4 font-mono text-xs text-emerald-300/90 leading-relaxed resize-none focus:outline-none selection:bg-emerald-500/30"
          placeholder="Paste OpenAI Triton JIT kernel here..."
        />
      </div>

      {/* Action Footer */}
      <div className="bg-gpu-bg border-t border-gpu-border p-3 flex items-center justify-between">
        <div className="text-[11px] text-slate-500 font-mono">
          Tokens: ~{code.length / 4 | 0} | Compiler Target: Triton JIT
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRunAudit}
            disabled={loadingAudit}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-600 transition-all disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 text-blue-400" />
            <span>{loadingAudit ? "Analyzing AST..." : "Audit Memory Layout"}</span>
          </button>

          <button
            onClick={onSynthesizeSwizzle}
            disabled={loadingSwizzle}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gpu-accent hover:bg-emerald-600 text-black text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5 text-black" />
            <span>{loadingSwizzle ? "Synthesizing..." : "Synthesize Swizzle Patch"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
