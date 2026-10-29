
"use client";

import React, { useState } from "react";
import { X, ExternalLink, Check, Server, ArrowRight } from "lucide-react";

interface ColabBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectWorker: (url: string) => void;
  connectedUrl: string;
}

export const ColabBridgeModal: React.FC<ColabBridgeModalProps> = ({
  isOpen,
  onClose,
  onConnectWorker,
  connectedUrl,
}) => {
  const [inputUrl, setInputUrl] = useState(connectedUrl);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="colab-dialog-title"
        className="bg-gpu-surface border border-gpu-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative"
      >
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-gpu-border">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-400/[0.09] border border-amber-400/20 flex items-center justify-center">
              <Server className="h-5 w-5 text-amber-300" />
            </div>

            <div>
              <h2
                id="colab-dialog-title"
                className="text-base font-semibold text-white"
              >
                Connect a GPU worker
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Run verification on a connected NVIDIA GPU through Colab.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="rounded-lg border border-gpu-border bg-gpu-bg p-4 flex items-start gap-3">
            <div className="h-7 w-7 rounded-md bg-slate-800 flex items-center justify-center shrink-0">
              <Server className="h-3.5 w-3.5 text-slate-300" />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-200">
                NVIDIA T4 · sm_75
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                A compatible Colab runtime can provide access to a T4 GPU.
                Availability depends on your Colab session and account.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xs font-semibold text-slate-200">
              Get connected
            </h3>

            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-semibold text-slate-300 shrink-0">
                  1
                </span>

                <div className="min-w-0 pt-0.5">
                  <p className="text-xs text-slate-300">
                    Open your Colab notebook.
                  </p>
                  <a
                    href="https://colab.research.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 hover:text-emerald-200"
                  >
                    Open Google Colab
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-semibold text-slate-300 shrink-0">
                  2
                </span>

                <div className="min-w-0 pt-0.5">
                  <p className="text-xs leading-5 text-slate-300">
                    Select a T4 GPU under Runtime settings, then run the
                    notebook cells to start your worker.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-semibold text-slate-300 shrink-0">
                  3
                </span>

                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-xs text-slate-300">
                    Paste the worker URL below.
                  </p>

                  <label
                    htmlFor="colab-worker-url"
                    className="block mt-3 mb-2 text-[11px] font-medium text-slate-400"
                  >
                    Worker URL
                  </label>

                  <input
                    id="colab-worker-url"
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://your-worker.ngrok-free.app"
                    className="w-full min-w-0 bg-gpu-bg border border-gpu-border rounded-lg px-3 py-3 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400/60"
                  />

                  <p className="mt-2 text-[10px] leading-4 text-slate-500">
                    Use the public URL printed by your running worker.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gpu-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${
                  connectedUrl.trim()
                    ? "bg-emerald-400"
                    : "bg-slate-600"
                }`}
              />

              <span className="text-[11px] text-slate-400">
                {connectedUrl.trim() ? "Worker URL saved" : "No worker connected"}
              </span>
            </div>

            <button
              onClick={() => {
                onConnectWorker(inputUrl);
                onClose();
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gpu-accent text-xs font-semibold shrink-0"
            >
              <span>Save connection</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
