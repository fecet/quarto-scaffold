#!/usr/bin/env python3
"""Live reload server with file-watch auto-render for Quarto slides."""

import subprocess
import webbrowser

from livereload import Server

PORT = 5555


def render():
    """Render Quarto slides."""
    subprocess.run(["quarto", "render", "deck.qmd"], check=False)


if __name__ == "__main__":
    # Initial build
    print("Building slides...")
    render()

    server = Server()
    server.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

    # Watch source files → trigger render
    # delay="forever" means no browser reload (handled by output file watch)
    server.watch("deck.qmd", render, delay="forever")
    server.watch("slides/**/*.md", render, delay="forever")
    server.watch("slides/*/assets/*", render, delay="forever")
    server.watch("styles/_*.scss", render, delay="forever")

    # Watch output files → reload browser
    server.watch("deck.html")
    server.watch("deck_files/**/*")
    server.watch("assets/*")

    url = f"http://localhost:{PORT}/deck.html"
    print(f"Serving at {url}")
    print("Watching: deck.qmd, slides/**/*.md, slides/*/assets/*, styles/_*.scss")
    print("Browser reloads when deck.html changes")

    # Open browser after server starts
    webbrowser.open(url)

    server.serve(port=PORT, open_url_delay=None)
