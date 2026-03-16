import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    email: string;
    password?: string;
    name?: string;
    image?: string;
    emailVerified?: Date;
    plan: "Free" | "Pro";
    trialUses: number;
}

const UserSchema = new Schema<IUser>(
    {
    email: { type: String, required: true, unique: true },
        password: { type: String },
        name: { type: String },
        image: { type: String },
        emailVerified: { type: Date },
        plan: { type: String, enum: ["Free", "Pro"], default: "Free" },
        trialUses: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
