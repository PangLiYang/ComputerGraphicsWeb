#!/bin/bash

# Set base directory
BASE_DIR="/web/py2236"

# Set permissions for the base directory and its contents
chmod 711 "$BASE_DIR/graphics/"

# Set permissions for the files and directories in 'graphics'
chmod 644 "$BASE_DIR/graphics/index.html"
chmod 644 "$BASE_DIR/graphics/gpu_report.pdf"
chmod 644 "$BASE_DIR/graphics/multicore_report.pdf"

# Set permissions for homework directories and their contents
chmod 711 "$BASE_DIR/graphics/hw1/"
chmod 711 "$BASE_DIR/graphics/hw2/"
chmod 711 "$BASE_DIR/graphics/hw3/"
chmod 711 "$BASE_DIR/graphics/hw4/"
chmod 711 "$BASE_DIR/graphics/hw5/"
chmod 711 "$BASE_DIR/graphics/hw6/"
chmod 711 "$BASE_DIR/graphics/hw7/"
chmod 711 "$BASE_DIR/graphics/hw8/"
chmod 711 "$BASE_DIR/graphics/hw9/"
chmod 711 "$BASE_DIR/graphics/hw9_2/"
chmod 711 "$BASE_DIR/graphics/hw10/"
chmod 711 "$BASE_DIR/graphics/final/"
chmod 711 "$BASE_DIR/graphics/final2/"
chmod 711 "$BASE_DIR/graphics/final3/"
chmod 711 "$BASE_DIR/graphics/final4/"
chmod 711 "$BASE_DIR/graphics/final5/"
chmod 711 "$BASE_DIR/graphics/final6/"

chmod 644 "$BASE_DIR/graphics/hw1/"*
chmod 644 "$BASE_DIR/graphics/hw2/"*
chmod 644 "$BASE_DIR/graphics/hw3/"*
chmod 644 "$BASE_DIR/graphics/hw4/"*
chmod 644 "$BASE_DIR/graphics/hw5/"*
chmod 644 "$BASE_DIR/graphics/hw6/"*
chmod 644 "$BASE_DIR/graphics/hw7/"*
chmod 644 "$BASE_DIR/graphics/hw8/"*
chmod 644 "$BASE_DIR/graphics/hw9/"*
chmod 644 "$BASE_DIR/graphics/hw9_2/"*
chmod 644 "$BASE_DIR/graphics/hw10/"*
chmod 644 "$BASE_DIR/graphics/final/"*
chmod 644 "$BASE_DIR/graphics/final2/"*
chmod 644 "$BASE_DIR/graphics/final3/"*
chmod 644 "$BASE_DIR/graphics/final4/"*
chmod 644 "$BASE_DIR/graphics/final5/"*
chmod 644 "$BASE_DIR/graphics/final6/"*

chmod 711 "$BASE_DIR/graphics/hw8/textures/"
chmod 644 "$BASE_DIR/graphics/hw8/textures/"*
chmod 711 "$BASE_DIR/graphics/hw9/textures/"
chmod 644 "$BASE_DIR/graphics/hw9/textures/"*
chmod 711 "$BASE_DIR/graphics/hw10/textures/"
chmod 644 "$BASE_DIR/graphics/hw10/textures/"*


echo "Permissions have been updated successfully."