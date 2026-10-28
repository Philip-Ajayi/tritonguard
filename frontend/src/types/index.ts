export interface ColumnConflict {
  bank_id: number;
  hit_count: number;
  colliding_threads: number[];
  is_conflict: boolean;
}

export interface BankSimulation {
  num_banks: number;
  warp_size: number;
  is_swizzled: boolean;
  max_conflict_way: number;
  total_serialization_cycles: number;
  efficiency_percentage: number;
  is_coalesced: boolean;
  bank_hit_counts: number[];
  column_conflicts: ColumnConflict[];
  bank_matrix_sample: number[][];
}

export interface ASTAnalysis {
  success: boolean;
  kernel_name: string;
  tile_shapes: Record<string, number>;
  stride: number;
  loads: Array<{ op: string; lineno: number; arg_expr: string }>;
  stores: Array<{ op: string; lineno: number; arg_expr: string }>;
  has_swizzle: boolean;
  parameters: string[];
}

export interface AIReasoning {
  kernel_name: string;
  indexing_formula: string;
  bank_conflict_detected: boolean;
  conflict_degree: number;
  explanation: string;
  theoretical_speedup: string;
}

export interface AuditResponse {
  ast: ASTAnalysis;
  simulation: BankSimulation;
  ai_reasoning: AIReasoning;
}

export interface SwizzleResponse {
  patch: {
    success: boolean;
    patched_code: string;
    proof_description: string;
    swizzle_type: string;
    speedup_estimate: string;
  };
  optimized_simulation: BankSimulation;
}

export interface VerificationResult {
  execution_mode: string;
  numerical_equivalence: boolean;
  max_absolute_difference: number;
  tolerance_passed: boolean;
  original_latency_us: number;
  swizzled_latency_us: number;
  measured_speedup: string;
  dram_bandwidth_gb_s: number;
  shared_memory_conflicts_original: number;
  shared_memory_conflicts_swizzled: number;
  verification_status: string;
}

export interface SampleKernel {
  id: string;
  name: string;
  code: string;
}
