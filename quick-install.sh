#!/bin/bash

# Hypea Platform - Quick Installation Script
# One-liner installation from GitHub

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
 _   _                        ____  _       _    __                      
| | | |_   _ _ __   ___  __ _|  _ \| | __ _| |_ / _| ___  _ __ _ __ ___  
| |_| | | | | '_ \ / _ \/ _` | |_) | |/ _` | __| |_ / _ \| '__| '_ ` _ \ 
|  _  | |_| | |_) |  __/ (_| |  __/| | (_| | |_|  _| (_) | |  | | | | | |
|_| |_|\__, | .__/ \___|\__,_|_|   |_|\__,_|\__|_|  \___/|_|  |_| |_| |_|
       |___/|_|                                                         

EOF
echo -e "${NC}"

echo -e "${GREEN}🚀 Starting Hypea Platform Quick Installation...${NC}"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    echo -e "${RED}❌ This script should not be run as root!${NC}"
    echo "Please run as a regular user with sudo privileges."
    exit 1
fi

# Check Ubuntu
if ! grep -q "Ubuntu" /etc/os-release 2>/dev/null; then
    echo -e "${RED}❌ This installer is designed for Ubuntu only!${NC}"
    exit 1
fi

# Check sudo privileges
if ! sudo -n true 2>/dev/null; then
    echo -e "${RED}❌ This user needs sudo privileges!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ System check passed!${NC}"
echo ""

# Confirm installation
echo -e "${BLUE}📋 This will install:${NC}"
echo "   • Node.js 18"
echo "   • MySQL 8.0"
echo "   • Nginx"
echo "   • PM2 Process Manager"
echo "   • Hypea Platform (latest version)"
echo ""

read -p "Continue with installation? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 0
fi

echo ""
echo -e "${GREEN}🔄 Downloading and running installation script...${NC}"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Download the main installation script
curl -fsSL https://raw.githubusercontent.com/your-username/hypea-platform/main/install.sh -o install.sh

# Make it executable
chmod +x install.sh

# Run the installation
./install.sh

# Cleanup
cd /
rm -rf "$TEMP_DIR"

echo -e "${GREEN}🎉 Quick installation completed!${NC}"
