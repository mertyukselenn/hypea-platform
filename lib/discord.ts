import { prisma } from '@/lib/prisma'

export interface DiscordWebhookPayload {
  content?: string
  username?: string
  avatar_url?: string
  embeds?: DiscordEmbed[]
}

export interface DiscordEmbed {
  title?: string
  description?: string
  url?: string
  timestamp?: string
  color?: number
  footer?: {
    text: string
    icon_url?: string
  }
  thumbnail?: {
    url: string
  }
  image?: {
    url: string
  }
  author?: {
    name: string
    url?: string
    icon_url?: string
  }
  fields?: Array<{
    name: string
    value: string
    inline?: boolean
  }>
}

class DiscordService {
  private async getWebhookConfig() {
    const configs = await prisma.siteConfig.findMany({
      where: {
        key: {
          in: [
            'discord_webhook_url',
            'discord_webhook_enabled',
            'discord_audit_webhook_url',
            'discord_order_webhook_url',
            'discord_form_webhook_url'
          ]
        }
      }
    })

    const configMap: Record<string, string> = {}
    configs.forEach(config => {
      configMap[config.key] = config.value
    })

    return {
      webhook_url: configMap.discord_webhook_url || process.env.DISCORD_WEBHOOK_URL || '',
      webhook_enabled: configMap.discord_webhook_enabled === 'true',
      audit_webhook_url: configMap.discord_audit_webhook_url || '',
      order_webhook_url: configMap.discord_order_webhook_url || '',
      form_webhook_url: configMap.discord_form_webhook_url || ''
    }
  }

  async sendWebhook(webhookUrl: string, payload: DiscordWebhookPayload): Promise<boolean> {
    try {
      if (!webhookUrl) {
        console.warn('Discord webhook URL not configured')
        return false
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error('Discord webhook failed:', response.status, response.statusText)
        return false
      }

      return true
    } catch (error) {
      console.error('Discord webhook error:', error)
      return false
    }
  }

  async sendAuditLog(action: string, user: string, details: string, metadata?: any): Promise<boolean> {
    const config = await this.getWebhookConfig()
    
    if (!config.webhook_enabled || !config.audit_webhook_url) {
      return false
    }

    const embed: DiscordEmbed = {
      title: '🔍 Audit Log',
      color: 0x6366f1,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: 'Action',
          value: action,
          inline: true
        },
        {
          name: 'User',
          value: user,
          inline: true
        },
        {
          name: 'Details',
          value: details,
          inline: false
        }
      ]
    }

    if (metadata) {
      embed.fields?.push({
        name: 'Metadata',
        value: `\`\`\`json\n${JSON.stringify(metadata, null, 2)}\`\`\``,
        inline: false
      })
    }

    return this.sendWebhook(config.audit_webhook_url, {
      username: 'Hypea Audit',
      embeds: [embed]
    })
  }

  async sendOrderNotification(orderData: {
    orderNumber: string
    customerName: string
    customerEmail: string
    total: string
    items: Array<{ name: string; quantity: number; price: string }>
  }): Promise<boolean> {
    const config = await this.getWebhookConfig()
    
    if (!config.webhook_enabled || !config.order_webhook_url) {
      return false
    }

    const itemsText = orderData.items
      .map(item => `• ${item.name} (x${item.quantity}) - $${item.price}`)
      .join('\n')

    const embed: DiscordEmbed = {
      title: '🛒 New Order',
      color: 0x10b981,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: 'Order Number',
          value: orderData.orderNumber,
          inline: true
        },
        {
          name: 'Customer',
          value: `${orderData.customerName}\n${orderData.customerEmail}`,
          inline: true
        },
        {
          name: 'Total',
          value: `$${orderData.total}`,
          inline: true
        },
        {
          name: 'Items',
          value: itemsText,
          inline: false
        }
      ]
    }

    return this.sendWebhook(config.order_webhook_url, {
      username: 'Hypea Store',
      embeds: [embed]
    })
  }

  async sendFormSubmission(formData: {
    formTitle: string
    submitterName?: string
    submitterEmail?: string
    fields: Record<string, any>
  }): Promise<boolean> {
    const config = await this.getWebhookConfig()
    
    if (!config.webhook_enabled || !config.form_webhook_url) {
      return false
    }

    const fieldsText = Object.entries(formData.fields)
      .map(([key, value]) => `**${key}:** ${value}`)
      .join('\n')

    const embed: DiscordEmbed = {
      title: '📝 Form Submission',
      description: formData.formTitle,
      color: 0x8b5cf6,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: 'Form Data',
          value: fieldsText || 'No data',
          inline: false
        }
      ]
    }

    if (formData.submitterName || formData.submitterEmail) {
      embed.fields?.unshift({
        name: 'Submitted by',
        value: [formData.submitterName, formData.submitterEmail].filter(Boolean).join('\n'),
        inline: true
      })
    }

    return this.sendWebhook(config.form_webhook_url, {
      username: 'Hypea Forms',
      embeds: [embed]
    })
  }

  async sendUserRegistration(userData: {
    username: string
    email: string
    provider: string
  }): Promise<boolean> {
    const config = await this.getWebhookConfig()
    
    if (!config.webhook_enabled || !config.webhook_url) {
      return false
    }

    const embed: DiscordEmbed = {
      title: '👋 New User Registration',
      color: 0x06b6d4,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: 'Username',
          value: userData.username,
          inline: true
        },
        {
          name: 'Email',
          value: userData.email,
          inline: true
        },
        {
          name: 'Provider',
          value: userData.provider,
          inline: true
        }
      ]
    }

    return this.sendWebhook(config.webhook_url, {
      username: 'Hypea Platform',
      embeds: [embed]
    })
  }

  // Get Discord server widget data
  async getServerWidget(serverId?: string): Promise<any> {
    try {
      const config = await prisma.siteConfig.findUnique({
        where: { key: 'discord_server_id' }
      })

      const serverIdToUse = serverId || config?.value || process.env.DISCORD_SERVER_ID

      if (!serverIdToUse) {
        return null
      }

      const response = await fetch(`https://discord.com/api/guilds/${serverIdToUse}/widget.json`)
      
      if (!response.ok) {
        return null
      }

      return response.json()
    } catch (error) {
      console.error('Failed to fetch Discord widget:', error)
      return null
    }
  }

  // Test webhook connection
  async testWebhook(webhookUrl?: string): Promise<boolean> {
    const config = await this.getWebhookConfig()
    const urlToTest = webhookUrl || config.webhook_url

    if (!urlToTest) {
      return false
    }

    const testPayload: DiscordWebhookPayload = {
      content: '🧪 **Webhook Test**\nThis is a test message from Hypea Platform.',
      username: 'Hypea Test',
    }

    return this.sendWebhook(urlToTest, testPayload)
  }
}

export const discord = new DiscordService()
