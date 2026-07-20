import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// Validate required env vars early so missing values give clear errors in Vercel logs
if (!process.env.MONGODB_URI) {
  throw new Error('[auth.ts] MONGODB_URI is not set. Add it in Vercel → Settings → Environment Variables.');
}
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('[auth.ts] BETTER_AUTH_SECRET is not set. Add it in Vercel → Settings → Environment Variables.');
}

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('zyvora');

const isProd = !!(process.env.VERCEL || process.env.NODE_ENV === 'production');

// BETTER_AUTH_URL must be the public URL of THIS server (e.g. https://zyvora-server-xxx.vercel.app)
// Without it Better Auth derives the URL from the request, which may work but cookies/redirects can break.
const serverBaseURL = process.env.BETTER_AUTH_URL || (isProd ? undefined : 'http://localhost:5000');

const allowedOrigins = [
  isProd ? undefined : 'http://localhost:3000', // always allow local dev
  process.env.CLIENT_URL,
  ...(process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(',').map(s => s.trim()) : []),
].filter(Boolean) as string[];

export const auth = betterAuth({
  ...(serverBaseURL ? { baseURL: serverBaseURL } : {}),

  secret: process.env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(db, { client }),

  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  trustedOrigins: allowedOrigins,

  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'learner',
      },
      avatar: {
        type: 'string',
        required: false,
      },
      bio: {
        type: 'string',
        required: false,
      },
    },
  },

  advanced: {
    // Frontend and backend are on different Vercel domains → cross-origin cookies
    // SameSite=None + Secure is required for the browser to send cookies cross-origin
    defaultCookieAttributes: isProd
      ? { sameSite: 'none', secure: true, httpOnly: true, path: '/' }
      : { sameSite: 'lax', secure: false, httpOnly: true, path: '/' },
  },
});
