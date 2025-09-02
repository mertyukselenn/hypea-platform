# Hypea Platform

A modern, production-ready platform combining community management with e-commerce capabilities. Built with Next.js 14, TypeScript, Prisma, and a beautiful glassmorphism UI inspired by Framixia.

## ✨ Features

### 🏪 **E-Commerce Store**
- Product management with categories and variants
- Digital license key generation and delivery
- Shopier payment integration with IPN validation
- Automated order processing and fulfillment
- Coupon and discount system
- Customer order history and downloads

### 👥 **Community Management**
- Discord OAuth integration
- Custom team roles and permissions
- User management with RBAC (Owner, Admin, Staff, Member)
- Profile system with badges and achievements
- Discord widget integration (small/wide)

### 📰 **Content Management**
- News and announcement system
- Rich text editor for content creation
- SEO-optimized pages with meta tags
- Content scheduling and publishing

### 📋 **Form Builder**
- Dynamic form creation with drag-and-drop
- Discord webhook notifications
- Email notifications via SMTP
- Form submission management
- Custom field types and validation

### 🔐 **Authentication & Security**
- NextAuth.js with Discord and email/password providers
- Email verification and password reset
- Rate limiting and CSRF protection
- XSS protection and input sanitization
- Audit logging for all admin actions
- JWT sessions with configurable expiration

### 🎨 **Modern UI/UX**
- Glassmorphism design with backdrop blur effects
- Dark/light theme support with system preference
- Responsive design for mobile and desktop
- Framer Motion animations and micro-interactions
- Gradient backgrounds and modern color schemes
- shadcn/ui component library

### 🔧 **Admin Panel**
- Comprehensive dashboard with analytics
- User management (search, filter, role assignment, ban/disable)
- Product and category management
- Order and license management
- Form builder and submission viewer
- Site configuration and theme editor
- Integration settings (SMTP, Discord, Payment)
- Audit log viewer with filtering

### 🌐 **Integrations**
- **Discord**: OAuth, webhooks, server widgets
- **Shopier**: Payment processing and IPN validation
- **SunLicense**: Automated license generation
- **SMTP**: Email notifications and verification
- **Redis**: Caching and session storage (optional)

### 🔄 **Developer Features**
- TypeScript for type safety
- Prisma ORM with MySQL support
- API routes with proper error handling
- Middleware for authentication and rate limiting
- Environment-based configuration
- Database seeding and migrations
- ESLint and Prettier configuration

## 🚀 Quick Start

### 🔥 One-Click Installation (Ubuntu)

**Method 1: Direct Installation**
```bash
curl -fsSL https://raw.githubusercontent.com/your-username/hypea-platform/main/quick-install.sh | bash
```

**Method 2: Docker Installation**
```bash
git clone https://github.com/your-username/hypea-platform.git
cd hypea-platform
cp env.docker .env
docker-compose up -d
```

### 📋 Manual Installation

#### Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn
- Discord Application (for OAuth)

#### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/hypea-platform.git
   cd hypea-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   - Database connection string
   - NextAuth secret and URL
   - Discord OAuth credentials
   - SMTP settings
   - Payment integration keys

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Seed the database
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin (after creating admin user)

### Default Admin User
After seeding, you can sign in with:
- **Email**: admin@hypea.com
- **Password**: admin123

⚠️ **Change the default password immediately in production!**

## 📁 Project Structure

```
hypea-platform/
├── app/                      # Next.js 14 app directory
│   ├── (admin)/             # Admin panel pages
│   ├── auth/                # Authentication pages
│   ├── api/                 # API routes
│   ├── account/             # User account pages
│   ├── store/               # E-commerce pages
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Layout components
│   ├── forms/               # Form components
│   └── admin/               # Admin-specific components
├── lib/                     # Utility libraries
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Prisma client
│   ├── mailer.ts            # Email service
│   ├── discord.ts           # Discord integration
│   └── utils.ts             # Utility functions
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeding
├── types/                   # TypeScript type definitions
└── public/                  # Static assets
```

## 🔧 Configuration

### Database Setup

1. **Create MySQL database**
   ```sql
   CREATE DATABASE hypea_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Update DATABASE_URL in .env.local**
   ```
   DATABASE_URL="mysql://username:password@localhost:3306/hypea_platform"
   ```

### Discord Integration

1. **Create Discord Application**
   - Go to https://discord.com/developers/applications
   - Create a new application
   - Go to OAuth2 settings
   - Add redirect URI: `http://localhost:3000/api/auth/callback/discord`

2. **Set up Discord Bot (Optional)**
   - Create a bot in your Discord application
   - Add bot to your server with appropriate permissions
   - Copy webhook URLs for notifications

### SMTP Configuration

Configure your email provider in `.env.local`:

**Gmail Example:**
```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

**Other Providers:**
- **SendGrid**: Use API key authentication
- **Mailgun**: Configure SMTP credentials
- **AWS SES**: Set up SMTP interface

### Payment Integration

**Shopier Setup:**
1. Create Shopier merchant account
2. Get API credentials from dashboard
3. Configure webhook endpoint: `/api/webhooks/shopier`

**SunLicense Setup:**
1. Create SunLicense account
2. Get API credentials
3. Configure license templates

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database
```

### Database Management

**Create Migration:**
```bash
npx prisma migrate dev --name migration_name
```

**Reset Database:**
```bash
npx prisma migrate reset
```

**View Database:**
```bash
npm run db:studio
```

### Adding New Features

1. **Database Changes:**
   - Update `prisma/schema.prisma`
   - Run `npm run db:generate`
   - Create migration: `npx prisma migrate dev`

2. **API Routes:**
   - Create in `app/api/` directory
   - Follow RESTful conventions
   - Add proper error handling and validation

3. **UI Components:**
   - Use shadcn/ui components when possible
   - Follow glassmorphism design patterns
   - Add proper TypeScript types

## 🚀 Deployment

### Environment Setup

1. **Production Environment Variables:**
   ```bash
   NODE_ENV="production"
   NEXTAUTH_URL="https://your-domain.com"
   DATABASE_URL="mysql://user:pass@host:port/db"
   ```

2. **Security Configuration:**
   - Generate strong `NEXTAUTH_SECRET`
   - Use environment-specific API keys
   - Enable HTTPS in production
   - Configure CORS policies

### Deployment Platforms

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Ubuntu Server

1. **Install Dependencies:**
   ```bash
   # Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # MySQL
   sudo apt install mysql-server
   
   # Nginx
   sudo apt install nginx
   
   # PM2
   sudo npm install -g pm2
   ```

2. **Deploy Application:**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/hypea-platform.git
   cd hypea-platform
   
   # Install dependencies
   npm ci --only=production
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start ecosystem.config.js --env production
   ```

3. **Configure Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
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
       }
   }
   ```

4. **SSL Certificate:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Database Migration

**Production Migration:**
```bash
npx prisma migrate deploy
```

**Backup Database:**
```bash
mysqldump -u username -p hypea_platform > backup.sql
```

## 🔒 Security

### Best Practices

1. **Environment Variables:**
   - Never commit `.env` files
   - Use strong, unique secrets
   - Rotate keys regularly

2. **Database Security:**
   - Use connection pooling
   - Enable SSL connections
   - Regular backups
   - Monitor for unusual activity

3. **Application Security:**
   - Keep dependencies updated
   - Use HTTPS in production
   - Implement rate limiting
   - Validate all user inputs
   - Sanitize HTML content

4. **User Data:**
   - Hash passwords with bcrypt
   - Implement GDPR compliance
   - Secure file uploads
   - Log security events

## 📊 Monitoring

### Analytics Integration

**Google Analytics:**
```javascript
// Add to .env.local
GOOGLE_ANALYTICS_ID="GA_MEASUREMENT_ID"
```

**Vercel Analytics:**
```javascript
// Add to .env.local  
VERCEL_ANALYTICS_ID="your_analytics_id"
```

### Error Tracking

**Sentry Integration:**
```bash
npm install @sentry/nextjs
```

Configure in `.env.local`:
```
SENTRY_DSN="your_sentry_dsn"
```

### Performance Monitoring

- Use Next.js built-in analytics
- Monitor Core Web Vitals
- Set up uptime monitoring
- Track API response times

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Follow existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.hypea.com](https://docs.hypea.com)
- **Discord**: [Join our community](https://discord.gg/hypea)
- **Email**: support@hypea.com
- **Issues**: [GitHub Issues](https://github.com/your-username/hypea-platform/issues)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://prisma.io/) - Database toolkit
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://framer.com/motion/) - Animation library

---

**Made with ❤️ by the Hypea Team**
#   h y p e a - p l a t f o r m  
 