import jwt, { type JwtPayload } from "jsonwebtoken";
import TryCatch from "../utils/TryCatch.js";
import type { Request, Response, NextFunction } from "express";

interface IUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  linkedin: string;
  github: string;
  bio: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("You are not logged in");
      (error as any).status = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      const error = new Error("Token not found");
      (error as any).status = 401;
      throw error;
    }

    const decodedValue = jwt.verify(
      token,
      process.env.JWT_SEC as string
    ) as JwtPayload;

    if (!decodedValue || !decodedValue.user) {
      const error = new Error("Invalid token payload");
      (error as any).status = 401;
      throw error;
    }

    req.user = decodedValue.user;
    next();
  }
);
