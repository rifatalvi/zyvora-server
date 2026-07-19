import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface IBooking extends Document {
  userId: string;
  itemId: mongoose.Types.ObjectId;
  amount: number;
  stripeSessionId?: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    stripeSessionId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    collection: 'booking',
  }
);

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
