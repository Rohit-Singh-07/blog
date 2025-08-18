import express from "express";
import type { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { sql } from "./utils/db.js";
import blogRoute from './routes/blogRoute.js'
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const app = express();
app.use(express.json());

app.use("/api/v1/", blogRoute)

const initDB = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS blogs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      image VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      comment VARCHAR(255) NOT NULL,
      userid VARCHAR(255) NOT NULL,
      username VARCHAR(255) NOT NULL,
      blogid INTEGER NOT NULL REFERENCES blogs(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS savedblogs (
      id SERIAL PRIMARY KEY,
      userid VARCHAR(255) NOT NULL,
      blogid INTEGER NOT NULL REFERENCES blogs(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  console.log("Database initialized");
};




// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong",
  });
});

const port = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await initDB();
    app.listen(port, () => {
      console.log(`Server is live on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize database", error);
    process.exit(1);
  }
};

startServer();
