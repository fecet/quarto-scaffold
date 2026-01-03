render:
    quarto render deck.qmd

# Combine SCSS source files into single theme file
scss-combine:
    cat styles/_*.scss > styles/custom.scss

# Sync slide assets to project assets (one-way)
sync-assets:
    #!/usr/bin/env bash
    for dir in slides/*/assets; do
        if [ -d "$dir" ]; then
            rsync -av "$dir/" assets/
        fi
    done

# Install Quarto extensions
setup-extensions:
    # quarto add emilhvitfeldt/quarto-revealjs-editable --no-prompt
    quarto add ofkoru/quarto-leader-line --no-prompt

# Speed up ours.mp4 2x starting from 5s
speedup-ours:
    ffmpeg -ss 5 -i assets/fold-laundry/ours.mp4 -filter:v "setpts=0.5*PTS" -filter:a "atempo=2.0" -y assets/fold-laundry/ours-fast.mp4

# Convert to plain markdown (strip Quarto/Reveal.js syntax)
plain:
    pandoc deck.revealjs.md -t markdown-raw_html-raw_attribute-native_divs-native_spans-bracketed_spans-fenced_divs-header_attributes-link_attributes --lua-filter=filters/remove-images.lua --wrap=none

# Convert to pure text (no markdown, no images)
text:
    #!/usr/bin/env bash
    pandoc deck.revealjs.md -t plain --wrap=none | sed '/^\[\]$/d' | grep -vF '{{ "{{" }}' | cat -s

# Pack presentation files for AI context
pack:
    #!/usr/bin/env bash
    repomix --no-gitignore --include "deck.qmd,slides/**/*.md,*.md,deck.revealjs.md" -o repomix-output.md --style markdown
