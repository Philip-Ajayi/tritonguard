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
  // Relative path "" allows automatic hosting on Render without CORS/port issues
  const [backendBaseUrl] = useState("");
  // Separate worker URL: Defaults to Render, but switches to Colab T4 GPU when connected
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
