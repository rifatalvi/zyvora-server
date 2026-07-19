import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// We need a raw MongoClient for better-auth, even though we use Mongoose for other things.
const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client, // Providing the client enables database transactions (optional but recommended)
  }),
  emailAndPassword: {
    enabled: true,
  },
  // Allow the frontend origin to make auth requests (fixes 403 CSRF error)
  trustedOrigins: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:5000',
    // Production URLs — update these to match your actual Vercel deployment URLs
    ...(process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(',').map(s => s.trim()) : []),
  ],
  // We need to define custom fields for the user table to store our specific fields
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
  // Optional: Add session caching or other plugins if needed
});

