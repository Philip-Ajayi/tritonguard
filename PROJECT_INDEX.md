# tritonguard — Project Index

Assembled from the supplied implementation notes.

## Files

- `.env.example`
- `Dockerfile`
- `README.md`
- `backend/Dockerfile`
- `backend/app/api/routes.py`
- `backend/app/core/ast_analyzer.py`
- `backend/app/core/bank_conflict_engine.py`
- `backend/app/core/config.py`
- `backend/app/core/swizzle_synthesizer.py`
- `backend/app/main.py`
- `backend/app/samples/triton_kernels.py`
- `backend/app/services/nebius_client.py`
- `backend/app/services/sandbox_runner.py`
- `backend/requirements.txt`
- `backend/tests/test_analyzer.py`
- `backend/tests/test_api.py`
- `backend/tests/test_bank_conflicts.py`
- `colab/tritonguard_t4_runner.py`
- `docker-compose.yml`
- `frontend/Dockerfile`
- `frontend/next.config.js`
- `frontend/package.json`
- `frontend/src/app/globals.css`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/components/BankHeatmap.tsx`
- `frontend/src/components/BenchmarkPanel.tsx`
- `frontend/src/components/ColabBridgeModal.tsx`
- `frontend/src/components/KernelEditor.tsx`
- `frontend/src/components/Navbar.tsx`
- `frontend/src/components/SwizzleDiffViewer.tsx`
- `frontend/src/types/index.ts`
- `frontend/tailwind.config.js`
- `frontend/tsconfig.json`

## Formatting and validation

Trailing whitespace and excessive blank lines were cleaned up. Source indentation was retained to avoid changing program semantics. The projects have not been built, tested, deployed, or security-audited as part of this packaging step; review and run their tests before production use.
