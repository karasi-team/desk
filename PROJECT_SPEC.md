# Project Specifications: Karasi Desk

Karasi Desk is a high-fidelity, interactive learning platform designed for synchronized, one-on-one educational sessions. It integrates a shared digital canvas, real-time audio/video communication, and modular subject-specific tools within a professional, studio-grade interface.

## 1. Core Objectives

### Interactive Synchronization
Facilitate a real-time "Desk" environment where teachers and students share a workspace and a voice/video call simultaneously.

### Modular Learning
Support diverse subjects including English, Mathematics, and Law through hot-swappable interface modules.

### Professional Aesthetic
Maintain a minimalist, "Emerald and Coral" visual identity optimized for focus and technical precision.

### Cross-Platform Accessibility
Operate as a high-performance Progressive Web App (PWA) accessible via the karasi.cloud domain.

## 2. Functional Modules

### The Desk (Canvas)
A shared, low-latency drawing and annotation surface that serves as the primary instructional area.

### The Call (Communication)
Integrated real-time audio and video signaling to eliminate the need for third-party meeting software.

### Subject Rooms

#### English
Tools for text analysis, shared reading, and interactive vocabulary exercises.

#### Mathematics
Support for LaTeX rendering, coordinate planes, and geometric proofs.

#### Law
High-density document annotation and specialized modules for academic legal texts.

## 3. Visual Identity and UI

### Brand Anchor
Karasi Desk (Domain: karasi.cloud).

### Logo
A geometric, isometric "D" representing a folded pane or modular workspace, utilizing primary emerald tones with a coral "interaction fold".

### Color Palette
- Primary: Emerald Greens (#174F1C to #89DC90) for stability and structure.
- Accent: Corals (#FB6A80 to #C70522) for real-time signals and interactive elements.
- Neutral: Off-white and soft grey backgrounds to provide a clean, canvas-like feel.

### Typography
Poppins for headings and Lato for body text to ensure professional readability.

## 4. Technical Architecture

### Framework
React with Vite for the frontend PWA.

### Repository Management
Turborepo monorepo structure (pnpm workspaces) to share logic between the web app, UI library, and real-time engine.

### Backend and Infrastructure
- Supabase: Handles authentication, PostgreSQL database, and real-time state broadcasting.
- Cloudflare Pages: Used for CI/CD and hosting the frontend assets.
- Real-Time Engine: Integration of Yjs or WebRTC for synchronized canvas state and peer-to-peer communication.

## 5. Deployment and Domain

### Primary Domain
karasi.cloud.

### Hosting
Deployed via Cloudflare for optimized global performance and native SSL management.