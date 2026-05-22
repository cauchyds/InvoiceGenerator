#!/bin/bash

# ==========================================================================
# Multi-Lingual WYSIWYG Japanese Receipt Generator - macOS Quick Launcher
# ==========================================================================

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${BLUE}${BOLD}🏨 Minshuku Receipt Generator (民宿・費用領受書ジェネレーター)${NC}"
echo -e "=========================================================="
echo -e "Initializing launcher on macOS..."
echo ""

# Function to run Python server
run_server() {
    echo -e "${GREEN}Starting standard Python local server...${NC}"
    echo -e "Local URL: ${BOLD}http://localhost:8000${NC}"
    echo -e "Press [Ctrl + C] in this terminal to stop the server at any time."
    echo ""
    # Open the browser in background
    sleep 1 && open "http://localhost:8000" &
    # Run the server
    python3 -m http.server 8000
}

# Ask user if they prefer local server or direct double-click opening
echo -e "Choose how you want to open the tool:"
echo -e "  ${BOLD}[1]${NC} Open directly as a local file (Fastest, zero terminal background processes)"
echo -e "  ${BOLD}[2]${NC} Start a private local server at http://localhost:8000 (Recommended for advanced features)"
echo ""
read -p "Select option (1 or 2, default is 1): " choice

# Handle default option
choice="${choice:-1}"

if [ "$choice" = "2" ]; then
    cd "$DIR"
    run_server
else
    echo -e "${GREEN}Opening index.html directly in your default browser...${NC}"
    echo -e "This operates 100% offline with zero data leaving your computer."
    open "$DIR/index.html"
fi

echo ""
echo -e "${GREEN}Enjoy your professional receipt generator!${NC}"
