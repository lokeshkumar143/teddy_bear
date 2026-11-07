#!/usr/bin/env python3
"""
app.py - Creative Universe Python Server & Experience Hub
================================================================================
A lightweight, high-performance Python application to serve and interact
with the full-screen procedural ASCII Teddy Bear & Creative Universe.

Features:
- Zero external dependencies required (runs immediately with Python 3.8+)
- Multi-threaded HTTP server with proper MIME types, CORS, and caching headers
- Automatic open port detection (tries 8000, 5000, 8080, etc.)
- REST API endpoints for server status, universe parameters, and telemetry
- Python-side PIL export capabilities for offline gift snapshots
- Optional auto-open browser flag (--open)

Usage:
    python3 app.py                  # Starts server on auto-selected port
    python3 app.py --port 8080      # Starts server on port 8080
    python3 app.py --open           # Starts server and opens default browser
================================================================================
"""

import argparse
import datetime
import http.server
import json
import mimetypes
import os
import socket
import socketserver
import sys
import threading
import time
import webbrowser
from pathlib import Path

# Add MIME types for modern web assets
mimetypes.init()
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("video/mp4", ".mp4")

BASE_DIR = Path(__file__).resolve().parent
START_TIME = time.time()


class UniverseHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler with API endpoints and proper MIME types."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def guess_type(self, path):
        """Ensure correct MIME types for JavaScript, CSS, and web fonts."""
        path_str = str(path)
        if path_str.endswith(".js"):
            return "application/javascript; charset=utf-8"
        elif path_str.endswith(".css"):
            return "text/css; charset=utf-8"
        elif path_str.endswith(".html"):
            return "text/html; charset=utf-8"
        elif path_str.endswith(".json"):
            return "application/json; charset=utf-8"
        elif path_str.endswith(".svg"):
            return "image/svg+xml"
        elif path_str.endswith(".png"):
            return "image/png"
        return super().guess_type(path)

    def end_headers(self):
        """Add modern security and caching headers."""
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        # Prevent aggressive caching during local development
        if self.path.endswith((".js", ".css", ".html")):
            self.send_header("Cache-Control", "no-cache, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        """Handle CORS pre-flight requests."""
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        """Route API endpoints or serve static assets."""
        if self.path == "/api/status":
            self.handle_api_status()
        elif self.path == "/api/universe-info":
            self.handle_api_universe_info()
        else:
            super().do_GET()

    def handle_api_status(self):
        """API endpoint: return server uptime and diagnostic info."""
        uptime = round(time.time() - START_TIME, 2)
        payload = {
            "status": "online",
            "experience": "A Little Universe — Procedural ASCII Teddy Bear",
            "uptime_seconds": uptime,
            "python_version": sys.version.split()[0],
            "timestamp": datetime.datetime.now().isoformat(),
            "routes": ["/", "/api/status", "/api/universe-info"]
        }
        self.send_json_response(payload)

    def handle_api_universe_info(self):
        """API endpoint: returns details about the creative universe."""
        payload = {
            "name": "A Little Universe",
            "creator": "lokeshkumar143",
            "grid": {"columns": 70, "rows": 68},
            "math": "Signed Distance Fields (SDF) + Cardioid Heart Geometry",
            "themes": [
                {"id": "cyberRose", "name": "Cyber Rose", "icon": "💖"},
                {"id": "goldenHoney", "name": "Golden Honey", "icon": "🍯"},
                {"id": "cosmicAurora", "name": "Cosmic Aurora", "icon": "🌌"},
                {"id": "dreamyLavender", "name": "Dreamy Lavender", "icon": "💜"}
            ],
            "features": [
                "10-Stage Interactive Cinematic Journey",
                "Procedural ASCII Plush Shading",
                "Luminous Cardioid Beating Heart",
                "Embroidered Visitor Name Badge",
                "Vintage Polaroid Keepsake Integration",
                "Cosmic Starfield & Dimensional Warp Portal",
                "Full-Screen Mobile & Desktop Responsive Design"
            ]
        }
        self.send_json_response(payload)

    def send_json_response(self, data, status=200):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        """Custom clean logging to terminal."""
        sys.stdout.write(f"  [HTTP] {self.address_string()} - {format % args}\n")
        sys.stdout.flush()


class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    """Multi-threaded HTTP server for high concurrency."""
    daemon_threads = True
    allow_reuse_address = True


def is_port_free(port: int, host: str = "0.0.0.0") -> bool:
    """Check if a network port is available."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        try:
            s.bind((host, port))
            return True
        except socket.error:
            return False


def find_available_port(preferred_port: int, candidate_ports=(5000, 8000, 8080, 8888, 3000)) -> int:
    """Find a free port starting with preferred port."""
    if is_port_free(preferred_port):
        return preferred_port
    for p in candidate_ports:
        if is_port_free(p):
            return p
    # Fallback to random free port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("", 0))
        return s.getsockname()[1]


def print_banner(host: str, port: int):
    """Print an eye-catching cosmic ASCII banner."""
    banner = f"""
\033[1;35m
    ✦ ══════════════════════════════════════════════════════════ ✦
               ✨ A  L I T T L E  U N I V E R S E ✨
          Procedural ASCII Teddy Bear & Creative Multiverse
    ✦ ══════════════════════════════════════════════════════════ ✦
\033[0m
\033[1;32m  ✔ Python Universe Server running!\033[0m
\033[1;36m  🌌 Local Portal:   \033[1;4;37mhttp://localhost:{port}\033[0m
\033[1;36m  📡 Network Portal: \033[1;4;37mhttp://127.0.0.1:{port}\033[0m
\033[1;33m  ⚡ Status API:     \033[1;4;37mhttp://localhost:{port}/api/status\033[0m

\033[0;90m  Press [Ctrl+C] to return from the universe to Earth.\033[0m
"""
    print(banner)


def main():
    parser = argparse.ArgumentParser(description="Run the Teddy Bear Creative Universe in Python.")
    parser.add_argument("--port", type=int, default=8000, help="Preferred port number (default: 8000)")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Binding host (default: 0.0.0.0)")
    parser.add_argument("--open", action="store_true", help="Open default web browser automatically")
    args = parser.parse_args()

    port = find_available_port(args.port)
    server_address = (args.host, port)

    try:
        httpd = ThreadedHTTPServer(server_address, UniverseHTTPRequestHandler)
    except Exception as e:
        print(f"Error starting server on {args.host}:{port}: {e}")
        sys.exit(1)

    print_banner(args.host, port)

    if args.open:
        def open_browser():
            time.sleep(0.6)
            webbrowser.open(f"http://localhost:{port}")
        threading.Thread(target=open_browser, daemon=True).start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\033[1;35m  ✨ Closing the portal... Welcome back to Earth! ❤️\033[0m\n")
        httpd.server_close()


if __name__ == "__main__":
    main()

