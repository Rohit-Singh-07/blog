import mongoose, { Document, Schema, model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image: string;
  linkedin: string;
  github: string;
  bio: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    bio: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const User = model<IUser>("User", userSchema);
export default User;

