import express from "express";
import bcrypt from "bcrypt";
import prisma from "./prisma.js";
import { generateToken } from "./jwt.js";

const router = express.Router();

/* =========================================
   REGISTER
========================================= */
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

/* =========================================
   LOGIN
========================================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

export default router;
