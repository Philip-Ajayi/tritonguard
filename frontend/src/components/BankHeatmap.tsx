
"use client";

import React, { useState } from "react";
import { BankSimulation, ColumnConflict } from "@/types";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface BankHeatmapProps {
  simulation: BankSimulation | null;
  title: string;
}

export const BankHeatmap: React.FC<BankHeatmapProps> = ({
  simulation,
  title,
}) => {
  const [hoveredBank, setHoveredBank] = useState<ColumnConflict | null>(null);

  if (!simulation) {
    return (
      <section className="bg-gpu-surface border border-gpu-border rounded-xl overflow-hidden min-h-[250px] flex flex-col">
        <div className="px-5 py-4 border-b border-gpu-border">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="text-[11px] text-slate-500 mt-1">
            32 shared memory banks
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-9 text-center">
          <div className="h-10 w-10 rounded-xl bg-gpu-bg border border-gpu-border flex items-center justify-center mb-3">
            <Info className="h-4 w-4 text-slate-500" />
          </div>

          <p className="text-sm font-medium text-slate-300">
            No memory data yet
          </p>
          <p className="mt-1.5 max-w-xs text-xs leading-5 text-slate-500">
            Inspect your kernel to see which banks are accessed at the
            same time.
          </p>
        </div>
      </section>
    );
  }

  const {
    max_conflict_way,
    efficiency_percentage,
    total_serialization_cycles,
  } = simulation;

  const conflictFree = max_conflict_way <= 1;

  return (
    <section className="bg-gpu-surface border border-gpu-border rounded-xl overflow-hidden min-w-0">
      <div className="px-5 py-4 border-b border-gpu-border">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            <p className="mt-1 text-[11px] text-slate-500">
              Shared memory · Warp 0 · Threads 0–31
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium ${
              conflictFree
                ? "bg-emerald-400/[0.07] text-emerald-300 border-emerald-400/20"
                : "bg-rose-400/[0.07] text-rose-300 border-rose-400/20"
            }`}
          >
            {conflictFree ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
            {conflictFree ? "Conflict-free" : `${max_conflict_way}-way conflict`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-lg bg-gpu-bg border border-gpu-border/80 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              SM efficiency
            </p>
            <p
              className={`text-xl font-semibold tracking-tight mt-1 ${
                efficiency_percentage > 90
                  ? "text-emerald-300"
                  : "text-amber-300"
              }`}
            >
              {efficiency_percentage}%
            </p>
          </div>

          <div className="rounded-lg bg-gpu-bg border border-gpu-border/80 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Serialization
            </p>
            <p className="text-xl font-semibold tracking-tight mt-1 text-white">
              {total_serialization_cycles}
              <span className="text-xs font-normal text-slate-500 ml-1">
                cycles
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-medium text-slate-400">
            Bank activity
          </span>

          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-emerald-400" />
              Single access
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-amber-400" />
              2 accesses
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-rose-400" />
              3+ accesses
            </span>
          </div>
        </div>

        <div className="grid grid-cols-8 sm:grid-cols-8 xl:grid-cols-8 2xl:grid-cols-8 gap-1.5 p-3 rounded-lg border border-gpu-border bg-gpu-bg">
          {simulation.column_conflicts.map((col) => {
            const hits = col.hit_count;

            let cellClass =
              "bg-slate-800/70 border-slate-700 text-slate-400";

            if (hits === 1) {
              cellClass =
                "bg-emerald-400/[0.12] border-emerald-400/35 text-emerald-200";
            } else if (hits === 2) {
              cellClass =
                "bg-amber-400/[0.14] border-amber-400/40 text-amber-200";
            } else if (hits >= 3) {
              cellClass =
                "bg-rose-400/[0.16] border-rose-400/45 text-rose-200";
            }

            const isSelected = hoveredBank?.bank_id === col.bank_id;

            return (
              <div
                key={col.bank_id}
                onMouseEnter={() => setHoveredBank(col)}
                onMouseLeave={() => setHoveredBank(null)}
                className={`relative flex flex-col items-center justify-center min-h-[49px] sm:min-h-[52px] rounded-md border cursor-crosshair select-none ${cellClass} ${
                  isSelected
                    ? "ring-1 ring-white/70 brightness-125"
                    : ""
                }`}
              >
                <span className="text-[9px] opacity-65 font-mono">
                  B{col.bank_id}
                </span>
                <span className="text-sm font-semibold font-mono mt-0.5">
                  {hits}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 rounded-lg bg-gpu-bg border border-gpu-border/80 px-3.5 py-3 min-h-[68px]">
          {hoveredBank ? (
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-white">
                  Bank {hoveredBank.bank_id}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {hoveredBank.hit_count}{" "}
                  {hoveredBank.hit_count === 1 ? "access" : "accesses"}
                </span>
              </div>

              {hoveredBank.hit_count === 0 ? (
                <p className="text-xs text-slate-500 mt-1.5">
                  No threads accessed this bank.
                </p>
              ) : (
                <p className="text-xs leading-5 text-slate-400 mt-1.5">
                  Thread IDs:{" "}
                  <span className="font-mono text-slate-200 break-words">
                    [{hoveredBank.colliding_threads.join(", ")}]
                  </span>
                  {hoveredBank.hit_count > 1 && (
                    <span className="text-rose-300 ml-1">
                      · Possible conflict
                    </span>
                  )}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="h-3.5 w-3.5 shrink-0" />
              Hover over a bank to inspect its thread IDs.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
