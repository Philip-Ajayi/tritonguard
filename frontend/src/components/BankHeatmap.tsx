"use client";

import React, { useState } from "react";
import { BankSimulation, ColumnConflict } from "@/types";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface BankHeatmapProps {
  simulation: BankSimulation | null;
  title: string;
}

export const BankHeatmap: React.FC<BankHeatmapProps> = ({ simulation, title }) => {
  const [hoveredBank, setHoveredBank] = useState<ColumnConflict | null>(null);

  if (!simulation) {
    return (
      <div className="bg-gpu-surface border border-gpu-border rounded-xl p-5 flex flex-col items-center justify-center h-64 text-slate-500 text-sm">
        <Info className="h-8 w-8 mb-2 opacity-50" />
        <p>Run formal audit to generate 32-column shared memory collision heatmap.</p>
      </div>
    );
  }

  const { bank_hit_counts, max_conflict_way, efficiency_percentage, total_serialization_cycles } = simulation;

  return (
    <div className="bg-gpu-surface border border-gpu-border rounded-xl p-5 flex flex-col justify-between">
      {/* Header and Telemetry */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-sm text-white">{title}</h3>
            {max_conflict_way > 1 ? (
              <span className="flex items-center space-x-1 text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {max_conflict_way}-Way Conflict Detected
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Zero Bank Conflicts
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">SM Efficiency: </span>
            <span className={`font-mono text-sm font-bold ${efficiency_percentage > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {efficiency_percentage}%
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Visualizing 32 hardware memory banks for Warp 0 (Threads 0–31). Serialized conflict delay:{" "}
          <span className="font-mono text-white font-semibold">{total_serialization_cycles} cycles</span>.
        </p>

        {/* Interactive 32-Bank SVG Heatmap */}
        <div className="grid grid-cols-16 sm:grid-cols-32 gap-1 bg-gpu-bg p-3 rounded-lg border border-gpu-border">
          {simulation.column_conflicts.map((col) => {
            const hits = col.hit_count;
            let bgClass = "bg-slate-800 border-slate-700 text-slate-400";
            if (hits === 1) {
              bgClass = "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]";
            } else if (hits === 2) {
              bgClass = "bg-amber-500/30 border-amber-500 text-amber-200 animate-pulse";
            } else if (hits >= 3) {
              bgClass = "bg-rose-500/40 border-rose-500 text-rose-200 shadow-[0_0_12px_rgba(239,68,68,0.4)]";
            }

            return (
              <div
                key={col.bank_id}
                onMouseEnter={() => setHoveredBank(col)}
                onMouseLeave={() => setHoveredBank(null)}
                className={`relative flex flex-col items-center justify-center h-16 rounded border text-[10px] font-mono cursor-pointer transition-all hover:scale-105 ${bgClass}`}
              >
                <span className="opacity-60 text-[8px]">B{col.bank_id}</span>
                <span className="font-bold text-xs">{hits}x</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover Inspector Tooltip Bar */}
      <div className="mt-4 pt-3 border-t border-gpu-border/60 min-h-[44px] flex items-center justify-between text-xs font-mono">
        {hoveredBank ? (
          <div className="text-slate-300">
            <span className="text-gpu-accent font-bold">Bank {hoveredBank.bank_id}: </span>
            {hoveredBank.hit_count === 0 ? (
              <span className="text-slate-500">Idle (0 threads)</span>
            ) : (
              <span>
                Accessed simultaneously by Warp Threads:{" "}
                <span className="text-white">[{hoveredBank.colliding_threads.join(", ")}]</span>
                {hoveredBank.hit_count > 1 && (
                  <span className="text-rose-400 ml-2 font-bold">
                    ({hoveredBank.hit_count}-way collision serialization!)
                  </span>
                )}
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-500 italic">Hover over any of the 32 memory banks above to inspect warp thread IDs.</span>
        )}
      </div>
    </div>
  );
};
