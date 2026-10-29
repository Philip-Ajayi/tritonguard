
"use client";

import React from "react";
import { Check, Copy, ShieldCheck } from "lucide-react";

interface SwizzleDiffViewerProps {
  originalCode: string;
  patchedCode: string;
  proofDescription: string;
}

export const SwizzleDiffViewer: React.FC<SwizzleDiffViewerProps> = ({
  originalCode,
  patchedCode,
  proofDescription,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(patchedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-gpu-surface border border-gpu-border rounded-xl overflow-hidden flex flex-col min-w-0">
      <div className="px-5 py-4 border-b border-gpu-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-emerald-400/[0.08] border border-emerald-400/20 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white">
              Optimized kernel
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">
              Generated code and proof
            </p>
          </div>
        </div>

        <button
          onClick={copyToClipboard}
          className="shrink-0 flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-300" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span>{copied ? "Copied" : "Copy code"}</span>
        </button>
      </div>

      <div className="p-4 border-b border-gpu-border">
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.045] p-4">
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 shrink-0 rounded-md bg-emerald-400/[0.10] flex items-center justify-center">
              <Check className="h-3.5 w-3.5 text-emerald-300" />
            </div>

            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-emerald-200">
                Layout proof
              </h3>
              <p className="mt-2 text-xs leading-6 text-slate-300 whitespace-pre-wrap break-words">
                {proofDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gpu-border bg-[#0d1218]">
        <span className="text-[11px] font-medium text-slate-300">
          Patched source
        </span>
        <span className="text-[10px] font-mono text-slate-500">
          {patchedCode.split("\n").length} lines
        </span>
      </div>

      <div className="bg-[#0b1016] overflow-auto max-h-[420px] min-h-[250px] p-5">
        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-slate-300">
          {patchedCode}
        </pre>
      </div>
    </section>
  );
};
