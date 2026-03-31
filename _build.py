#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build script to assemble Lartica Bakehouse files with proper UTF-8 encoding."""
import os

def read_part(name):
    path = os.path.join('_parts', name)
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, parts):
    content = '\n'.join(parts)
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print(f"  ✓ {path} ({len(content)} bytes)")

print("Building Lartica Bakehouse files...")

# Read all parts and assemble
write_file('index.html', [read_part('html1.txt'), read_part('html2.txt'), read_part('html3.txt')])
write_file('css/styles.css', [read_part('css1.txt'), read_part('css2.txt'), read_part('css3.txt'), read_part('css4.txt')])
write_file('js/main.js', [read_part('js1.txt'), read_part('js2.txt'), read_part('js3.txt')])

print("Done!")
