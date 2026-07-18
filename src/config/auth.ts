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
