import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { isUserPremiumActive } from "../services/entitlementService";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      res.status(400).json({
        message: "Name, email and password are required",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        message: "User already exists",
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (strictly default to editor role for public registration)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "editor",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan || "free",
        premiumExpiresAt: user.premiumExpiresAt || null,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const loginUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Email and password are required",
      });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    const isPremium = isUserPremiumActive(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: isPremium ? "premium" : "free",
        premiumExpiresAt: user.premiumExpiresAt || null,
        isPremium,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getMe = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        message: "Unauthorized: Missing authentication",
      });
      return;
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const isPremium = isUserPremiumActive(user);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: isPremium ? "premium" : "free",
        premiumExpiresAt: user.premiumExpiresAt || null,
        isPremium,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      message: "Server error fetching user profile",
    });
  }
};