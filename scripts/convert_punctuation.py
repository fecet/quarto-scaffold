#!/usr/bin/env python3
"""Convert Chinese punctuation to ASCII equivalents in slide files."""

from pathlib import Path

# Chinese -> ASCII punctuation mapping
PUNCTUATION_MAP = {
    "，": ",",
    "。": ".",
    "：": ":",
    "；": ";",
    "！": "!",
    "？": "?",
    """: '"',
    """: '"',
    "'": "'",
    "'": "'",
    "（": "(",
    "）": ")",
    "【": "[",
    "】": "]",
    "《": "<",
    "》": ">",
    "、": ",",
    "～": "~",
    "…": "...",
}


def convert_file(path: Path, *, dry_run: bool = False) -> list[str]:
    """Convert Chinese punctuation in a file. Returns list of changes."""
    text = path.read_text()
    changes: list[str] = []

    for zh, en in PUNCTUATION_MAP.items():
        if zh in text:
            count = text.count(zh)
            changes.append(f"  {zh} -> {en} ({count}x)")
            text = text.replace(zh, en)

    if changes and not dry_run:
        path.write_text(text)

    return changes


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "path",
        nargs="?",
        default="slides",
        help="Directory or file to process (default: slides)",
    )
    parser.add_argument(
        "-n", "--dry-run", action="store_true", help="Show changes without modifying"
    )
    args = parser.parse_args()

    target = Path(args.path)
    files = [target] if target.is_file() else sorted(target.glob("**/*.md"))

    for f in files:
        changes = convert_file(f, dry_run=args.dry_run)
        if changes:
            prefix = "[DRY RUN] " if args.dry_run else ""
            print(f"{prefix}{f}:")
            print("\n".join(changes))


if __name__ == "__main__":
    main()
