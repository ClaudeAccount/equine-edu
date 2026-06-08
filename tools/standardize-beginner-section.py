#!/usr/bin/env python3
"""
Equine Edu — Beginner Course Section Standardizer
==================================================
Replaces two sections in every beginner course index.html:

  1. <section class="track-section">  →  "Built for Anyone Starting Their
     Horse Journey" (standardized wording, no Beginner Level label)

  2. <section class="cta-section">    →  "Start Building Your Equine
     Knowledge." (standardized wording, course button href preserved)

Usage:
  python3 standardize-beginner-section.py
  python3 standardize-beginner-section.py path/to/course/index.html ...

Add new course paths to BEGINNER_INDEX_FILES to include them automatically.
"""

import re
import sys
import os

# ── Standard replacement block ──────────────────────────────────────────────
# This is the canonical version. Edit here to update ALL courses at once.
STANDARD_TRACK_SECTION = """\
<section class="track-section">
  <div class="track-inner">
    <div class="fade-in">
      <h2 class="section-title" style="color:var(--white);">Built for Anyone Starting Their Horse Journey</h2>
      <p class="section-sub">Whether you're just starting out or want to understand horses more clearly, this course meets you where you are.</p>
      <ul class="track-features">
        <li><span class="track-dot"></span>No prior horse knowledge required</li>
        <li><span class="track-dot"></span>Clear, confident language anyone can follow</li>
        <li><span class="track-dot"></span>For anyone learning to understand horses more clearly and confidently.</li>
        <li><span class="track-dot"></span>A clear, detailed look at each topic and how to understand it confidently.</li>
      </ul>
    </div>

    <div class="track-visual fade-in">
      <h4>Who This Course Is For</h4>
      <ul class="alignment-list">
        <li><span class="track-dot"></span>New students and individuals learning the basics</li>
        <li><span class="track-dot"></span>Trainers building structured programs for students</li>
        <li><span class="track-dot"></span>Horse enthusiasts who want to better understand horses</li>
        <li><span class="track-dot"></span>Students learning evaluation and show basics</li>
        <li><span class="track-dot"></span>Anyone building confidence in horse terminology</li>
      </ul>
    </div>
  </div>
</section>"""

# ── Beginner course index.html paths (relative to this script's directory) ──
# Add new courses here as they are created.
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
COURSE_ROOT = os.path.join(SCRIPT_DIR, "..", "courses", "beginner")

BEGINNER_INDEX_FILES = [
    os.path.join(COURSE_ROOT, "colors-markings", "face-markings",     "index.html"),
    os.path.join(COURSE_ROOT, "colors-markings", "leg-markings",      "index.html"),
    os.path.join(COURSE_ROOT, "colors-markings", "common-horse-colors","index.html"),
    os.path.join(COURSE_ROOT, "anatomy",          "parts-of-horse",    "index.html"),
    os.path.join(COURSE_ROOT, "anatomy",          "parts-of-hoof",     "index.html"),
    os.path.join(COURSE_ROOT, "horse-and-pony-breeds",                 "index.html"),
    os.path.join(COURSE_ROOT, "safety-around-horses",                  "index.html"),
    os.path.join(COURSE_ROOT, "horse-senses",                          "index.html"),
    os.path.join(COURSE_ROOT, "common-terms",                          "index.html"),
]

# ── Standard CTA block (href is extracted from existing button and re-inserted)
STANDARD_CTA_TEMPLATE = """\
<section class="cta-section">
  <div class="cta-inner fade-in">
    <p class="section-label" style="text-align:center; display:block;">Ready to Start?</p>
    <h2 class="section-title">Start Building Your Equine Knowledge.</h2>
    <p class="section-sub">Explore structured lessons, practice what you've learned, and build confidence one step at a time.</p>
    <a href="{href}" class="btn-primary">Start the Course</a>
  </div>
</section>"""

# ── Standard curriculum header (sits above the module-list div) ──────────────
STANDARD_CURRICULUM_LABEL   = '<p class="section-label">Course Curriculum</p>'
STANDARD_CURRICULUM_TITLE   = '<h2 class="section-title">A Step-by-Step Learning Experience.</h2>'
STANDARD_CURRICULUM_SUB     = '<p class="section-sub">Progress through structured modules that introduce new concepts, reinforce key ideas, and help you build lasting understanding.</p>'

# ── Regex patterns ────────────────────────────────────────────────────────────
TRACK_PATTERN = re.compile(
    r'<section class="track-section">.*?</section>',
    re.DOTALL
)
CTA_PATTERN = re.compile(
    r'<section class="cta-section">.*?</section>',
    re.DOTALL
)
# Matches the label + title + sub inside a curriculum-section (non-greedy)
CURRICULUM_HEADER_PATTERN = re.compile(
    r'(<p class="section-label">Course Curriculum</p>\s*)'
    r'<h2 class="section-title">.*?</h2>\s*'
    r'<p class="section-sub">.*?</p>',
    re.DOTALL
)
HREF_PATTERN = re.compile(r'<a href="([^"]+)" class="btn-primary"')

def standardize(path):
    path = os.path.normpath(path)
    if not os.path.isfile(path):
        print(f"  SKIP  (not found): {path}")
        return False

    try:
        with open(path, "r", encoding="utf-8") as f:
            original = f.read()
    except OSError as e:
        print(f"  SKIP  (cannot read): {path} — {e}")
        return False

    updated = original
    changed = False

    # ── 1. Standardize track-section ─────────────────────────────────────────
    if '<section class="track-section">' in updated:
        new = TRACK_PATTERN.sub(STANDARD_TRACK_SECTION, updated)
        if new != updated:
            updated = new
            changed = True

    # ── 2. Standardize curriculum section header ──────────────────────────────
    if 'class="curriculum-section"' in updated:
        curriculum_replacement = (
            STANDARD_CURRICULUM_LABEL + "\n    " +
            STANDARD_CURRICULUM_TITLE + "\n    " +
            STANDARD_CURRICULUM_SUB
        )
        new = CURRICULUM_HEADER_PATTERN.sub(
            lambda m: m.group(1) + STANDARD_CURRICULUM_TITLE + "\n    " + STANDARD_CURRICULUM_SUB,
            updated
        )
        if new != updated:
            updated = new
            changed = True

    # ── 3. Standardize cta-section (preserve button href) ────────────────────
    if '<section class="cta-section">' in updated:
        cta_match = CTA_PATTERN.search(updated)
        if cta_match:
            href_match = HREF_PATTERN.search(cta_match.group(0))
            href = href_match.group(1) if href_match else "#"
            standard_cta = STANDARD_CTA_TEMPLATE.format(href=href)
            new = CTA_PATTERN.sub(standard_cta, updated)
            if new != updated:
                updated = new
                changed = True

    if not changed:
        print(f"  OK    (already standard): {path}")
        return True

    with open(path, "w", encoding="utf-8") as f:
        f.write(updated)

    print(f"  UPDATED: {path}")
    return True

def main():
    targets = sys.argv[1:] if len(sys.argv) > 1 else BEGINNER_INDEX_FILES
    print(f"\nEquine Edu — Standardizing beginner track-section across {len(targets)} file(s)\n")
    updated = sum(1 for p in targets if standardize(p))
    print(f"\nDone. {updated}/{len(targets)} file(s) processed.\n")

if __name__ == "__main__":
    main()
