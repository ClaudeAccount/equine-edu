
Run: DEP-2026-06-12-mqbl4kwn · 2026-06-12 · Mode: DEPLOYMENT CONVERSION ONLY (engine v2.1)
Source: riding-safety.json (Rider Safety Basics)

---

- ID: DEP-2026-06-12-mqbl4kwn-01
- TYPE: SYSTEM
- LOCATION: /sessions/friendly-bold-brown/mnt/Claude/Projects/Equine Edu/equine-edu-main/equine-edu-main/courses/round-pen/horse-safety/rider-safety-basics
- DESCRIPTION: 8 files written, sha256-verified 1:1 (6 pages + 2 data files).
- CONTEXT: Contract F3
- STATUS: logged

---

- ID: DEP-2026-06-12-mqbl4kwn-02
- TYPE: SYSTEM
- LOCATION: /sessions/friendly-bold-brown/mnt/Claude/Projects/Equine Edu/equine-edu-main/equine-edu-main/index.html
- DESCRIPTION: Hub-card injection disabled via --no-hub; hub binding handled by a separate, logged platform step (pre-existing human-authored card).
- CONTEXT: Contract F5 — explicit operator directive
- STATUS: logged

---

- ID: DEP-2026-06-12-mqbl4kwn-03
- TYPE: SYSTEM
- LOCATION: courses/index.html, Beginner tab, Horse Safety topic row
- DESCRIPTION: Pre-existing human-authored "Rider Safety Basics" coming-soon card activated: converted to the active lesson-card pattern (article + lesson-card-overlay) observed on neighboring live cards; href wired to round-pen/horse-safety/rider-safety-basics/1-index.html; status "Coming Soon" -> "Start". Card description updated from validated T01 fields (original desc referenced emergency dismount/mounted focus not in the validated course scope; T13 locked row requires card metadata to be real). SVG thumbnail preserved unchanged.
- CONTEXT: T13 hub binding; card metadata derived from validated artifact, not authored at deploy time
- STATUS: logged

---

- ID: DEP-2026-06-12-mqbl4kwn-04
- TYPE: SYSTEM
- LOCATION: courses/round-pen/horse-safety/assets/rider-safety-basics/.gitkeep
- DESCRIPTION: Empty assets directory created so pages' verbatim relative image paths (../assets/rider-safety-basics/) resolve unchanged; all 18 image assets are SYNTHETIC manifest entries (asset-manifest-riding-safety-v1, EF1) — physical files pending production.
- CONTEXT: Stage 5 asset layer; lossless link-resolution requirement (DEP-001-03 precedent)
- STATUS: logged

---
