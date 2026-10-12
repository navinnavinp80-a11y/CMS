import mongoose, { Document, Schema } from "mongoose";

export interface IContent extends Document {
  title: string;
  slug: string;
  content: string;
  type: "post" | "page";
  status: "draft" | "published";
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  author: mongoose.Types.ObjectId;
}

const contentSchema = new Schema<IContent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["post", "page"],
      required: true,
      default: "post",
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    featuredImage: {
      type: String,
      default: "",
    },

    metaTitle: {
      type: String,
      default: "",
      trim: true,
    },

    metaDescription: {
      type: String,
      default: "",
      trim: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Content = mongoose.model<IContent>("Content", contentSchema);

export default Content;