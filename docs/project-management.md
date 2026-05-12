# Karasi Desk Project Management Setup

This repository is configured for issue-first execution with GitHub Projects.

## Tracking Model

1. Issues are the source of truth for all work.
2. A single GitHub Project tracks lifecycle state.
3. Milestones track delivery phases.

## Project Status Column

Create a single-select field named Status with these options:

- Backlog
- Ready
- In Progress
- In Review
- Done
- Blocked

## Required Project Fields

Add these custom fields in your GitHub Project:

- Area: Desk, Call, English, Mathematics, Law, UI/Brand, Infra, DevEx
- Priority: P0, P1, P2
- Size: XS, S, M, L
- Sprint: text or iteration field
- Target date: date field
- Risk: Low, Medium, High

## Milestones

Create these milestones:

1. Platform Foundation
2. Live Desk and Call MVP
3. Subject Rooms v1
4. Production Hardening

## Epic Structure

Create one Epic issue for each area:

1. Real-time Desk
2. Integrated Call
3. English Room
4. Mathematics Room
5. Law Room
6. Visual System
7. PWA and Deployment

## Automation Included In This Repo

The following workflows are already committed:

- .github/workflows/auto-add-to-project.yml
- .github/workflows/project-status-on-pr.yml

Required repository variables:

- KARASI_PROJECT_URL
- KARASI_PROJECT_ID
- KARASI_PROJECT_STATUS_FIELD_ID
- KARASI_STATUS_IN_REVIEW_OPTION_ID
- KARASI_STATUS_DONE_OPTION_ID

Required repository secret:

- KARASI_PROJECT_PAT

PAT scopes should include repo and project.

## Bootstrap Labels, Milestones, and Initial Backlog

Use scripts/github/bootstrap-gh.sh after installing GitHub CLI and authenticating.
