import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import DiscordProvider from "next-auth/providers/discord"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            profile: true
          }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        if (user.status === 'BANNED' || user.status === 'DISABLED') {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.displayName || user.profile?.username || user.email,
          image: user.profile?.avatar,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "discord") {
        try {
          const existingUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: user.email },
                { discordId: account.providerAccountId }
              ]
            },
            include: { profile: true }
          })

          if (existingUser) {
            // Update Discord ID if not set
            if (!existingUser.discordId) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { discordId: account.providerAccountId }
              })
            }

            // Update profile with Discord info
            await prisma.profile.upsert({
              where: { userId: existingUser.id },
              update: {
                avatar: user.image,
                displayName: user.name,
              },
              create: {
                userId: existingUser.id,
                avatar: user.image,
                displayName: user.name,
                username: (profile as any)?.username || user.name?.toLowerCase().replace(/\s+/g, '_')
              }
            })

            return existingUser.status !== 'BANNED' && existingUser.status !== 'DISABLED'
          } else {
            // Create new user for Discord login
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                discordId: account.providerAccountId,
                role: UserRole.MEMBER,
                status: 'ACTIVE',
                emailVerified: new Date(),
                profile: {
                  create: {
                    avatar: user.image,
                    displayName: user.name,
                    username: (profile as any)?.username || user.name?.toLowerCase().replace(/\s+/g, '_')
                  }
                }
              }
            })

            // Log user registration
            await prisma.auditLog.create({
              data: {
                userId: newUser.id,
                action: 'CREATE',
                resource: 'User',
                resourceId: newUser.id,
                newValues: JSON.stringify({
                  email: user.email,
                  discordId: account.providerAccountId,
                  role: UserRole.MEMBER
                })
              }
            })

            return true
          }
        } catch (error) {
          console.error("Discord sign-in error:", error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.status = user.status
        token.emailVerified = user.emailVerified
      }

      // Refresh user data from database
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          include: { profile: true }
        })

        if (dbUser) {
          token.role = dbUser.role
          token.status = dbUser.status
          token.emailVerified = dbUser.emailVerified
          token.name = dbUser.profile?.displayName || dbUser.profile?.username || dbUser.email
          token.picture = dbUser.profile?.avatar
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.status = token.status as string
        session.user.emailVerified = token.emailVerified as Date | null
      }

      return session
    }
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      if (account?.provider === "credentials") {
        // Log login
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            resource: 'User',
            resourceId: user.id,
            metadata: JSON.stringify({
              provider: 'credentials'
            })
          }
        })
      }
    },
    async signOut({ token }) {
      if (token?.sub) {
        // Log logout
        await prisma.auditLog.create({
          data: {
            userId: token.sub,
            action: 'LOGOUT',
            resource: 'User',
            resourceId: token.sub
          }
        })
      }
    }
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
