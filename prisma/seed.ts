import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default admin user
  const adminEmail = 'admin@hypea.com'
  const adminPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPassword,
      role: UserRole.OWNER,
      status: 'ACTIVE',
      emailVerified: new Date(),
      profile: {
        create: {
          username: 'admin',
          displayName: 'Administrator',
          bio: 'Platform administrator',
        }
      }
    },
    include: {
      profile: true
    }
  })

  console.log('✅ Created admin user:', admin.email)

  // Create default team tags
  const teamTags = [
    {
      name: 'ceo',
      displayName: 'CEO',
      color: '#dc2626',
      icon: '👑',
      description: 'Chief Executive Officer',
      priority: 100
    },
    {
      name: 'staff-manager',
      displayName: 'Staff Manager',
      color: '#7c3aed',
      icon: '⚡',
      description: 'Staff management role',
      priority: 90
    },
    {
      name: 'developer',
      displayName: 'Developer',
      color: '#059669',
      icon: '💻',
      description: 'Development team member',
      priority: 80
    },
    {
      name: 'support',
      displayName: 'Support',
      color: '#0ea5e9',
      icon: '🛟',
      description: 'Customer support team',
      priority: 70
    },
    {
      name: 'moderator',
      displayName: 'Moderator',
      color: '#ea580c',
      icon: '🔨',
      description: 'Community moderator',
      priority: 60
    }
  ]

  for (const tag of teamTags) {
    await prisma.teamTag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag
    })
  }

  console.log('✅ Created team tags')

  // Create default categories
  const categories = [
    {
      name: 'Software',
      slug: 'software',
      description: 'Software products and licenses',
      sortOrder: 1
    },
    {
      name: 'Games',
      slug: 'games',
      description: 'Game-related products',
      sortOrder: 2
    },
    {
      name: 'Services',
      slug: 'services',
      description: 'Digital services',
      sortOrder: 3
    }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    })
  }

  console.log('✅ Created categories')

  // Create sample products
  const softwareCategory = await prisma.category.findUnique({
    where: { slug: 'software' }
  })

  if (softwareCategory) {
    const products = [
      {
        name: 'Premium License',
        slug: 'premium-license',
        description: 'Full access to all premium features',
        shortDescription: 'Unlock all premium features',
        price: 29.99,
        status: 'ACTIVE',
        type: 'LICENSE',
        categoryId: softwareCategory.id,
        licenseTemplate: 'PREMIUM-{random}',
        licenseDuration: 365, // 1 year
        maxActivations: 3
      },
      {
        name: 'Basic License',
        slug: 'basic-license',
        description: 'Essential features for getting started',
        shortDescription: 'Perfect for beginners',
        price: 9.99,
        status: 'ACTIVE',
        type: 'LICENSE',
        categoryId: softwareCategory.id,
        licenseTemplate: 'BASIC-{random}',
        licenseDuration: 180, // 6 months
        maxActivations: 1
      }
    ]

    for (const product of products) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product
      })
    }

    console.log('✅ Created sample products')
  }

  // Create default site theme
  const defaultTheme = {
    name: 'default',
    displayName: 'Default Theme',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f1f5f9',
      border: '#e2e8f0'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    isActive: true,
    isDefault: true
  }

  await prisma.siteTheme.upsert({
    where: { name: defaultTheme.name },
    update: {},
    create: {
      ...defaultTheme,
      colors: JSON.stringify(defaultTheme.colors),
      fonts: JSON.stringify(defaultTheme.fonts)
    }
  })

  console.log('✅ Created default theme')

  // Create default site configuration
  const siteConfigs = [
    { key: 'site_name', value: 'Hypea Platform', type: 'string' },
    { key: 'site_description', value: 'Modern community platform with store', type: 'string' },
    { key: 'site_url', value: 'https://hypea.com', type: 'string' },
    { key: 'contact_email', value: 'contact@hypea.com', type: 'string' },
    { key: 'discord_server_id', value: '', type: 'string' },
    { key: 'discord_widget_enabled', value: 'true', type: 'boolean' },
    { key: 'store_enabled', value: 'true', type: 'boolean' },
    { key: 'registration_enabled', value: 'true', type: 'boolean' },
    { key: 'email_verification_required', value: 'true', type: 'boolean' }
  ]

  for (const config of siteConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config
    })
  }

  console.log('✅ Created site configuration')

  console.log('🎉 Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
