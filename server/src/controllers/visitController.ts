import { Request, Response } from "express";
import Visit from "../models/Visit";

export const recordVisit = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { contentId } = req.body;

    const visit = await Visit.create({
      content: contentId || undefined,
      visitedAt: new Date(),
    });

    res.status(201).json({
      message: "Visit recorded successfully",
      visit,
    });
  } catch (error) {
    console.error("Record visit error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};