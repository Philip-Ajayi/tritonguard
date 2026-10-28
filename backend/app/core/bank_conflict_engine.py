import numpy as np
from typing import Dict, Any, List

class BankConflictSimulator:
    """
    Simulates GPU Shared Memory Bank allocation for a warp of 32 threads.
    Hardware Rules:
      - 32 Memory Banks (Bank 0 to Bank 31).
      - Successive 32-bit (4-byte) words map to successive banks.
      - Bank = (byte_address / 4) % 32.
      - When N threads in the same warp access distinct addresses in the same bank,
        it results in an N-way bank conflict (accesses are serialized N times).
      - If multiple threads access identical addresses, hardware broadcast occurs (0 conflicts).
    """

    NUM_BANKS = 32
    WARP_SIZE = 32
    BYTES_PER_WORD = 4

    @classmethod
    def simulate(
        cls,
        tile_m: int = 64,
        tile_k: int = 32,
        element_bytes: int = 4,
        is_swizzled: bool = False,
        stride: int = 32
    ) -> Dict[str, Any]:
        """
        Computes thread-to-bank mapping, collision frequency, serialization factor,
        and full 32-bank load distribution across warps.
        """
        # Generate 2D tile access indices
        # Rows = threads (0 to 31 in Warp 0), Cols = inner tile steps
        warp_threads = np.arange(cls.WARP_SIZE)

        # Bank mapping array: [threads, iterations]
        iterations = min(tile_k, 32)
        bank_matrix = np.zeros((cls.WARP_SIZE, iterations), dtype=int)

        for k in range(iterations):
            for t in warp_threads:
                row = t
                col = k
                if is_swizzled:
                    # Bitwise XOR swizzle layout: permutes columns by row parity
                    swizzled_col = col ^ (row % cls.NUM_BANKS)
                    address = (row * stride + swizzled_col) * element_bytes
                else:
                    address = (row * stride + col) * element_bytes

                # Bank equation: (address // 4) % 32
                bank_id = (address // cls.BYTES_PER_WORD) % cls.NUM_BANKS
                bank_matrix[t, k] = int(bank_id)

        # Analyze warp conflict for column access (e.g., in Matrix Multiplication B matrix or Transpose)
        # In a transposed or column-major read, thread t accesses row t, column k
        column_conflicts: List[Dict[str, Any]] = []
        total_serialization = 0
        max_conflict_way = 1
        bank_hit_counts = [0] * cls.NUM_BANKS

        # Test cross-thread collision on column phase k=0
        k_eval = 0
        banks_accessed_in_warp = bank_matrix[:, k_eval]

        bank_buckets: Dict[int, List[int]] = {b: [] for b in range(cls.NUM_BANKS)}
        for thread_id, b_id in enumerate(banks_accessed_in_warp):
            bank_buckets[b_id].append(thread_id)
            bank_hit_counts[b_id] += 1

        for bank_id, threads in bank_buckets.items():
            degree = len(threads)
            if degree > 1:
                total_serialization += (degree - 1)
                if degree > max_conflict_way:
                    max_conflict_way = degree
            column_conflicts.append({
                "bank_id": bank_id,
                "hit_count": degree,
                "colliding_threads": threads,
                "is_conflict": degree > 1
            })

        # Calculate efficiency score (100% = 0 conflicts; drops as serialization rises)
        efficiency = 100.0 / (1.0 + (total_serialization / cls.WARP_SIZE))

        # Memory coalescence evaluation
        # Coalesced if sequential threads access contiguous memory segments
        coalesced = True
        for t in range(cls.WARP_SIZE - 1):
            diff = bank_matrix[t + 1, 0] - bank_matrix[t, 0]
            if diff != 1 and diff != -(cls.NUM_BANKS - 1):
                coalesced = False
                break

        return {
            "num_banks": cls.NUM_BANKS,
            "warp_size": cls.WARP_SIZE,
            "is_swizzled": is_swizzled,
            "max_conflict_way": max_conflict_way,
            "total_serialization_cycles": total_serialization,
            "efficiency_percentage": round(efficiency, 2),
            "is_coalesced": coalesced or is_swizzled,
            "bank_hit_counts": bank_hit_counts,
            "column_conflicts": column_conflicts,
            "bank_matrix_sample": bank_matrix[:8, :8].tolist()
        }
