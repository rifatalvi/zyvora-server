/**
 * Zyvora Database Seed Script
 * Run: npx tsx src/scripts/seed.ts
 *
 * This script:
 * 1. Creates a demo instructor user in the 'user' collection (Better Auth format)
 * 2. Inserts 10 sample Items into the 'item' collection
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { MongoClient, ObjectId } from 'mongodb';
import Item from '../models/Item';

const MONGODB_URI = process.env.MONGODB_URI as string;

const DEMO_USER_ID = new ObjectId('6698a1b2c3d4e5f6a7b8c9d0');
const DEMO_USER_NAME = 'Zyvora Demo';
const DEMO_USER_EMAIL = 'demo@zyvora.com';

const items = [
  {
    title: 'Complete TypeScript & React Development Bootcamp',
    shortDescription: 'Master TypeScript and React from scratch with real-world projects.',
    fullDescription: `This comprehensive bootcamp covers everything you need to become a proficient TypeScript and React developer. 
    Starting from the very basics of TypeScript's type system, you'll progressively build up your skills to create production-ready React applications.
    You'll build 5 full projects including a task manager, an e-commerce platform, and a social dashboard.`,
    category: 'Programming',
    type: 'course',
    difficulty: 'Intermediate',
    price: 59.99,
    thumbnail: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&auto=format&fit=crop',
    tags: ['typescript', 'react', 'frontend', 'javascript'],
    duration: '42 hours',
    language: 'English',
    totalEnrolled: 3241,
    averageRating: 4.8,
    totalReviews: 812,
  },
  {
    title: 'Modern UI/UX Design with Figma',
    shortDescription: 'Learn professional design principles and build stunning interfaces in Figma.',
    fullDescription: `Dive deep into the world of UI/UX design. This course will take you from understanding core design principles like typography, spacing, and color theory, 
    all the way to creating complex, interactive prototypes in Figma. You'll design 3 complete app interfaces for your portfolio.`,
    category: 'Design',
    type: 'course',
    difficulty: 'Beginner',
    price: 39.99,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop',
    tags: ['figma', 'ui', 'ux', 'design', 'prototype'],
    duration: '28 hours',
    language: 'English',
    totalEnrolled: 5102,
    averageRating: 4.9,
    totalReviews: 1423,
  },
  {
    title: 'Python for Data Science & Machine Learning',
    shortDescription: 'From data wrangling with Pandas to building ML models with Scikit-Learn.',
    fullDescription: `Master the data science pipeline from end to end using Python. 
    You'll learn to manipulate data with Pandas, visualize it with Matplotlib and Seaborn, and build predictive machine learning models with Scikit-Learn.
    The course culminates in a complete data science project using a real-world dataset.`,
    category: 'Data Science',
    type: 'course',
    difficulty: 'Intermediate',
    price: 74.99,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop',
    tags: ['python', 'machine learning', 'data science', 'pandas', 'scikit-learn'],
    duration: '56 hours',
    language: 'English',
    totalEnrolled: 8930,
    averageRating: 4.7,
    totalReviews: 2105,
  },
  {
    title: 'Full-Stack Node.js & MongoDB Mentorship',
    shortDescription: 'One-on-one mentorship to build scalable backend services with Node.js.',
    fullDescription: `Get personalized guidance from an experienced backend engineer. 
    Over 8 weeks, we'll work together to build a production-ready REST API using Node.js, Express, and MongoDB. 
    Sessions will be tailored to your current skill level and project goals. You'll leave with a fully deployed backend application on your portfolio.`,
    category: 'Programming',
    type: 'mentorship',
    difficulty: 'Intermediate',
    price: 299.00,
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&fit=crop',
    tags: ['nodejs', 'mongodb', 'express', 'backend', 'api'],
    duration: '8 weeks',
    language: 'English',
    totalEnrolled: 145,
    averageRating: 5.0,
    totalReviews: 89,
  },
  {
    title: 'Digital Marketing Mastery: From Zero to Pro',
    shortDescription: 'Master SEO, paid ads, social media, and content marketing strategies.',
    fullDescription: `This all-in-one digital marketing course will teach you every channel you need to grow a business online. 
    You'll learn Search Engine Optimization (SEO), Google Ads, Facebook & Instagram advertising, email marketing, and content strategy. 
    By the end, you'll be able to create and execute a complete digital marketing campaign.`,
    category: 'Marketing',
    type: 'course',
    difficulty: 'Beginner',
    price: 49.99,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
    tags: ['seo', 'marketing', 'ads', 'social media', 'content'],
    duration: '35 hours',
    language: 'English',
    totalEnrolled: 6780,
    averageRating: 4.6,
    totalReviews: 1890,
  },
  {
    title: 'The Complete AWS Cloud Practitioner Certification',
    shortDescription: 'Pass the AWS CLF-C02 exam and start your cloud career.',
    fullDescription: `Prepare comprehensively for the AWS Certified Cloud Practitioner exam. 
    This course covers all domains of the exam: Cloud Concepts, Security & Compliance, Technology, and Billing & Pricing. 
    Includes 5 full practice exams with detailed explanations for every question.`,
    category: 'Programming',
    type: 'course',
    difficulty: 'Beginner',
    price: 29.99,
    thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop',
    tags: ['aws', 'cloud', 'devops', 'certification'],
    duration: '20 hours',
    language: 'English',
    totalEnrolled: 12043,
    averageRating: 4.8,
    totalReviews: 3201,
  },
  {
    title: 'Startup Business Strategy Mentorship',
    shortDescription: '1-on-1 sessions with a serial entrepreneur to validate and grow your startup.',
    fullDescription: `Work directly with a founder who has built and sold two tech startups. 
    Over 6 weeks, we'll cover idea validation, business model design, fundraising strategy, and growth hacking. 
    Sessions will be customized to the specific challenges your startup is facing.`,
    category: 'Business',
    type: 'mentorship',
    difficulty: 'Advanced',
    price: 499.00,
    thumbnail: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop',
    tags: ['startup', 'business', 'entrepreneurship', 'strategy'],
    duration: '6 weeks',
    language: 'English',
    totalEnrolled: 62,
    averageRating: 4.9,
    totalReviews: 41,
  },
  {
    title: 'Photography for Beginners: From Smartphone to DSLR',
    shortDescription: 'Learn composition, lighting, and editing to take stunning photos.',
    fullDescription: `Start your photography journey with this hands-on course. 
    You'll learn the fundamentals of composition (rule of thirds, leading lines), understand how to use light effectively, 
    and master basic photo editing in Lightroom. The course is designed for both smartphone and DSLR photographers.`,
    category: 'Photography',
    type: 'course',
    difficulty: 'Beginner',
    price: 24.99,
    thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop',
    tags: ['photography', 'lightroom', 'composition', 'editing'],
    duration: '15 hours',
    language: 'English',
    totalEnrolled: 4312,
    averageRating: 4.7,
    totalReviews: 987,
  },
  {
    title: 'Advanced React Patterns & Architecture',
    shortDescription: 'Level up with compound components, render props, custom hooks, and state machines.',
    fullDescription: `Take your React skills to the expert level. 
    This course dives deep into advanced patterns that the best React engineers use in production applications. 
    Topics include advanced custom hooks, compound component pattern, state machines with XState, and performance optimization with profiling tools.`,
    category: 'Programming',
    type: 'course',
    difficulty: 'Advanced',
    price: 69.99,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop',
    tags: ['react', 'javascript', 'advanced', 'patterns', 'hooks'],
    duration: '22 hours',
    language: 'English',
    totalEnrolled: 2156,
    averageRating: 4.9,
    totalReviews: 678,
  },
  {
    title: 'Spanish for Beginners: Conversational Spanish Fast',
    shortDescription: 'Speak basic conversational Spanish in just 30 days with immersive techniques.',
    fullDescription: `This course uses proven language acquisition techniques to get you speaking Spanish quickly. 
    Instead of rote memorization, you'll learn through context and conversation. 
    By day 30, you'll be able to have basic conversations about everyday topics like food, travel, and work.`,
    category: 'Language',
    type: 'course',
    difficulty: 'Beginner',
    price: 34.99,
    thumbnail: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop',
    tags: ['spanish', 'language', 'beginners', 'conversational'],
    duration: '30 days',
    language: 'English',
    totalEnrolled: 7834,
    averageRating: 4.6,
    totalReviews: 2341,
  },
];

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // 1. Connect Mongoose (for Item model)
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Mongoose connected');

    // 2. Connect raw MongoClient for Better Auth's `user` collection
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();

    // 3. Create demo user in Better Auth's `user` collection if not exists
    const usersCollection = db.collection('user');
    const existingUser = await usersCollection.findOne({ email: DEMO_USER_EMAIL });

    let instructorId: ObjectId;
    if (existingUser) {
      instructorId = existingUser._id as ObjectId;
      console.log(`👤 Demo user already exists: ${instructorId}`);
    } else {
      const result = await usersCollection.insertOne({
        _id: DEMO_USER_ID,
        name: DEMO_USER_NAME,
        email: DEMO_USER_EMAIL,
        emailVerified: true,
        role: 'provider',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      instructorId = result.insertedId as unknown as ObjectId;
      console.log(`✅ Created demo user: ${instructorId}`);
    }

    // 4. Clear existing items
    await Item.deleteMany({});
    console.log('🗑️  Cleared existing items');

    // 5. Insert new items
    const itemsWithInstructor = items.map(item => ({
      ...item,
      instructor: instructorId,
      instructorName: DEMO_USER_NAME,
      instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zyvora',
      isPublished: true,
      aiGenerated: false,
      images: [],
      reviews: [],
    }));

    await Item.insertMany(itemsWithInstructor);
    console.log(`✅ Inserted ${items.length} sample items`);

    await mongoose.disconnect();
    await client.close();
    console.log('🎉 Seed complete! Database is ready.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
