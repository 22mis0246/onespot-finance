import express from "express";
import prisma from "./prisma.js";
import  protect  from "./jwt.js";

const router = express.Router();

router.get("/networth", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    

    const investments = await prisma.investment.findMany({
      where: { userId },
    });

    let totalNetWorth = 0;

    investments.forEach((inv) => {
      const qty = inv.quantity ?? 0;
      const price = inv.currentPrice ?? 0;
      totalNetWorth += qty * price;
    });

    res.json({ netWorth: totalNetWorth });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to calculate net worth" });
  }
});

export default router;