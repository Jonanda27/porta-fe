# PORTA Web Frontend - AI Agent Guidelines & Pre-Completion Protocol

## 🚨 MANDATORY PROTOCOL: Zero-Error Verification Before Completion

You must ALWAYS ensure that any code modification, addition, or refactoring in this repository is **100% free of compile, type, and build errors** before concluding your response to the user.

### Verification Checklist (Must Execute Before Answering):

1. **TypeScript Typecheck (`tsc --noEmit`)**:
   Run the typecheck command:
   - `pnpm exec tsc --noEmit` (or `pnpm typecheck`)

2. **Next.js Production Build**:
   Verify that the production build succeeds cleanly without broken routes or import failures:
   - `pnpm build`

3. **Self-Correction Policy**:
   - If ANY error, warning, or broken import occurs, DO NOT ignore it or pass it to the user.
   - Fix the root cause immediately and rerun the check until exit code is `0`.
   - Never use `React.FC` for components (use standard function definitions to prevent React 18/19 type collisions).
   - Project is a standalone Next.js frontend web app (backend is hosted separately).
