import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPrompt extends Document {
    title: string;
    description: string;
    category: string;
    type: "text" | "image" | "video";
    isMega: boolean;
    promptText: string;
    sampleOutput: string;
    emoji: string;
    trendingScore: number;
    popularScore: number;
    tags: string[];
}

const PromptSchema = new Schema<IPrompt>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, required: true },
        type: { type: String, enum: ["text", "image", "video"], default: "text" },
        isMega: { type: Boolean, default: false },
        promptText: { type: String, required: true },
        sampleOutput: { type: String, required: true },
        emoji: { type: String, default: "✨" },
        trendingScore: { type: Number, default: 0 },
        popularScore: { type: Number, default: 0 },
        tags: [{ type: String }],
    },
    { timestamps: true }
);

export const Prompt: Model<IPrompt> =
    mongoose.models.Prompt || mongoose.model<IPrompt>("Prompt", PromptSchema);
