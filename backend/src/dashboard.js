import express from "express";
import prisma from "./prisma.js";
import protect from "./jwt.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {

  try {

    const userId = req.user.id;

    /* =========================
       FETCH DATA
    ========================= */

    const investments = await prisma.investment.findMany({
      where: { userId }
    });

    const liabilities = await prisma.liability.findMany({
      where: { userId }
    });

    const goals = await prisma.goal.findMany({
      where: { userId }
    });


    /* =========================
       CALCULATE INVESTMENTS
    ========================= */

    let totalInvestments = 0;

    let equity = 0;
    let gold = 0;
    let debt = 0;
    let crypto = 0;

    let bestAsset = "";
    let bestReturn = -Infinity;

    investments.forEach((inv) => {

      const value = (inv.quantity ?? 0) * (inv.currentPrice ?? 0);
      totalInvestments += value;

      const profitPercent =
        ((inv.currentPrice - inv.avgPrice) / inv.avgPrice) * 100;

      if (profitPercent > bestReturn) {
        bestReturn = profitPercent;
        bestAsset = inv.name;
      }

      /* Allocation */
      if (inv.type === "equity") equity += value;
      else if (inv.type === "gold") gold += value;
      else if (inv.type === "debt") debt += value;
      else if (inv.type === "crypto") crypto += value;

    });


    /* =========================
       LIABILITIES
    ========================= */

    const totalLiabilities = liabilities.reduce(
      (sum, l) => sum + l.amount,
      0
    );


    /* =========================
       NET WORTH
    ========================= */

    const netWorth = totalInvestments - totalLiabilities;


    /* =========================
       RISK LEVEL
    ========================= */

    let riskLevel = "Low";

    const equityPercent =
      totalInvestments > 0
        ? (equity / totalInvestments) * 100
        : 0;

    if (equityPercent > 70) riskLevel = "High";
    else if (equityPercent > 40) riskLevel = "Moderate";


    /* =========================
       FINANCIAL HEALTH SCORE
    ========================= */

    let healthScore = 0;

    /* Debt ratio */
    const debtRatio =
      totalInvestments > 0
        ? totalLiabilities / totalInvestments
        : 0;

    if (debtRatio < 0.3) healthScore += 30;
    else if (debtRatio < 0.6) healthScore += 20;
    else healthScore += 10;

    /* Diversification */
    let assetTypes = 0;
    if (equity > 0) assetTypes++;
    if (gold > 0) assetTypes++;
    if (debt > 0) assetTypes++;
    if (crypto > 0) assetTypes++;

    healthScore += assetTypes * 10;

    /* Goal progress */

    const goalProgress = goals.reduce((sum, g) => {

      if (g.targetAmount === 0) return sum;

      return sum + g.savedAmount / g.targetAmount;

    }, 0);

    if (goals.length > 0) {
      healthScore += (goalProgress / goals.length) * 30;
    }


    /* =========================
       RESPONSE
    ========================= */

    res.json({

      netWorth,
      riskLevel,
      bestAsset: bestAsset || "N/A",
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