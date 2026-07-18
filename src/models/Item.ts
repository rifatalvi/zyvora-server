import mongoose, { Document, Schema } from 'mongoose';

export type ItemCategory =
  | 'Programming'
  | 'Design'
  | 'Data Science'
  | 'Business'
  | 'Marketing'
  | 'Photography'
  | 'Music'
  | 'Personal Development'
  | 'Language'
  | 'Health & Fitness';

export type ItemType = 'course' | 'mentorship';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface IReview {
  user: mongoose.Types.ObjectId;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IItem extends Document {
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: ItemCategory;
  type: ItemType;
  difficulty: DifficultyLevel;
  price: number;
  thumbnail: string;
  images: string[];
  tags: string[];
  instructor: mongoose.Types.ObjectId;
  instructorName: string;
  instructorAvatar?: string;
  duration: string;
  language: string;
  totalEnrolled: number;
  reviews: IReview[];
  averageRating: number;
  totalReviews: number;
  isPublished: boolean;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userAvatar: { type: String, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
});

const ItemSchema = new Schema<IItem>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: [250, 'Short description cannot exceed 250 characters'],
    },
    fullDescription: {
      type: String,
      required: [true, 'Full description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Programming',
        'Design',
        'Data Science',
        'Business',
        'Marketing',
        'Photography',
        'Music',
        'Personal Development',
        'Language',
        'Health & Fitness',
      ],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: ['course', 'mentorship'],
      default: 'course',
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail image URL is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    instructorName: {
      type: String,
      required: true,
    },
    instructorAvatar: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: 'Self-paced',
    },
    language: {
      type: String,
      default: 'English',
    },
    totalEnrolled: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: [ReviewSchema],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes for fast queries ───────────────────────────────────
ItemSchema.index({ title: 'text', shortDescription: 'text', tags: 'text' });
ItemSchema.index({ category: 1, price: 1, averageRating: -1 });
ItemSchema.index({ instructor: 1 });

const Item = mongoose.model<IItem>('Item', ItemSchema);

export default Item;
