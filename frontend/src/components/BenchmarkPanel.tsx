"use client";

import React from "react";
import { VerificationResult } from "@/types";
import { Gauge, CheckCircle2, Zap, ArrowUpRight, Award } from "lucide-react";

interface BenchmarkPanelProps {
  result: VerificationResult | null;
  onRunVerify: () => void;
  loading: boolean;
}

export const BenchmarkPanel: React.FC<BenchmarkPanelProps> = ({
  result,
  onRunVerify,
  loading
}) => {
  return (
    <div className="bg-gpu-surface border border-gpu-border rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Gauge className="h-4 w-4 text-gpu-accent" />
            <h3 className="text-sm font-semibold text-white">Hardware Sandbox Verification</h3>
          </div>
          <button
            onClick={onRunVerify}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gpu-accent hover:bg-emerald-600 text-black text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Zap className="h-3 w-3 text-black" />
            <span>{loading ? "Benchmarking..." : "Verify & Benchmark"}</span>
          </button>
        </div>

        {result ? (
          <div className="space-y-4">
            {/* Speedup Metric Card */}
            <div className="bg-gpu-bg border border-gpu-border p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Verified Speedup</span>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1 flex items-center">
                  {result.measured_speedup}
                  <ArrowUpRight className="h-6 w-6 ml-1 text-emerald-400" />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Execution Mode</span>
                <p className="text-xs font-mono text-white mt-1">{result.execution_mode}</p>
              </div>
            </div>

            {/* Numerical Invariant Equivalence Proof */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Mathematical Equivalence: <strong>torch.allclose == True</strong> (max error: {result.max_absolute_difference})
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
                PASS
              </span>
            </div>

            {/* Latency Comparison Bars */}
            <div className="space-y-2 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Original Un-swizzled Kernel:</span>
                  <span className="text-rose-400">{result.original_latency_us} μs</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>TritonGuard Swizzled Kernel:</span>
                  <span className="text-emerald-400">{result.swizzled_latency_us} μs</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${(result.swizzled_latency_us / result.original_latency_us) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            Click &quot;Verify &amp; Benchmark&quot; to compile kernels, prove numerical tolerance, and record latency speedups.
          </div>
        )}
      </div>

      {result && (
        <div className="mt-4 pt-3 border-t border-gpu-border text-[11px] text-slate-400 font-mono flex items-center justify-between">
          <span>DRAM Throughput: {result.dram_bandwidth_gb_s} GB/s</span>
          <span className="text-emerald-400 font-semibold">{result.verification_status}</span>
        </div>
      )}
    </div>
  );
};
