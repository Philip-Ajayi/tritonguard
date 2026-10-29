
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
        body: JSON.stringify({ code, target_arch: selectedArch }),
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
          tile_shapes: auditData?.ast.tile_shapes || {
            BLOCK_M: 64,
            BLOCK_K: 32,
          },
        }),
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
    const targetUrl = gpuWorkerUrl.trim().replace(/\/$/, "") || backendBaseUrl;

    try {
      const res = await fetch(`${targetUrl}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original_code: code,
          swizzled_code: swizzleData ? swizzleData.patch.patched_code : code,
          target_arch: selectedArch,
        }),
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

      <main className="flex-1 px-6 max-w-[1600px] w-full mx-auto space-y-6">
        <section className="tg-hero relative overflow-hidden rounded-2xl border border-gpu-border px-6 py-7 md:px-8 md:py-8">
          <div className="tg-hero-glow" aria-hidden="true" />

          <div className="relative z-10 flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                GPU memory tools
              </div>

              <h1 className="text-3xl font-semibold leading-[1.12] tracking-[-0.045em] text-white md:text-5xl">
                Find the conflict.
                <br />
                <span className="tg-gradient-text">
                  Fix it with proof.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 md:text-[15px]">
                Inspect shared memory, generate a better layout, and check
                that your GPU kernel still produces the right results.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 md:min-w-[245px]">
              <div className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
                <span className="block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                  Shared memory
                </span>
                <span className="mt-2 block text-xl font-semibold tracking-tight text-white">
                  32 <span className="text-sm font-normal text-slate-400">banks</span>
                </span>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
                <span className="block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                  Workflow
                </span>
                <span className="mt-2 block text-sm font-medium text-emerald-300">
                  Inspect → Verify
                </span>
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

          <div className="space-y-5 flex flex-col">
            <BankHeatmap
              simulation={auditData ? auditData.simulation : null}
              title="Original memory layout"
            />

            {swizzleData && (
              <BankHeatmap
                simulation={swizzleData.optimized_simulation}
                title="Optimized memory layout"
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
            <div className="bg-gpu-surface border border-gpu-border rounded-xl p-8 min-h-[260px] flex flex-col items-center justify-center text-center">
              <div className="h-11 w-11 rounded-xl border border-gpu-border bg-gpu-bg flex items-center justify-center mb-4">
                <span className="font-mono text-lg text-emerald-300">{"{ }"}</span>
              </div>
              <h3 className="text-sm font-medium text-slate-200">
                Your optimized kernel will appear here
              </h3>
              <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                Generate a memory layout patch to inspect the updated code
                and its proof.
              </p>
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
