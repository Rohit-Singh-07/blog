import type { Request, Response, NextFunction } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const TryCatch = (handler: AsyncHandler): AsyncHandler => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error); // Let centralized error handler deal with it
    }
  };
};

export default TryCatch;
