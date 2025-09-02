import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  template?: string
  variables?: Record<string, any>
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

class Mailer {
  private transporter: nodemailer.Transporter | null = null
  private initialized = false

  private async initialize() {
    if (this.initialized) return

    const config = await this.getEmailConfig()
    
    if (!config.smtp_host || !config.smtp_port || !config.smtp_user || !config.smtp_password) {
      console.warn('Email configuration incomplete. Email sending disabled.')
      return
    }

    this.transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: parseInt(config.smtp_port),
      secure: config.smtp_secure === 'true',
      auth: {
        user: config.smtp_user,
        pass: config.smtp_password,
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    this.initialized = true
  }

  private async getEmailConfig() {
    const configs = await prisma.siteConfig.findMany({
      where: {
        key: {
          in: [
            'smtp_host',
            'smtp_port', 
            'smtp_secure',
            'smtp_user',
            'smtp_password',
            'smtp_from_name',
            'smtp_from_email'
          ]
        }
      }
    })

    const configMap: Record<string, string> = {}
    configs.forEach(config => {
      configMap[config.key] = config.value
    })

    return {
      smtp_host: configMap.smtp_host || process.env.SMTP_HOST || '',
      smtp_port: configMap.smtp_port || process.env.SMTP_PORT || '587',
      smtp_secure: configMap.smtp_secure || process.env.SMTP_SECURE || 'false',
      smtp_user: configMap.smtp_user || process.env.SMTP_USER || '',
      smtp_password: configMap.smtp_password || process.env.SMTP_PASSWORD || '',
      smtp_from_name: configMap.smtp_from_name || process.env.SMTP_FROM_NAME || 'Hypea Platform',
      smtp_from_email: configMap.smtp_from_email || process.env.SMTP_FROM_EMAIL || 'noreply@hypea.com'
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.initialize()

      if (!this.transporter) {
        console.error('Email transporter not initialized')
        return false
      }

      const config = await this.getEmailConfig()
      const fromAddress = `"${config.smtp_from_name}" <${config.smtp_from_email}>`

      let { html, text, subject } = options

      // If template is specified, load and process it
      if (options.template && options.variables) {
        const template = await this.getTemplate(options.template)
        if (template) {
          subject = this.processTemplate(template.subject, options.variables)
          html = this.processTemplate(template.html, options.variables)
          text = template.text ? this.processTemplate(template.text, options.variables) : undefined
        }
      }

      const mailOptions: nodemailer.SendMailOptions = {
        from: fromAddress,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject,
        html,
        text,
        attachments: options.attachments
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
      return true

    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  private async getTemplate(templateName: string): Promise<EmailTemplate | null> {
    // You can store email templates in database or files
    // For now, we'll use built-in templates
    const templates: Record<string, EmailTemplate> = {
      'email-verification': {
        subject: 'Verify your email address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">Verify Your Email</h1>
            <p>Hello {{name}},</p>
            <p>Please click the button below to verify your email address:</p>
            <a href="{{verificationUrl}}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Verify Email</a>
            <p>Or copy and paste this link in your browser:</p>
            <p><a href="{{verificationUrl}}">{{verificationUrl}}</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>The Hypea Team</p>
          </div>
        `,
        text: `
          Hello {{name}},
          
          Please verify your email address by visiting: {{verificationUrl}}
          
          This link will expire in 24 hours.
          
          If you didn't create an account, you can safely ignore this email.
          
          Best regards,
          The Hypea Team
        `
      },
      'password-reset': {
        subject: 'Reset your password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">Reset Your Password</h1>
            <p>Hello {{name}},</p>
            <p>You requested to reset your password. Click the button below to set a new password:</p>
            <a href="{{resetUrl}}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p><a href="{{resetUrl}}">{{resetUrl}}</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>The Hypea Team</p>
          </div>
        `,
        text: `
          Hello {{name}},
          
          You requested to reset your password. Visit this link to set a new password: {{resetUrl}}
          
          This link will expire in 1 hour.
          
          If you didn't request a password reset, you can safely ignore this email.
          
          Best regards,
          The Hypea Team
        `
      },
      'order-confirmation': {
        subject: 'Order Confirmation - #{{orderNumber}}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">Order Confirmation</h1>
            <p>Hello {{customerName}},</p>
            <p>Thank you for your order! Here are the details:</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order #{{orderNumber}}</h3>
              <p><strong>Date:</strong> {{orderDate}}</p>
              <p><strong>Total:</strong> ${{orderTotal}}</p>
            </div>
            
            <h3>Items:</h3>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
              {{orderItems}}
            </div>
            
            {{#if hasLicenses}}
            <h3>License Keys:</h3>
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Important:</strong> Please save your license keys in a safe place.</p>
              {{licenseKeys}}
            </div>
            {{/if}}
            
            <p>You can view your order details and download your licenses anytime in your account dashboard.</p>
            <a href="{{accountUrl}}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">View Account</a>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>The Hypea Team</p>
          </div>
        `,
        text: `
          Hello {{customerName}},
          
          Thank you for your order! Here are the details:
          
          Order #{{orderNumber}}
          Date: {{orderDate}}
          Total: ${{orderTotal}}
          
          Items:
          {{orderItemsText}}
          
          {{#if hasLicenses}}
          License Keys:
          {{licenseKeysText}}
          
          Please save your license keys in a safe place.
          {{/if}}
          
          You can view your order details anytime at: {{accountUrl}}
          
          Best regards,
          The Hypea Team
        `
      },
      'form-notification': {
        subject: 'New Form Submission - {{formTitle}}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">New Form Submission</h1>
            <p>A new form submission has been received.</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">{{formTitle}}</h3>
              <p><strong>Submitted:</strong> {{submissionDate}}</p>
              {{#if submitterName}}
              <p><strong>Submitted by:</strong> {{submitterName}}</p>
              {{/if}}
            </div>
            
            <h3>Form Data:</h3>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
              {{formData}}
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">This is an automated notification from your Hypea Platform.</p>
          </div>
        `,
        text: `
          New Form Submission
          
          Form: {{formTitle}}
          Submitted: {{submissionDate}}
          {{#if submitterName}}
          Submitted by: {{submitterName}}
          {{/if}}
          
          Form Data:
          {{formDataText}}
          
          This is an automated notification from your Hypea Platform.
        `
      }
    }

    return templates[templateName] || null
  }

  private processTemplate(template: string, variables: Record<string, any>): string {
    let result = template

    // Simple template processing - replace {{variable}} with values
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, String(value || ''))
    })

    // Handle conditional blocks {{#if variable}}...{{/if}}
    result = result.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, condition, content) => {
      return variables[condition] ? content : ''
    })

    return result
  }

  // Convenience methods for common email types
  async sendVerificationEmail(to: string, name: string, verificationUrl: string): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'email-verification',
      variables: {
        name,
        verificationUrl
      }
    })
  }

  async sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'password-reset',
      variables: {
        name,
        resetUrl
      }
    })
  }

  async sendOrderConfirmation(
    to: string,
    customerName: string,
    orderData: {
      orderNumber: string
      orderDate: string
      orderTotal: string
      orderItems: string
      orderItemsText: string
      hasLicenses: boolean
      licenseKeys?: string
      licenseKeysText?: string
      accountUrl: string
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'order-confirmation',
      variables: {
        customerName,
        ...orderData
      }
    })
  }

  async sendFormNotification(
    to: string | string[],
    formTitle: string,
    submissionData: {
      submissionDate: string
      submitterName?: string
      formData: string
      formDataText: string
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'form-notification',
      variables: {
        formTitle,
        ...submissionData
      }
    })
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    try {
      await this.initialize()
      
      if (!this.transporter) {
        return false
      }

      await this.transporter.verify()
      return true
    } catch (error) {
      console.error('Email connection test failed:', error)
      return false
    }
  }
}

export const mailer = new Mailer()
