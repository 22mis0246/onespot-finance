import express from "express";
import prisma from "./prisma.js";
import authenticateToken from "./jwt.js";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({ message: "All fields required" });
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        amount: Number(amount),
        category,
        date: new Date(),
        userId: req.user.id,
      },
    });

    res.json(expense);
  } catch (error) {
    console.error("CREATE EXPENSE ERROR:", error);
    res.status(500).json({ message: "Failed to create expense" });
  }
});

router.get("/", authenticateToken, async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(expenses);
  } catch (error) {
    console.error("FETCH EXPENSE ERROR:", error);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});
/* ================================
   DELETE EXPENSE
================================ */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.expense.delete({
      where: {
        id: Number(id),
        userId: req.user.id, // safety: delete only own expense
      },
    });

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("DELETE EXPENSE ERROR:", error);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});
/* ================================
   UPDATE EXPENSE
================================ */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category } = req.body;

    const updatedExpense = await prisma.expense.update({
      where: {
        id: Number(id),
        userId: req.user.id,
      },
      data: {
        title,
        amount: Number(amount),
        category,
      },
    });

    res.json(updatedExpense);
  } catch (error) {
    console.error("UPDATE EXPENSE ERROR:", error);
    res.status(500).json({ message: "Failed to update expense" });
  }
});

export default router;
