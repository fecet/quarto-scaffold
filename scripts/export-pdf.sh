#!/bin/bash
# Export Quarto Reveal.js slides to PDF using decktape
#
# Usage: ./export-pdf.sh [output.pdf]
#
# Patches decktape to use 'domcontentloaded' instead of 'networkidle0'
# to avoid timeout issues with autoplay videos.

set -e

OUTPUT="${1:-deck.pdf}"
PORT=5580
DECKTAPE_JS="$(dirname "$(which decktape)")/../lib/node_modules/decktape/decktape.js"

# Find decktape.js path (handle different install locations)
if [[ ! -f "$DECKTAPE_JS" ]]; then
    DECKTAPE_JS="$(npm root -g)/decktape/decktape.js"
fi
if [[ ! -f "$DECKTAPE_JS" ]]; then
    echo "Error: Cannot find decktape.js"
    exit 1
fi

# Patch decktape to avoid networkidle0 timeout with autoplay videos
patch_decktape() {
    if grep -q "waitUntil: 'networkidle0'" "$DECKTAPE_JS"; then
        echo "Patching decktape..."
        sed -i.bak \
            -e "s/waitUntil: 'networkidle0'/waitUntil: 'domcontentloaded'/g" \
            -e "s/const load = page.waitForNavigation/\/\/ const load = page.waitForNavigation/g" \
            -e "s/.then(response => load/.then(response => Promise.resolve(response)/g" \
            "$DECKTAPE_JS"
    fi
}

# Restore original decktape
restore_decktape() {
    if [[ -f "${DECKTAPE_JS}.bak" ]]; then
        mv "${DECKTAPE_JS}.bak" "$DECKTAPE_JS"
    fi
}

# Start HTTP server
start_server() {
    python3 -m http.server $PORT --directory . >/dev/null 2>&1 &
    echo $!
}

# Main
trap restore_decktape EXIT

patch_decktape

SERVER_PID=$(start_server)
sleep 2

echo "Exporting to $OUTPUT..."
decktape reveal "http://localhost:$PORT/deck.html" "$OUTPUT" \
    --size 1920x1080 \
    --chrome-path=/usr/bin/google-chrome-stable \
    --load-pause=3000

kill $SERVER_PID 2>/dev/null || true

echo "Done: $OUTPUT"
