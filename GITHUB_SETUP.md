# GitHub Setup Guide

Bu rehber, Hypea Platform projesini GitHub'a yüklemek ve otomatik deployment kurmak için gerekli adımları açıklar.

## 🚀 GitHub Repository Kurulumu

### 1. Repository Oluşturma

1. GitHub'da yeni repository oluşturun: `hypea-platform`
2. Repository'yi public veya private yapabilirsiniz
3. README, .gitignore veya license eklemeyin (zaten mevcut)

### 2. Projeyi GitHub'a Push Etme

```bash
# Git repository'sini başlatın
git init

# Tüm dosyaları staging area'ya ekleyin
git add .

# İlk commit'i oluşturun
git commit -m "🎉 Initial commit - Hypea Platform"

# GitHub repository'sini remote olarak ekleyin
git remote add origin https://github.com/mertyukselenn/hypea-platform.git

# Ana branch'i main olarak ayarlayın
git branch -M main

# Projeyi GitHub'a push edin
git push -u origin main
```

## 🔧 GitHub Actions Secrets Kurulumu

Repository Settings > Secrets and variables > Actions bölümünden aşağıdaki secret'ları ekleyin:

### Production Deployment Secrets
```
PRODUCTION_HOST=your-production-server-ip
PRODUCTION_USER=your-ssh-username
PRODUCTION_SSH_KEY=your-private-ssh-key
```

### Staging Deployment Secrets (Opsiyonel)
```
STAGING_HOST=your-staging-server-ip
STAGING_USER=your-ssh-username
STAGING_SSH_KEY=your-staging-server-ip-key
```

### Discord Notifications
```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
```

## 🐳 Docker Registry Setup

GitHub Container Registry kullanmak için:

1. Repository Settings > Actions > General
2. "Workflow permissions" bölümünde "Read and write permissions" seçin
3. "Allow GitHub Actions to create and approve pull requests" işaretleyin

## 📋 One-Click Installation Scripts

### Ubuntu Server için Tek Komut Kurulum

**Yöntem 1: Direct Installation**
```bash
curl -fsSL https://raw.githubusercontent.com/mertyukselenn/hypea-platform/main/quick-install.sh | bash
```

**Yöntem 2: Docker ile Kurulum**
```bash
# Repository'yi klonlayın
git clone https://github.com/mertyukselenn/hypea-platform.git
cd hypea-platform

# Environment dosyasını kopyalayın
cp env.docker .env

# Docker ile başlatın
docker-compose up -d
```

**Yöntem 3: Manuel Kurulum**
```bash
# Repository'yi klonlayın
git clone https://github.com/mertyukselenn/hypea-platform.git
cd hypea-platform

# Kurulum scriptini çalıştırın
chmod +x install.sh
./install.sh
```

## 🔐 SSH Key Setup (Production Deployment için)

### 1. SSH Key Oluşturma
```bash
# Yeni SSH key oluşturun
ssh-keygen -t ed25519 -C "github-actions@hypea-platform" -f ~/.ssh/hypea-platform

# Public key'i sunucuya kopyalayın
ssh-copy-id -i ~/.ssh/hypea-platform.pub user@your-server-ip
```

### 2. GitHub Secret'a Private Key Ekleme
```bash
# Private key içeriğini kopyalayın
cat ~/.ssh/hypea-platform

# Bu içeriği GitHub > Settings > Secrets > PRODUCTION_SSH_KEY olarak ekleyin
```

## 🌐 Domain Setup

### 1. DNS Konfigürasyonu
```
A Record: your-domain.com → your-server-ip
CNAME: www.your-domain.com → your-domain.com
```

### 2. SSL Certificate (Let's Encrypt)
```bash
# Certbot kurulumu
sudo apt install certbot python3-certbot-nginx

# SSL certificate alın
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

## 📊 Monitoring & Logging

### 1. Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# Application logs
pm2 logs hypea-platform

# System resources
htop
```

### 2. Docker Monitoring
```bash
# Container status
docker-compose ps

# Container logs
docker-compose logs -f app

# System cleanup
docker system prune -f
```

## 🔄 Update Process

### Automatic Updates (GitHub Actions)
1. Code'u main branch'e push edin
2. GitHub Actions otomatik olarak test, build ve deploy edecek
3. Discord'a bildirim gönderilecek

### Manual Updates
```bash
# Sunucuda
cd /var/www/hypea-platform
git pull origin main

# Docker ile
docker-compose pull
docker-compose up -d --remove-orphans

# PM2 ile
npm run build
pm2 restart hypea-platform
```

## 🚨 Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# MySQL service kontrolü
sudo systemctl status mysql
sudo systemctl restart mysql

# Database bağlantı testi
mysql -u hypea_user -p hypea_platform
```

**2. Application Won't Start**
```bash
# PM2 logs kontrolü
pm2 logs hypea-platform

# Port kullanım kontrolü
sudo lsof -i :3000

# Memory kullanım kontrolü
free -h
```

**3. Nginx Configuration Error**
```bash
# Nginx test
sudo nginx -t

# Nginx reload
sudo systemctl reload nginx

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## 📞 Support

- **GitHub Issues**: Repository'de issue açın
- **Documentation**: README.md ve DEPLOYMENT.md dosyalarını kontrol edin
- **Logs**: Application ve system loglarını kontrol edin

## 🎯 Quick Commands Reference

```bash
# GitHub'a push
git add .
git commit -m "Update: description"
git push origin main

# Docker deployment
docker-compose up -d

# PM2 management
pm2 restart hypea-platform
pm2 logs hypea-platform
pm2 monit

# Database backup
./backup.sh

# SSL renewal
sudo certbot renew

# System update
sudo apt update && sudo apt upgrade -y
```

---

**Bu setup ile GitHub'dan tek script ile otomatik kurulum yapabilir ve CI/CD pipeline ile otomatik deployment sağlayabilirsiniz!** 🚀
