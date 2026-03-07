import express from "express";
import prisma from "./prisma.js";
import authenticateToken from "./jwt.js";

const router = express.Router();

/* =========================
   CREATE GOAL
========================= */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, type, targetAmount,savedAmount, targetDate } = req.body;

    if (!title || !type || !targetAmount) {
      return res.status(400).json({ message: "All fields required" });
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        type,
        targetAmount: Number(targetAmount),
        savedAmount: Number(savedAmount || 0),   // ✅ ADD THIS
        targetDate: targetDate ? new Date(targetDate) : null,
        userId: req.user.id,
      },
    });

    res.json(goal);
  } catch (error) {
    console.error("CREATE GOAL ERROR:", error);
    res.status(500).json({ message: "Failed to create goal" });
  }
});

/* =========================
   GET GOALS
========================= */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(goals);
  } catch (error) {
    console.error("FETCH GOAL ERROR:", error);
    res.status(500).json({ message: "Failed to fetch goals" });
  }
});

/* =========================
   UPDATE GOAL
========================= */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const updated = await prisma.goal.update({
      where: { id },
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    console.error("UPDATE GOAL ERROR:", error);
    res.status(500).json({ message: "Update failed" });
  }
});

/* =========================
   DELETE GOAL
========================= */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.goal.delete({
      where: { id },
    });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE GOAL ERROR:", error);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
