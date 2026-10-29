"use client";

import React from "react";
import { Check, Copy, ArrowRight, ShieldCheck } from "lucide-react";

interface SwizzleDiffViewerProps {
  originalCode: string;
  patchedCode: string;
  proofDescription: string;
}

export const SwizzleDiffViewer: React.FC<SwizzleDiffViewerProps> = ({
  originalCode,
  patchedCode,
  proofDescription
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(patchedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gpu-surface border border-gpu-border rounded-xl overflow-hidden flex flex-col">
      <div className="bg-gpu-bg border-b border-gpu-border px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
            Formal Layout Synthesis (Nemotron-3-Ultra Prover)
          </span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? "Copied" : "Copy Patched Kernel"}</span>
        </button>
      </div>

      {/* Formal Proof Box */}
      <div className="bg-emerald-950/20 border-b border-emerald-500/20 p-3.5 text-xs text-emerald-300/90 font-mono leading-normal">
        <span className="font-bold text-emerald-400">Formal Invariant Proof: </span>
        {proofDescription}
      </div>

      {/* Code Viewer */}
      <div className="p-4 bg-gpu-surface overflow-auto max-h-[360px] font-mono text-xs leading-relaxed text-slate-200">
        <pre className="whitespace-pre-wrap">{patchedCode}</pre>
      </div>
    </div>
  );
};