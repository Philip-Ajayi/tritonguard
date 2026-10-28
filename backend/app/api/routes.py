from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional

from app.core.ast_analyzer import TritonASTAnalyzer
from app.core.bank_conflict_engine import BankConflictSimulator
from app.core.swizzle_synthesizer import SwizzleSynthesizer
from app.services.nebius_client import NebiusTokenFactoryClient
from app.services.sandbox_runner import SandboxVerificationRunner
from app.samples.triton_kernels import UNSWIZZLED_GEMM, FUSED_SOFTMAX, LAYERNORM_KERNEL

router = APIRouter()
nebius_client = NebiusTokenFactoryClient()

class AuditRequest(BaseModel):
    code: str
    target_arch: str = "sm_75"
    tile_m: int = 64
    tile_k: int = 32

class SwizzleRequest(BaseModel):
    code: str
    tile_shapes: Optional[Dict[str, int]] = None

class VerifyRequest(BaseModel):
    original_code: str
    swizzled_code: str
    target_arch: str = "sm_75"

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "TritonGuard Autonomous Memory Invariant Verifier",
        "nebius_integration": "active",
        "default_device_target": "NVIDIA sm_75 / sm_80 / sm_90"
    }

@router.get("/samples")
def get_sample_kernels():
    return {
        "samples": [
            {"id": "gemm", "name": "Block-Tiled Matrix Multiplication (GEMM)", "code": UNSWIZZLED_GEMM},
            {"id": "softmax", "name": "Fused Safe Softmax", "code": FUSED_SOFTMAX},
            {"id": "layernorm", "name": "Fused RMS/LayerNorm Kernel", "code": LAYERNORM_KERNEL}
        ]
    }

@router.post("/audit")
async def audit_kernel(req: AuditRequest):
    # 1. Structural AST Inspection
    ast_info = TritonASTAnalyzer.inspect(req.code)
    if not ast_info["success"]:
        raise HTTPException(status_code=400, detail=ast_info["error"])

    # 2. Bank Conflict Simulation for Warp (32 threads)
    is_swizzled = ast_info["has_swizzle"]
    tile_m = ast_info["tile_shapes"].get("BLOCK_M", req.tile_m)
    tile_k = ast_info["tile_shapes"].get("BLOCK_K", req.tile_k)
    stride = ast_info.get("stride", 32)

    simulation = BankConflictSimulator.simulate(
        tile_m=tile_m,
        tile_k=tile_k,
        is_swizzled=is_swizzled,
        stride=stride
    )

    # 3. Symbolic Invariant Reasoning via Nebius Nemotron
    ai_analysis = await nebius_client.analyze_kernel_invariants(req.code, req.target_arch)

    return {
        "ast": ast_info,
        "simulation": simulation,
        "ai_reasoning": ai_analysis
    }

@router.post("/swizzle")
async def synthesize_swizzle(req: SwizzleRequest):
    tile_shapes = req.tile_shapes or {"BLOCK_M": 64, "BLOCK_N": 64, "BLOCK_K": 32}

    # Synthesize layout patch
    patch = SwizzleSynthesizer.synthesize_patch(req.code, tile_shapes)

    # Run simulation on patched kernel
    sim_patched = BankConflictSimulator.simulate(
        tile_m=tile_shapes.get("BLOCK_M", 64),
        tile_k=tile_shapes.get("BLOCK_K", 32),
        is_swizzled=True
    )

    return {
        "patch": patch,
        "optimized_simulation": sim_patched
    }

@router.post("/verify")
def verify_kernel(req: VerifyRequest):
    result = SandboxVerificationRunner.execute_and_verify(
        original_kernel=req.original_code,
        swizzled_kernel=req.swizzled_code,
        target_arch=req.target_arch
    )
    return result
