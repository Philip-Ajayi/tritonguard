
"use client";

import React from "react";
import { Play, Sparkles, Code2 } from "lucide-react";
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
    <section className="bg-gpu-surface border border-gpu-border rounded-xl overflow-hidden flex flex-col min-w-0 h-full">
      <div className="px-4 py-3.5 border-b border-gpu-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gpu-bg border border-gpu-border flex items-center justify-center">
            <Code2 className="h-4 w-4 text-emerald-300" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Kernel editor
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Python · Triton JIT
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 border border-gpu-border rounded-md px-2 py-1">
          Source
        </span>
      </div>

      {samples.length > 0 && (
        <div className="px-4 py-3 border-b border-gpu-border/70 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-500 mr-1">
            Examples
          </span>

          {samples.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSample(s)}
              className="text-[11px] px-2.5 py-1.5 rounded-md bg-gpu-bg hover:bg-slate-800 text-slate-300 border border-gpu-border hover:border-slate-600"
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 min-h-[380px] bg-[#0b1016]">
        <div className="absolute top-3 right-4 text-[10px] font-mono text-slate-600 pointer-events-none">
          {code.split("\n").length} lines
        </div>

        <textarea
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          spellCheck={false}
          aria-label="Triton kernel source code"
          className="w-full h-full min-h-[380px] bg-transparent p-5 pt-9 font-mono text-xs text-emerald-100/90 leading-7 resize-y focus:outline-none selection:bg-emerald-500/30"
          placeholder="Paste your Triton kernel here..."
        />
      </div>

      <div className="px-4 py-3.5 border-t border-gpu-border bg-[#0e131a]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[10px] font-mono text-slate-500">
            <span>{code.length.toLocaleString()} characters</span>
            <span className="mx-2 text-slate-700">/</span>
            <span>Compiler: Triton JIT</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onRunAudit}
              disabled={loadingAudit}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium border border-slate-700"
            >
              <Play className="h-3.5 w-3.5 text-slate-300" />
              <span>{loadingAudit ? "Inspecting..." : "Inspect memory"}</span>
            </button>

            <button
              onClick={onSynthesizeSwizzle}
              disabled={loadingSwizzle}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-gpu-accent text-xs font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {loadingSwizzle ? "Generating..." : "Optimize layout"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
