import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
    name: string;
    emoji: string;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true, unique: true },
        emoji: { type: String, required: true },
    },
    { timestamps: true }
);

export const Category: Model<ICategory> =
    mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
