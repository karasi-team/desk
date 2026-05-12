#!/usr/bin/env bash

set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is not installed."
  echo "Install: https://cli.github.com/"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Run: gh auth login"
  exit 1
fi

repo="${1:-karasi-team/desk}"

echo "Bootstrapping labels for ${repo}..."
gh label create "type:feature" --color "1D76DB" --description "Feature work" --repo "${repo}" 2>/dev/null || true
gh label create "type:bug" --color "D73A4A" --description "Bug fix" --repo "${repo}" 2>/dev/null || true
gh label create "type:debt" --color "8A2BE2" --description "Tech debt" --repo "${repo}" 2>/dev/null || true
gh label create "type:epic" --color "5319E7" --description "Parent issue" --repo "${repo}" 2>/dev/null || true

gh label create "status:backlog" --color "C5D0E6" --description "Backlog" --repo "${repo}" 2>/dev/null || true
gh label create "status:ready" --color "0E8A16" --description "Ready" --repo "${repo}" 2>/dev/null || true
gh label create "status:in-progress" --color "FBCA04" --description "In progress" --repo "${repo}" 2>/dev/null || true
gh label create "status:in-review" --color "006B75" --description "In review" --repo "${repo}" 2>/dev/null || true
gh label create "status:done" --color "0E8A16" --description "Done" --repo "${repo}" 2>/dev/null || true
gh label create "status:blocked" --color "B60205" --description "Blocked" --repo "${repo}" 2>/dev/null || true

for area in desk call english mathematics law ui-brand infra devex; do
  gh label create "area:${area}" --color "A2EEEF" --description "Area: ${area}" --repo "${repo}" 2>/dev/null || true
done

for p in P0 P1 P2; do
  gh label create "priority:${p}" --color "F9D0C4" --description "Priority ${p}" --repo "${repo}" 2>/dev/null || true
done

for s in XS S M L; do
  gh label create "size:${s}" --color "C2E0C6" --description "Size ${s}" --repo "${repo}" 2>/dev/null || true
done

echo "Creating milestones..."
gh api -X POST "repos/${repo}/milestones" -f title="Platform Foundation" 2>/dev/null || true
gh api -X POST "repos/${repo}/milestones" -f title="Live Desk and Call MVP" 2>/dev/null || true
gh api -X POST "repos/${repo}/milestones" -f title="Subject Rooms v1" 2>/dev/null || true
gh api -X POST "repos/${repo}/milestones" -f title="Production Hardening" 2>/dev/null || true

echo "Creating epic issues..."
gh issue create --repo "${repo}" --title "epic: Real-time Desk" --label "type:epic,status:backlog,area:desk" --body "Objective: Shared synchronized instructional canvas." || true
gh issue create --repo "${repo}" --title "epic: Integrated Call" --label "type:epic,status:backlog,area:call" --body "Objective: Native tutor/student audio-video sessions." || true
gh issue create --repo "${repo}" --title "epic: English Room" --label "type:epic,status:backlog,area:english" --body "Objective: Text analysis, shared reading, vocabulary tools." || true
gh issue create --repo "${repo}" --title "epic: Mathematics Room" --label "type:epic,status:backlog,area:mathematics" --body "Objective: LaTeX, coordinate plane, proof modules." || true
gh issue create --repo "${repo}" --title "epic: Law Room" --label "type:epic,status:backlog,area:law" --body "Objective: High-density legal text annotation experience." || true
gh issue create --repo "${repo}" --title "epic: Visual System" --label "type:epic,status:backlog,area:ui-brand" --body "Objective: Emerald and Coral visual identity implementation." || true
gh issue create --repo "${repo}" --title "epic: PWA and Deployment" --label "type:epic,status:backlog,area:infra" --body "Objective: Supabase integration plus Cloudflare Pages deployment." || true

echo "Bootstrap complete for ${repo}."
