import pytest
from app.core.ast_analyzer import TritonASTAnalyzer
from app.samples.triton_kernels import UNSWIZZLED_GEMM

def test_ast_analysis_gemm():
    result = TritonASTAnalyzer.inspect(UNSWIZZLED_GEMM)
    assert result["success"] is True
    assert result["kernel_name"] == "matmul_kernel"
    assert "BLOCK_M" in result["tile_shapes"]
    assert result["tile_shapes"]["BLOCK_M"] == 64
    assert result["tile_shapes"]["BLOCK_K"] == 32
    assert result["has_swizzle"] is False
    assert len(result["loads"]) >= 2
    assert len(result["stores"]) >= 1

def test_syntax_error_handling():
    invalid_code = "def broken_kernel(: return"
    result = TritonASTAnalyzer.inspect(invalid_code)
    assert result["success"] is False
    assert "SyntaxError" in result["error"]
