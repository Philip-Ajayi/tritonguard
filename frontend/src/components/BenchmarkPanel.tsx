
"use client";

import React from "react";
import { VerificationResult } from "@/types";
import { Gauge, CheckCircle2, Zap, ArrowUpRight } from "lucide-react";

interface BenchmarkPanelProps {
  result: VerificationResult | null;
  onRunVerify: () => void;
  loading: boolean;
}

export const BenchmarkPanel: React.FC<BenchmarkPanelProps> = ({
  result,
  onRunVerify,
  loading,
}) => {
  const originalLatency = result?.original_latency_us ?? 0;
  const swizzledLatency = result?.swizzled_latency_us ?? 0;

  const originalWidth =
    originalLatency > 0
      ? 100
      : 0;

  const swizzledWidth =
    originalLatency > 0
      ? Math.min(100, Math.max(0, (swizzledLatency / originalLatency) * 100))
      : 0;

  return (
    <section className="bg-gpu-surface border border-gpu-border rounded-xl overflow-hidden flex flex-col min-w-0">
      <div className="px-5 py-4 border-b border-gpu-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gpu-bg border border-gpu-border flex items-center justify-center">
            <Gauge className="h-4 w-4 text-emerald-300" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Verification & benchmarks
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Correctness and execution time
            </p>
          </div>
        </div>

        <button
          onClick={onRunVerify}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gpu-accent text-xs font-semibold"
        >
          <Zap className="h-3.5 w-3.5" />
          <span>{loading ? "Running..." : "Verify kernel"}</span>
        </button>
      </div>

      {result ? (
        <div className="p-5 flex-1">
          <div className="rounded-xl border border-gpu-border bg-gpu-bg p-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  Measured speedup
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-4xl font-semibold tracking-[-0.055em] text-emerald-300 font-mono">
                    {result.measured_speedup}
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-emerald-300" />
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Execution mode
                </p>
                <p className="mt-2 text-xs font-mono text-slate-200 break-words">
                  {result.execution_mode}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-3 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.05] p-3.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0 mt-0.5" />

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-emerald-200">
                Numerical check passed
              </p>
              <p className="mt-1 text-[11px] leading-5 text-slate-400">
                Maximum absolute difference:{" "}
                <span className="font-mono text-slate-200 break-all">
                  {result.max_absolute_difference}
                </span>
              </p>
            </div>

            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300 border border-emerald-400/20 rounded px-2 py-1">
              Pass
            </span>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-xs font-semibold text-slate-200">
                Kernel latency
              </h3>
              <span className="text-[10px] text-slate-500">
                Lower is better
              </span>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-xs text-slate-400">
                    Original
                  </span>
                  <span className="font-mono text-xs text-slate-200">
                    {result.original_latency_us} μs
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-400/80"
                    style={{ width: `${originalWidth}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-xs text-slate-400">
                    Optimized
                  </span>
                  <span className="font-mono text-xs text-emerald-300">
                    {result.swizzled_latency_us} μs
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${swizzledWidth}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gpu-border grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                DRAM bandwidth
              </p>
              <p className="mt-2 text-sm font-mono font-medium text-slate-200">
                {result.dram_bandwidth_gb_s}
                <span className="text-[11px] text-slate-500 ml-1">
                  GB/s
                </span>
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Verification
              </p>
              <p className="mt-2 text-sm font-medium text-emerald-300">
                {result.verification_status}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center px-6 py-10 text-center">
          <div className="h-11 w-11 rounded-xl bg-gpu-bg border border-gpu-border flex items-center justify-center mb-4">
            <Gauge className="h-5 w-5 text-slate-500" />
          </div>

          <h3 className="text-sm font-medium text-slate-200">
            Ready to test
          </h3>
          <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
            Run verification to check numerical accuracy and compare
            execution times.
          </p>
        </div>
      )}
    </section>
  );
};
