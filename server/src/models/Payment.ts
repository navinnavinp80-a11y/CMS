import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  orderId?: string;
  razorpayOrderId?: string;
  paymentId?: string;
  razorpayPaymentId?: string;
  signature?: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed";
  plan: string;
  durationDays?: number;
  premiumExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      sparse: true,
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      sparse: true,
      trim: true,
      index: true,
    },
    paymentId: {
      type: String,
      sparse: true,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      trim: true,
    },
    signature: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
      index: true,
    },
    plan: {
      type: String,
      default: "premium",
      trim: true,
    },
    durationDays: {
      type: Number,
      default: undefined,
    },
    premiumExpiresAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.pre("validate", function () {
  if (this.razorpayOrderId && !this.orderId) {
    this.orderId = this.razorpayOrderId;
  }
  if (this.orderId && !this.razorpayOrderId) {
    this.razorpayOrderId = this.orderId;
  }
  if (this.razorpayPaymentId && !this.paymentId) {
    this.paymentId = this.razorpayPaymentId;
  }
  if (this.paymentId && !this.razorpayPaymentId) {
    this.razorpayPaymentId = this.paymentId;
  }
});

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
