
import mongoose, { Document, Schema } from "mongoose";

export interface IWebsite extends Document {
    name: string;
    slug: string;
    description?: string;
    owner: mongoose.Types.ObjectId;
    status: "draft" | "published";
    homePage?: mongoose.Types.ObjectId;
    templateId?: string;
    settings?: {
        favicon?: string;
        metaTitle?: string;
        metaDescription?: string;
    };
}

const websiteSchema = new Schema<IWebsite>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },

        homePage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Content",
            default: undefined,
        },

        templateId: {
            type: String,
            default: "minimal-clean",
            trim: true,
        },

        settings: {
            favicon: {
                type: String,
                default: "",
            },
            metaTitle: {
                type: String,
                default: "",
            },
            metaDescription: {
                type: String,
                default: "",
            },
        },
    },
    {
        timestamps: true,
    }
);

const Website = mongoose.model<IWebsite>(
    "Website",
    websiteSchema
);

export default Website;