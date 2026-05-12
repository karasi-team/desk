# Karasi Desk

Karasi Desk is a studio-grade, one-on-one learning platform built around synchronized teaching sessions. It combines a shared interactive desk (canvas), built-in audio/video communication, and subject-specific learning rooms in a focused, professional interface.

## Product Brief

### What it is
Karasi Desk is a high-fidelity Progressive Web App for live tutoring and instruction on karasi.cloud.

### Core goals
- Real-time synchronization of workspace and call.
- Modular subject tools for English, Mathematics, and Law.
- Professional Emerald and Coral visual language optimized for clarity.
- Cross-platform accessibility and strong runtime performance.

### Key modules
- Desk: Shared low-latency canvas for drawing and annotation.
- Call: Native real-time audio/video communication.
- Subject Rooms:
  - English: text analysis, shared reading, vocabulary exercises.
  - Mathematics: LaTeX, coordinate planes, geometric proof workflows.
  - Law: dense document annotation for legal academic content.

### Technical direction
- Frontend: React + Vite (PWA).
- Monorepo: Turborepo with pnpm workspaces.
- Backend: Supabase for auth, PostgreSQL, and real-time state.
- Hosting: Cloudflare Pages on karasi.cloud.
- Real-time engine: Yjs or WebRTC for synchronized canvas and peer communication.

## Design Direction
- Brand: Karasi Desk.
- Palette:
  - Emerald range: #174F1C to #89DC90.
  - Coral range: #FB6A80 to #C70522.
  - Neutral off-white/soft gray surfaces.
- Typography:
  - Headings: Poppins.
  - Body: Lato.

## Full Specification

See the complete product specification in [PROJECT_SPEC.md](PROJECT_SPEC.md).