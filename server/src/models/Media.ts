import mongoose, { Document, Schema } from "mongoose";

export interface IMedia extends Document {
  filename: string;
  originalName: string;
  url: string;
  type: "image" | "video";
  uploadedBy: mongoose.Types.ObjectId;
  website?: mongoose.Types.ObjectId;
}

const mediaSchema = new Schema<IMedia>(
  {
    filename: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Website",
      index: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

  },
  {
    timestamps: true,
  }
);

const Media = mongoose.model<IMedia>("Media", mediaSchema);

export default Media;