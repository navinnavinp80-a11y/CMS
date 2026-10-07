import mongoose, { Document, Schema } from "mongoose";

export interface IVisit extends Document {
  content?: mongoose.Types.ObjectId;
  visitedAt: Date;
}

const visitSchema = new Schema<IVisit>(
  {
    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
    },

    visitedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Visit = mongoose.model<IVisit>("Visit", visitSchema);

export default Visit;