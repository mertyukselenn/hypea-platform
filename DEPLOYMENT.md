# Deployment Guide

This guide covers deploying Hypea Platform to production environments.

## 🚀 Ubuntu Server Deployment

### Prerequisites

- Ubuntu 20.04+ server
- Root or sudo access
- Domain name pointing to your server
- SSL certificate (Let's Encrypt recommended)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install Nginx
sudo apt install nginx -y

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Git
sudo apt install git -y
```

### Step 2: Database Setup

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE hypea_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hypea_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON hypea_platform.* TO 'hypea_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Application Deployment

```bash
# Create application directory
sudo mkdir -p /var/www/hypea-platform
sudo chown $USER:$USER /var/www/hypea-platform

# Clone repository
cd /var/www/hypea-platform
git clone https://github.com/your-username/hypea-platform.git .

# Install dependencies
npm ci --only=production

# Create environment file
cp env.example .env.local

# Edit environment variables
nano .env.local
```

**Environment Configuration:**
```env
# Production settings
NODE_ENV="production"
NEXTAUTH_URL="https://your-domain.com"
DATABASE_URL="mysql://hypea_user:strong_password_here@localhost:3306/hypea_platform"

# Security
NEXTAUTH_SECRET="generate-a-strong-secret-key"

# Other configurations...
```

### Step 4: Build and Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed database (optional)
npm run db:seed

# Build application
npm run build
```

### Step 5: PM2 Configuration

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'hypea-platform',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/hypea-platform',
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
```

```bash
# Create log directory
sudo mkdir -p /var/log/hypea-platform
sudo chown $USER:$USER /var/log/hypea-platform

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### Step 6: Nginx Configuration

Create `/etc/nginx/sites-available/hypea-platform`:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout       60s;
        proxy_send_timeout          60s;
        proxy_read_timeout          60s;
    }

    # Static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # API rate limiting
    location /api {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/hypea-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 8: Firewall Configuration

```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### Step 9: Monitoring Setup

**Log Rotation:**
```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/hypea-platform
```

```
/var/log/hypea-platform/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 0640 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
```

**System Monitoring:**
```bash
# Install htop for system monitoring
sudo apt install htop -y

# Check application status
pm2 status
pm2 logs hypea-platform
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Navigate to application directory
cd /var/www/hypea-platform

# Pull latest changes
git pull origin main

# Install dependencies
npm ci --only=production

# Run database migrations
npx prisma migrate deploy

# Build application
npm run build

# Restart application
pm2 restart hypea-platform

# Check status
pm2 status
```

### Database Backup

**Automated Backup Script:**
```bash
#!/bin/bash
# /home/ubuntu/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
DB_NAME="hypea_platform"
DB_USER="hypea_user"
DB_PASS="your_password"

mkdir -p $BACKUP_DIR

# Create backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/hypea_platform_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/hypea_platform_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "hypea_platform_*.sql.gz" -mtime +30 -delete

echo "Backup completed: hypea_platform_$DATE.sql.gz"
```

**Setup Cron Job:**
```bash
# Make script executable
chmod +x /home/ubuntu/backup-db.sh

# Add to crontab (daily backup at 2 AM)
crontab -e
0 2 * * * /home/ubuntu/backup-db.sh >> /var/log/backup.log 2>&1
```

### Health Checks

**Application Health Check Script:**
```bash
#!/bin/bash
# /home/ubuntu/health-check.sh

APP_URL="https://your-domain.com"
HEALTH_ENDPOINT="$APP_URL/api/health"

# Check if application is responding
if curl -f -s $HEALTH_ENDPOINT > /dev/null; then
    echo "$(date): Application is healthy"
else
    echo "$(date): Application is down, restarting..."
    pm2 restart hypea-platform
    
    # Send notification (optional)
    # curl -X POST -H 'Content-type: application/json' \
    #   --data '{"text":"Hypea Platform was restarted due to health check failure"}' \
    #   YOUR_SLACK_WEBHOOK_URL
fi
```

**Setup Health Check Cron:**
```bash
# Check every 5 minutes
crontab -e
*/5 * * * * /home/ubuntu/health-check.sh >> /var/log/health-check.log 2>&1
```

## 🔒 Security Hardening

### Server Security

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Configure automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Secure SSH
sudo nano /etc/ssh/sshd_config
```

**SSH Configuration:**
```
Port 2222  # Change from default 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
```

### Application Security

**Environment Variables:**
- Use strong, unique secrets
- Never commit `.env` files
- Rotate keys regularly
- Use different keys for different environments

**Database Security:**
```bash
# MySQL security configuration
sudo mysql -u root -p

# Remove anonymous users
DELETE FROM mysql.user WHERE User='';

# Remove test database
DROP DATABASE IF EXISTS test;

# Update root password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'strong_root_password';

FLUSH PRIVILEGES;
```

## 📊 Performance Optimization

### Database Optimization

**MySQL Configuration (`/etc/mysql/mysql.conf.d/mysqld.cnf`):**
```ini
[mysqld]
# Memory settings
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_log_buffer_size = 64M

# Connection settings
max_connections = 200
wait_timeout = 300

# Query cache (if using MySQL < 8.0)
query_cache_type = 1
query_cache_size = 256M
```

### Application Optimization

**Next.js Configuration:**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
  },
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig
```

**Caching with Redis:**
```bash
# Install Redis
sudo apt install redis-server -y

# Configure Redis
sudo nano /etc/redis/redis.conf
```

```redis
# Memory optimization
maxmemory 512mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000
```

## 🚨 Troubleshooting

### Common Issues

**Application won't start:**
```bash
# Check PM2 logs
pm2 logs hypea-platform

# Check system resources
htop
df -h

# Check database connection
npx prisma db pull
```

**Database connection issues:**
```bash
# Test MySQL connection
mysql -u hypea_user -p hypea_platform

# Check MySQL service
sudo systemctl status mysql
sudo systemctl restart mysql
```

**SSL certificate issues:**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check Nginx configuration
sudo nginx -t
```

**High memory usage:**
```bash
# Check PM2 processes
pm2 monit

# Restart application
pm2 restart hypea-platform

# Check for memory leaks
node --inspect app.js
```

### Performance Issues

**Database slow queries:**
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Check slow queries
SHOW PROCESSLIST;
```

**Application performance:**
```bash
# Check application metrics
pm2 monit

# Analyze bundle size
npm run analyze

# Check for memory leaks
node --inspect --max-old-space-size=4096 server.js
```

## 📞 Support

For deployment issues:
- Check logs: `pm2 logs hypea-platform`
- Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Database logs: `sudo tail -f /var/log/mysql/error.log`
- Contact support: support@hypea.com

---

**Remember to test your deployment in a staging environment before deploying to production!**
