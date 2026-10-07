import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  role: "admin" | "editor";
}

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "No token provided",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "admin") {
    res.status(403).json({
      message: "Access denied. Admin only.",
    });
    return;
  }

  next();
};