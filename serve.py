#!/usr/bin/env python3
"""Simple HTTP server for the site directory."""
import os, sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

port = int(os.environ.get('PORT', sys.argv[1] if len(sys.argv) > 1 else 3333))
site_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'site')
os.chdir(site_dir)

handler = SimpleHTTPRequestHandler
server = HTTPServer(('', port), handler)
print(f'Serving {site_dir} on http://localhost:{port}')
server.serve_forever()
