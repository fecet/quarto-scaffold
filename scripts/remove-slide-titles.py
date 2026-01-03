#!/usr/bin/env python3
"""Remove the first line (title) from each slide index.md file."""

from pathlib import Path

SLIDES_DIR = Path(__file__).parent.parent / "slides"

# Slides to process (excluding title which has different structure)
SLIDES = [
    "ai-frontier-moravecs-paradox",
    "robot-chatgpt-moment",
    "fold-laundry-demos",
    "pomdp-partial-observability",
    "big-world-hypothesis",
    "vla-generalization-illusion",
    "vla-data-illusion",
    "vla-verticalized-llm",
    "token-world-vs-big-world",
    "embodiment-kitten-experiment",
    "crystallized-to-fluid-intelligence",
    "ilya-timeline",
]

def main():
    for slide in SLIDES:
        index_path = SLIDES_DIR / slide / "index.md"
        if not index_path.exists():
            print(f"SKIP: {index_path} not found")
            continue

        lines = index_path.read_text().splitlines(keepends=True)
        if lines and lines[0].startswith("##"):
            # Remove first line
            new_content = "".join(lines[1:])
            index_path.write_text(new_content)
            print(f"OK: {slide}/index.md - removed title line")
        else:
            print(f"SKIP: {slide}/index.md - first line is not a title")

if __name__ == "__main__":
    main()
