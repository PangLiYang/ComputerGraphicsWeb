#!/bin/bash

# Set base directory
BASE_DIR="/web/py2236"

# Set permissions for the base directory and its contents
chmod 711 "$BASE_DIR/graphics/"

# Set permissions for the files and directories in 'graphics'
chmod 644 "$BASE_DIR/graphics/index.html"

# Set permissions for homework directories and their contents
chmod 711 "$BASE_DIR/graphics/hw1/"
chmod 711 "$BASE_DIR/graphics/hw2/"
chmod 644 "$BASE_DIR/graphics/hw1/"*
chmod 644 "$BASE_DIR/graphics/hw2/"*

echo "Permissions have been updated successfully."