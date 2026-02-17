import express from "express";
import prisma from "./prisma.js";
import authenticateToken from "./jwt.js";

const router = express.Router();

/* ================================
   CREATE LIABILITY
================================ */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      type,
      totalAmount,
      outstanding,
      interestRate,
      dueDate,
    } = req.body;

    if (!title || !type || !totalAmount || !outstanding || !interestRate) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    const liability = await prisma.liability.create({
      data: {
        title,
        type,
        totalAmount: Number(totalAmount),
        outstanding: Number(outstanding),
        interestRate: Number(interestRate),
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.user.id,
      },
    });

    res.json(liability);
  } catch (error) {
    console.error("CREATE LIABILITY ERROR:", error);
    res.status(500).json({ message: "Failed to create liability" });
  }
});
/* ================================
   GET USER LIABILITIES
================================ */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const liabilities = await prisma.liability.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(liabilities);
  } catch (error) {
    console.error("FETCH LIABILITY ERROR:", error);
    res.status(500).json({ message: "Failed to fetch liabilities" });
  }
});
/* ================================
   DELETE LIABILITY
================================ */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.liability.delete({
      where: { id },
    });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE LIABILITY ERROR:", error);
    res.status(500).json({ message: "Delete failed" });
  }
});


export default router;
