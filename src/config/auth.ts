import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db();

const isProd = process.env.VERCEL || process.env.NODE_ENV === 'production';

export const auth = betterAuth({
  // Tells Better Auth its own public URL — critical for cookie settings and CSRF in production
  baseURL: process.env.BETTER_AUTH_URL as string,

  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    process.env.CLIENT_URL as string,
    ...(process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(',').map(s => s.trim()) : []),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "learner"
      },
      avatar: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      }
    }
  },
  advanced: {
    // Cross-origin: frontend and backend are on different Vercel domains
    // so cookies must be SameSite=None + Secure to be sent by the browser
    defaultCookieAttributes: isProd
      ? { sameSite: 'none', secure: true, httpOnly: true, path: '/' }
      : { sameSite: 'lax', secure: false, httpOnly: true, path: '/' },
  },
});

