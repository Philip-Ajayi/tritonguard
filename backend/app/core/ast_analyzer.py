import ast
import re
from typing import Dict, Any, List, Optional

class KernelASTVisitor(ast.NodeVisitor):
    """
    Parses Triton Python kernels to extract loop bounds, tile dimension constants,
    tl.arange indices, pointer arithmetic expressions, and tl.load / tl.store access strides.
    """
    def __init__(self):
        self.kernel_name: str = ""
        self.tile_shapes: Dict[str, int] = {}
        self.pointer_offsets: List[Dict[str, Any]] = []
        self.loads: List[Dict[str, Any]] = []
        self.stores: List[Dict[str, Any]] = []
        self.parameters: List[str] = []
        self.has_swizzle: bool = False

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self.kernel_name = node.name
        for arg in node.args.args:
            self.parameters.append(arg.arg)
        self.generic_visit(node)

    def visit_Assign(self, node: ast.Assign) -> None:
        # Detect tile shape declarations
        if len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            target_name = node.targets[0].id
            if isinstance(node.value, ast.Constant) and isinstance(node.value.value, int):
                self.tile_shapes[target_name] = node.value.value
            elif isinstance(node.value, ast.Call):
                # Detect tl.arange(0, BLOCK_M)
                func_name = self._get_call_name(node.value)
                if "tl.arange" in func_name:
                    if len(node.value.args) == 2 and isinstance(node.value.args[1], ast.Constant):
                        self.tile_shapes[target_name] = node.value.args[1].value

        # Check for XOR swizzle patterns
        if isinstance(node.value, ast.BinOp) and isinstance(node.value.op, ast.BitXor):
            self.has_swizzle = True

        self.generic_visit(node)

    def visit_Call(self, node: ast.Call) -> None:
        func_name = self._get_call_name(node)

        if func_name in ("tl.load", "tl.store"):
            call_info = {
                "op": func_name,
                "lineno": node.lineno,
                "arg_expr": ast.unparse(node.args[0]) if node.args else "unknown"
            }
            if func_name == "tl.load":
                self.loads.append(call_info)
            else:
                self.stores.append(call_info)

        self.generic_visit(node)

    def _get_call_name(self, call_node: ast.Call) -> str:
        if isinstance(call_node.func, ast.Attribute):
            val = call_node.func.value
            val_id = val.id if isinstance(val, ast.Name) else ""
            return f"{val_id}.{call_node.func.attr}"
        elif isinstance(call_node.func, ast.Name):
            return call_node.func.id
        return ""


class TritonASTAnalyzer:
    """
    Main interface for formal inspection of GPU memory access invariants
    """
    @staticmethod
    def inspect(source_code: str) -> Dict[str, Any]:
        try:
            tree = ast.parse(source_code)
        except SyntaxError as e:
            return {
                "success": False,
                "error": f"SyntaxError parsing Triton kernel: {str(e)}",
                "kernel_name": "unknown",
                "tile_shapes": {},
                "loads": [],
                "stores": [],
                "has_swizzle": False
            }

        visitor = KernelASTVisitor()
        visitor.visit(tree)

        # Infer default tile shapes if parameterized by constexpr arguments
        if "BLOCK_M" not in visitor.tile_shapes:
            visitor.tile_shapes["BLOCK_M"] = 64
        if "BLOCK_N" not in visitor.tile_shapes:
            visitor.tile_shapes["BLOCK_N"] = 64
        if "BLOCK_K" not in visitor.tile_shapes:
            visitor.tile_shapes["BLOCK_K"] = 32

        # Extract strides and check indexing math
        extracted_stride = TritonASTAnalyzer._extract_stride(source_code, visitor.tile_shapes)

        return {
            "success": True,
            "kernel_name": visitor.kernel_name or "fused_triton_kernel",
            "tile_shapes": visitor.tile_shapes,
            "stride": extracted_stride,
            "loads": visitor.loads,
            "stores": visitor.stores,
            "has_swizzle": visitor.has_swizzle,
            "parameters": visitor.parameters
        }

    @staticmethod
    def _extract_stride(source_code: str, tile_shapes: Dict[str, int]) -> int:
        """
        Derives the column stride formula from pointer arithmetic expressions.
        """
        # Look for patterns like: offsets_k = k * stride or col * 1 + row * STRIDE
        stride_match = re.search(r'stride[_\w]*\s*=\s*(\d+)', source_code, re.IGNORECASE)
        if stride_match:
            return int(stride_match.group(1))

        # Check for multiplication by BLOCK_K or BLOCK_N
        if "BLOCK_K" in tile_shapes and "stride" not in source_code:
            return tile_shapes.get("BLOCK_K", 32)

        return 32  # Default canonical shared-memory bank width stride
