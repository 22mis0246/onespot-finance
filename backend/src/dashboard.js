import express from "express";
import prisma from "./prisma.js";
import protect from "./jwt.js";

const router = express.Router();

/* ======================
   NET WORTH (existing)
====================== */
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


/* ======================
   DASHBOARD ANALYTICS
====================== */

router.get("/", protect, async (req, res) => {

  try {

    const userId = req.user.id;

    const investments = await prisma.investment.findMany({
      where: { userId }
    });

    const liabilities = await prisma.liability.findMany({
      where: { userId }
    });

    const goals = await prisma.goal.findMany({
      where: { userId }
    });


    let totalInvestments = 0;
    let equity = 0;
    let gold = 0;
    let debt = 0;
    let crypto = 0;

    let bestAsset = "N/A";
    let bestReturn = -Infinity;

    investments.forEach((inv) => {

      const value = (inv.quantity ?? 0) * (inv.currentPrice ?? 0);
      totalInvestments += value;

      if (inv.avgPrice && inv.currentPrice) {

        const profitPercent =
          ((inv.currentPrice - inv.avgPrice) / inv.avgPrice) * 100;

        if (profitPercent > bestReturn) {
          bestReturn = profitPercent;
          bestAsset = inv.name;
        }
      }

      if (inv.type === "equity") equity += value;
      else if (inv.type === "gold") gold += value;
      else if (inv.type === "debt") debt += value;
      else if (inv.type === "crypto") crypto += value;

    });


    const totalLiabilities = liabilities.reduce(
      (sum, l) => sum + l.amount,
      0
    );


    const netWorth = totalInvestments - totalLiabilities;


    let riskLevel = "Low";

    const equityPercent =
      totalInvestments > 0
        ? (equity / totalInvestments) * 100
        : 0;

    if (equityPercent > 70) riskLevel = "High";
    else if (equityPercent > 40) riskLevel = "Moderate";


    let healthScore = 0;

    const debtRatio =
      totalInvestments > 0
        ? totalLiabilities / totalInvestments
        : 0;

    if (debtRatio < 0.3) healthScore += 30;
    else if (debtRatio < 0.6) healthScore += 20;
    else healthScore += 10;


    let assetTypes = 0;
    if (equity > 0) assetTypes++;
    if (gold > 0) assetTypes++;
    if (debt > 0) assetTypes++;
    if (crypto > 0) assetTypes++;

    healthScore += assetTypes * 10;


    const goalProgress = goals.reduce((sum, g) => {

      if (!g.targetAmount) return sum;

      return sum + g.savedAmount / g.targetAmount;

    }, 0);

    if (goals.length > 0) {
      healthScore += (goalProgress / goals.length) * 30;
    }


    res.json({
      netWorth,
      riskLevel,
      bestAsset,
      healthScore: Math.round(healthScore),
      allocation: {
        equity,
        gold,
        debt,
        crypto
      }
    });

  } catch (error) {

    console.error("Dashboard error:", error);

    res.status(500).json({
      message: "Failed to load dashboard"
    });

  }

});

export default router;