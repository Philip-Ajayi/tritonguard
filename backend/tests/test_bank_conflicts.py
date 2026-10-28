import pytest
from app.core.bank_conflict_engine import BankConflictSimulator

def test_unswizzled_bank_conflict():
    sim = BankConflictSimulator.simulate(tile_m=64, tile_k=32, is_swizzled=False, stride=32)
    # With a stride of 32, every thread accesses bank 0, causing a severe conflict
    assert sim["num_banks"] == 32
    assert sim["max_conflict_way"] >= 4
    assert sim["total_serialization_cycles"] > 0
    assert sim["efficiency_percentage"] < 80.0

def test_swizzled_zero_bank_conflict():
    sim = BankConflictSimulator.simulate(tile_m=64, tile_k=32, is_swizzled=True, stride=32)
    # XOR swizzled layout guarantees uniform distribution
    assert sim["total_serialization_cycles"] == 0
    assert sim["efficiency_percentage"] == 100.0
    # Every bank should have exactly 1 hit
    for count in sim["bank_hit_counts"]:
        assert count == 1
