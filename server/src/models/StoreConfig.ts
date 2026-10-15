import mongoose, { Document, Schema } from "mongoose";

export interface IStoreSection {
  id: string;
  type: string;
  title: string;
  settings: Record<string, any>;
}

export interface IStoreTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  buttonStyle: "square" | "rounded" | "pill";
  contentWidth: "compact" | "normal" | "full";
  sectionSpacing: "compact" | "normal" | "spacious";
}

export interface IStoreConfig extends Document {
  owner: mongoose.Types.ObjectId;
  storeName: string;
  name?: string;
  slug: string;
  status: "draft" | "published";
  sections: IStoreSection[];
  theme: IStoreTheme;
  publishedVersion?: {
    storeName: string;
    sections: IStoreSection[];
    theme: IStoreTheme;
    publishedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const sectionSchema = new Schema<IStoreSection>(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const themeSchema = new Schema<IStoreTheme>(
  {
    primaryColor: { type: String, default: "#202223" },
    secondaryColor: { type: String, default: "#4f46e5" },
    backgroundColor: { type: String, default: "#ffffff" },
    fontFamily: { type: String, default: "Inter, sans-serif" },
    buttonStyle: {
      type: String,
      enum: ["square", "rounded", "pill"],
      default: "rounded",
    },
    contentWidth: {
      type: String,
      enum: ["compact", "normal", "full"],
      default: "normal",
    },
    sectionSpacing: {
      type: String,
      enum: ["compact", "normal", "spacious"],
      default: "normal",
    },
  },
  { _id: false }
);

const storeConfigSchema = new Schema<IStoreConfig>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    storeName: {
      type: String,
      required: true,
      default: "My Store",
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    sections: {
      type: [sectionSchema],
      default: [],
    },
    theme: {
      type: themeSchema,
      default: () => ({}),
    },
    publishedVersion: {
      storeName: { type: String },
      sections: { type: [sectionSchema] },
      theme: { type: themeSchema },
      publishedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

storeConfigSchema.pre("validate", function () {
  if (this.name && !this.storeName) {
    this.storeName = this.name;
  }
  if (this.storeName && !this.name) {
    this.name = this.storeName;
  }
  if (!this.slug && (this.storeName || this.name)) {
    const raw = this.storeName || this.name || "store";
    this.slug = raw
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
});

const StoreConfig = mongoose.model<IStoreConfig>("StoreConfig", storeConfigSchema);

export default StoreConfig;
