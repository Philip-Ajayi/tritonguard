"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { KernelEditor } from "@/components/KernelEditor";
import { BankHeatmap } from "@/components/BankHeatmap";
import { SwizzleDiffViewer } from "@/components/SwizzleDiffViewer";
import { BenchmarkPanel } from "@/components/BenchmarkPanel";
import { ColabBridgeModal } from "@/components/ColabBridgeModal";
import {
  AuditResponse,
  SwizzleResponse,
  VerificationResult,
  SampleKernel,
} from "@/types";

export default function Home() {
  const [selectedArch, setSelectedArch] = useState("sm_75");
  const [backendBaseUrl] = useState("");
  // Separate worker URL: switches to Colab T4 GPU when connected
  const [gpuWorkerUrl, setGpuWorkerUrl] = useState("");

  const [code, setCode] = useState("");
  const [samples, setSamples] = useState<SampleKernel[]>([]);
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [swizzleData, setSwizzleData] = useState<SwizzleResponse | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);

  const [loadingAudit, setLoadingAudit] = useState(false);
  const [loadingSwizzle, setLoadingSwizzle] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [isColabModalOpen, setIsColabModalOpen] = useState(false);

  useEffect(() => {
    fetch(`${backendBaseUrl}/api/samples`)
      .then((res) => res.json())
      .then((data) => {
        if (data.samples && data.samples.length > 0) {
          setSamples(data.samples);
          setCode(data.samples[0].code);
        }
      })
      .catch((err) => console.error("Initial samples load error:", err));
  }, [backendBaseUrl]);

  const handleAudit = async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch(`${backendBaseUrl}/api/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, target_arch: selectedArch })
      });
      const data = await res.json();
      setAuditData(data);
    } catch (err) {
      console.error("Audit error:", err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleSynthesizeSwizzle = async () => {
    setLoadingSwizzle(true);
    try {
      const res = await fetch(`${backendBaseUrl}/api/swizzle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          tile_shapes: auditData?.ast.tile_shapes || { BLOCK_M: 64, BLOCK_K: 32 }
        })
      });
      const data = await res.json();
      setSwizzleData(data);
    } catch (err) {
      console.error("Swizzle synthesis error:", err);
    } finally {
      setLoadingSwizzle(false);
    }
  };

  const handleVerify = async () => {
    setLoadingVerify(true);
    // Route to Colab if connected, otherwise use Render fallback
    const targetUrl = gpuWorkerUrl.trim().replace(/\/$/, "") || backendBaseUrl;

    try {
      const res = await fetch(`${targetUrl}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original_code: code,
          swizzled_code: swizzleData ? swizzleData.patch.patched_code : code,
          target_arch: selectedArch
        })
      });
      const data = await res.json();
      setVerifyResult(data);
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setLoadingVerify(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gpu-bg text-slate-100">
      <Navbar
        selectedArch={selectedArch}
        onSelectArch={setSelectedArch}
        onOpenColabModal={() => setIsColabModalOpen(true)}
      />

      <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto space-y-6">
        <section className="tg-hero relative overflow-hidden rounded-2xl border border-gpu-border px-6 py-7 md:px-8 md:py-8">
          <div className="tg-hero-glow" aria-hidden="true" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.9)]" />
                GPU memory intelligence · formal verification
              </div>
              <h1 className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-white md:text-5xl">
                Make every memory access <span className="tg-gradient-text">provably count.</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
                Inspect bank conflicts, synthesize XOR swizzles, and verify kernel equivalence in one precision-built workspace.
              </p>
            </div>
            <div className="tg-hero-meta grid grid-cols-2 gap-2 md:min-w-[250px]">
              <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
                <span className="block text-[10px] uppercase tracking-[0.16em] text-slate-500">Memory model</span>
                <span className="mt-1 block font-mono text-sm text-slate-200">32 banks</span>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
                <span className="block text-[10px] uppercase tracking-[0.16em] text-slate-500">Workflow</span>
                <span className="mt-1 block font-mono text-sm text-emerald-300">Audit → Prove</span>
              </div>
            </div>
          </div>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <KernelEditor
            code={code}
            onChangeCode={setCode}
            samples={samples}
            onSelectSample={(s) => setCode(s.code)}
            onRunAudit={handleAudit}
            onSynthesizeSwizzle={handleSynthesizeSwizzle}
            loadingAudit={loadingAudit}
            loadingSwizzle={loadingSwizzle}
          />

          <div className="space-y-6 flex flex-col justify-between">
            <BankHeatmap
              simulation={auditData ? auditData.simulation : null}
              title="Pre-Compilation Shared Memory Bank Conflicts (32 Banks)"
            />

            {swizzleData && (
              <BankHeatmap
                simulation={swizzleData.optimized_simulation}
                title="Post-Swizzle Memory Layout (Formally Conflict-Free)"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {swizzleData ? (
            <SwizzleDiffViewer
              originalCode={code}
              patchedCode={swizzleData.patch.patched_code}
              proofDescription={swizzleData.patch.proof_description}
            />
          ) : (
            <div className="bg-gpu-surface border border-gpu-border rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 text-xs">
              Click &quot;Synthesize Swizzle Patch&quot; to generate bitwise XOR layout and mathematical proof.
            </div>
          )}

          <BenchmarkPanel
            result={verifyResult}
            onRunVerify={handleVerify}
            loading={loadingVerify}
          />
        </div>
      </main>

      <ColabBridgeModal
        isOpen={isColabModalOpen}
        onClose={() => setIsColabModalOpen(false)}
        onConnectWorker={(url) => setGpuWorkerUrl(url)}
        connectedUrl={gpuWorkerUrl}
      />
    </div>
  );
}
