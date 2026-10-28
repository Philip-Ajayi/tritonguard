"use client";

import React, { useState } from "react";
import { X, ExternalLink, Terminal, Check, Server } from "lucide-react";

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
  connectedUrl
}) => {
  const [inputUrl, setInputUrl] = useState(connectedUrl);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gpu-surface border border-gpu-border rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Google Colab Live GPU Bridge</h2>
            <p className="text-xs text-slate-400">Zero-Spend execution on free-tier NVIDIA T4 GPU (sm_75)</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <p>
            Judges can test live execution on real NVIDIA GPU hardware for $0.00 using our automated Google Colab runner:
          </p>

          <ol className="list-decimal list-inside space-y-2 bg-gpu-bg p-3.5 rounded-xl border border-gpu-border font-mono">
            <li>
              Open the pre-configured runner in Google Colab:
              <a
                href="https://colab.research.google.com"
                target="_blank"
                rel="noreferrer"
                className="ml-2 text-amber-400 underline inline-flex items-center"
              >
                Colab Runner Notebook <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </li>
            <li>Select &quot;Runtime&quot; -&gt; &quot;Change runtime type&quot; -&gt; <strong>T4 GPU</strong> (Free Tier).</li>
            <li>Run all cells. The script launches an ngrok public tunnel to the Triton compiler.</li>
            <li>Paste your generated public URL below:</li>
          </ol>

          <div>
            <label className="block text-slate-400 font-mono mb-1.5">Live Colab Worker URL:</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://xxxx.ngrok-free.app or http://localhost:8000"
                className="flex-1 bg-gpu-bg border border-gpu-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-gpu-accent"
              />
              <button
                onClick={() => {
                  onConnectWorker(inputUrl);
                  onClose();
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-xs transition-colors"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
