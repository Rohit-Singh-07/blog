import express from "express";
import type { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import userRoute from "./routes/userRoute.js";
import connectDb from "./utils/db.js";
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const app = express();

app.use(express.json());

app.use("/api/users", userRoute);

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Something went wrong",
  });
});

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`Server is live on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to database", error);
    process.exit(1);
  }
};

startServer();
