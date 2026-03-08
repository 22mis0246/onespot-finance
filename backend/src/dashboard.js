import express from "express";
import prisma from "./prisma.js";
import protect from "./jwt.js";

const router = express.Router();

router.get("/dashboard", protect, async (req, res) => {
  try {

    const userId = req.user.id;

    const investments = await prisma.investment.findMany({
      where: { userId },
    });

    let netWorth = 0;

    let equity = 0;
    let gold = 0;
    let debt = 0;
    let crypto = 0;

    investments.forEach((inv) => {

      const value = (inv.quantity ?? 0) * (inv.currentPrice ?? 0);
      netWorth += value;

      if (inv.type === "equity") equity += value;
      if (inv.type === "gold") gold += value;
      if (inv.type === "debt") debt += value;
      if (inv.type === "crypto") crypto += value;

    });

    const allocation = {
      equity,
      gold,
      debt,
      crypto
    };

    const bestAsset =
      Object.entries(allocation).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

    const riskLevel =
      equity > netWorth * 0.6 ? "High" :
      equity > netWorth * 0.3 ? "Moderate" :
      "Low";

    const healthScore = Math.min(100, Math.round((netWorth / 100000) * 50 + 50));

    res.json({
      netWorth,
      riskLevel,
      bestAsset,
      healthScore,
      allocation
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Dashboard failed" });

  }
});

export default router;