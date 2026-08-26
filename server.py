#!/usr/bin/env python3
"""
Trading-OS Local Application Server
Custom robust static file server with auto-mimetypes and CORS
Author: Khalid Abdullah (Trading-OS)
"""

import http.server
import socketserver
import os
import sys
import mimetypes

PORT = 8088
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomStaticServer(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        # Resolve clean path
        clean_path = self.path.split('?')[0].split('#')[0].lstrip('/')
        if not clean_path:
            clean_path = 'index.html'

        full_path = os.path.normpath(os.path.join(DIRECTORY, clean_path))

        # Security check: ensure path stays inside directory
        if not full_path.startswith(DIRECTORY):
            self.send_error(403, "Access Denied")
            return

        if not os.path.exists(full_path) or os.path.isdir(full_path):
            # Try index.html if dir
            if os.path.isdir(full_path) and os.path.exists(os.path.join(full_path, 'index.html')):
                full_path = os.path.join(full_path, 'index.html')
            else:
                self.send_error(404, "File Not Found")
                return

        try:
            with open(full_path, 'rb') as f:
                content = f.read()

            content_type, _ = mimetypes.guess_type(full_path)
            if not content_type:
                if full_path.endswith('.js'):
                    content_type = 'application/javascript'
                elif full_path.endswith('.css'):
                    content_type = 'text/css'
                elif full_path.endswith('.pine'):
                    content_type = 'text/plain'
                else:
                    content_type = 'application/octet-stream'

            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Internal Error: {str(e)}")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    print("=" * 60)
    print("⚡ Trading-OS Strategy Backtester & Pine Script Engine")
    print("=" * 60)
    print(f"🚀 Running locally at: http://localhost:{PORT}")
    print(f"📁 Serving Directory: {DIRECTORY}")
    print("Press Ctrl+C to terminate.")
    print("=" * 60)

    try:
        with socketserver.TCPServer(("127.0.0.1", PORT), CustomStaticServer) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Trading-OS] Server stopped.")
        sys.exit(0)
