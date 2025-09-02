#!/bin/bash

# Hypea Platform - Automatic Installation Script
# This script will install and configure the entire platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root. Please run as a regular user with sudo privileges."
    fi
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check Ubuntu version
    if ! grep -q "Ubuntu" /etc/os-release; then
        error "This script is designed for Ubuntu. Other distributions are not supported."
    fi
    
    # Check if user has sudo privileges
    if ! sudo -n true 2>/dev/null; then
        error "This user does not have sudo privileges. Please run with a user that has sudo access."
    fi
    
    log "System requirements check passed!"
}

# Install Node.js
install_nodejs() {
    log "Installing Node.js 18..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ $NODE_VERSION -ge 18 ]]; then
            log "Node.js $NODE_VERSION is already installed"
            return
        fi
    fi
    
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    log "Node.js installed: $(node --version)"
}

# Install MySQL
install_mysql() {
    log "Installing MySQL..."
    
    if systemctl is-active --quiet mysql; then
        log "MySQL is already installed and running"
        return
    fi
    
    sudo apt update
    sudo apt install -y mysql-server
    
    # Start MySQL service
    sudo systemctl start mysql
    sudo systemctl enable mysql
    
    log "MySQL installed and started"
}

# Install Nginx
install_nginx() {
    log "Installing Nginx..."
    
    if systemctl is-active --quiet nginx; then
        log "Nginx is already installed and running"
        return
    fi
    
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    log "Nginx installed and started"
}

# Install PM2
install_pm2() {
    log "Installing PM2..."
    
    if command -v pm2 &> /dev/null; then
        log "PM2 is already installed"
        return
    fi
    
    sudo npm install -g pm2
    
    log "PM2 installed"
}

# Install Git
install_git() {
    log "Installing Git..."
    
    if command -v git &> /dev/null; then
        log "Git is already installed"
        return
    fi
    
    sudo apt install -y git
    
    log "Git installed"
}

# Setup database
setup_database() {
    log "Setting up MySQL database..."
    
    # Generate random password
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    # Create database and user
    sudo mysql -e "CREATE DATABASE IF NOT EXISTS hypea_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    sudo mysql -e "CREATE USER IF NOT EXISTS 'hypea_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
    sudo mysql -e "GRANT ALL PRIVILEGES ON hypea_platform.* TO 'hypea_user'@'localhost';"
    sudo mysql -e "FLUSH PRIVILEGES;"
    
    # Add DATABASE_URL to .env.local
    echo "" >> .env.local
    echo "# Database Configuration (Auto-generated)" >> .env.local
    echo "DATABASE_URL=\"mysql://hypea_user:$DB_PASSWORD@localhost:3306/hypea_platform\"" >> .env.local
    
    log "Database created: hypea_platform"
    log "Database user: hypea_user"
    log "Database URL added to .env.local"
}

# Clone repository
clone_repository() {
    log "Cloning Hypea Platform repository..."
    
    if [[ -d "hypea-platform" ]]; then
        warn "Directory 'hypea-platform' already exists. Removing..."
        rm -rf hypea-platform
    fi
    
    git clone https://github.com/mertyukselenn/hypea-platform.git
    cd hypea-platform
    
    log "Repository cloned successfully"
}

# Setup environment
setup_environment() {
    log "Setting up environment variables..."
    
    # Copy example env file
    cp env.example .env.local
    
    # Generate NextAuth secret
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    # Update .env.local with generated values
    sed -i "s|NEXTAUTH_SECRET=\"your-secret-key-here\"|NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\"|g" .env.local
    sed -i "s|NEXTAUTH_URL=\"http://localhost:3000\"|NEXTAUTH_URL=\"http://$(curl -4 icanhazip.com):3000\"|g" .env.local
    
    log "Environment variables configured"
    warn "Please edit .env.local to configure Discord, SMTP, and other services"
}

# Install dependencies
install_dependencies() {
    log "Installing Node.js dependencies..."
    
    # Make sure .env.local exists and has DATABASE_URL
    if ! grep -q "DATABASE_URL" .env.local; then
        error "DATABASE_URL not found in .env.local"
    fi
    
    npm install --only=production
    
    log "Dependencies installed"
}

# Setup database schema
setup_schema() {
    log "Setting up database schema..."
    
    npx prisma generate
    npx prisma db push
    npx prisma db seed
    
    log "Database schema created and seeded"
}

# Build application
build_application() {
    log "Building application..."
    
    npm run build
    
    log "Application built successfully"
}

# Setup PM2
setup_pm2() {
    log "Setting up PM2 process manager..."
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'hypea-platform',
    script: 'npm',
    args: 'start',
    cwd: '$(pwd)',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/hypea-platform/error.log',
    out_file: '/var/log/hypea-platform/access.log',
    log_file: '/var/log/hypea-platform/app.log',
    time: true
  }]
}
EOF
    
    # Create log directory
    sudo mkdir -p /var/log/hypea-platform
    sudo chown $USER:$USER /var/log/hypea-platform
    
    # Start application
    pm2 start ecosystem.config.js --env production
    pm2 save
    pm2 startup
    
    log "PM2 configured and application started"
}

# Setup Nginx
setup_nginx() {
    log "Configuring Nginx..."
    
    SERVER_IP=$(hostname -I | awk '{print $1}')
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/hypea-platform > /dev/null << EOF
server {
    listen 80;
    server_name $SERVER_IP localhost;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout       60s;
        proxy_send_timeout          60s;
        proxy_read_timeout          60s;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/hypea-platform /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    sudo nginx -t
    sudo systemctl reload nginx
    
    log "Nginx configured successfully"
}

# Setup firewall
setup_firewall() {
    log "Configuring firewall..."
    
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    
    log "Firewall configured"
}

# Create backup script
create_backup_script() {
    log "Creating backup script..."
    
    cat > backup.sh << 'EOF'
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/backups"
DB_NAME="hypea_platform"
DB_USER="hypea_user"

# Read database password from .env.local
DB_PASS=$(grep DATABASE_URL .env.local | cut -d':' -f3 | cut -d'@' -f1)

mkdir -p $BACKUP_DIR

# Create database backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/hypea_platform_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/hypea_platform_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "hypea_platform_*.sql.gz" -mtime +30 -delete

echo "Backup completed: hypea_platform_$DATE.sql.gz"
EOF
    
    chmod +x backup.sh
    
    # Add to crontab (daily backup at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/backup.sh >> /var/log/backup.log 2>&1") | crontab -
    
    log "Backup script created and scheduled"
}

# Print final information
print_final_info() {
    SERVER_IP=$(hostname -I | awk '{print $1}')
    
    echo ""
    echo -e "${GREEN}🎉 Hypea Platform Installation Complete! 🎉${NC}"
    echo ""
    echo -e "${BLUE}📋 Installation Summary:${NC}"
    echo -e "   • Platform URL: http://$SERVER_IP"
    echo -e "   • Admin Email: admin@hypea.com"
    echo -e "   • Admin Password: admin123"
    echo -e "   • Database: hypea_platform"
    echo -e "   • Application Path: $(pwd)"
    echo ""
    echo -e "${YELLOW}⚠️  Important Next Steps:${NC}"
    echo -e "   1. Change the default admin password immediately"
    echo -e "   2. Edit .env.local to configure:"
    echo -e "      - Discord OAuth credentials"
    echo -e "      - SMTP email settings"
    echo -e "      - Payment integration"
    echo -e "      - Other third-party services"
    echo -e "   3. Configure SSL certificate for production"
    echo -e "   4. Set up domain name and DNS"
    echo ""
    echo -e "${BLUE}🔧 Management Commands:${NC}"
    echo -e "   • View logs: pm2 logs hypea-platform"
    echo -e "   • Restart app: pm2 restart hypea-platform"
    echo -e "   • Check status: pm2 status"
    echo -e "   • Manual backup: ./backup.sh"
    echo ""
    echo -e "${GREEN}✅ Your Hypea Platform is now running!${NC}"
}

# Main installation function
main() {
    log "Starting Hypea Platform installation..."
    
    check_root
    check_requirements
    
    # Install system dependencies
    sudo apt update
    install_nodejs
    install_mysql
    install_nginx
    install_pm2
    install_git
    
    # Setup application
    clone_repository
    setup_environment
    setup_database
    install_dependencies
    setup_schema
    build_application
    
    # Configure services
    setup_pm2
    setup_nginx
    setup_firewall
    
    # Create utilities
    create_backup_script
    
    # Final information
    print_final_info
}

# Run main function
main "$@"
