import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.samples.triton_kernels import UNSWIZZLED_GEMM

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_samples_endpoint():
    res = client.get("/api/samples")
    assert res.status_code == 200
    data = res.json()
    assert len(data["samples"]) >= 3

def test_audit_endpoint():
    payload = {
        "code": UNSWIZZLED_GEMM,
        "target_arch": "sm_75"
    }
    res = client.post("/api/audit", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["ast"]["success"] is True
    assert data["simulation"]["max_conflict_way"] > 1

def test_swizzle_and_verify_pipeline():
    swizzle_res = client.post("/api/swizzle", json={"code": UNSWIZZLED_GEMM})
    assert swizzle_res.status_code == 200
    patched_code = swizzle_res.json()["patch"]["patched_code"]
    assert "_swizzle_2d" in patched_code

    verify_res = client.post("/api/verify", json={
        "original_code": UNSWIZZLED_GEMM,
        "swizzled_code": patched_code,
        "target_arch": "sm_75"
    })
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["numerical_equivalence"] is True
    assert "2." in verify_data["measured_speedup"]
