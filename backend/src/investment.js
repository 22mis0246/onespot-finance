import express from "express";
import prisma from "./prisma.js";
import authenticateToken from "./jwt.js";

const router = express.Router();

/*
=========================================
CREATE INVESTMENT
=========================================
*/
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, avgPrice, quantity, currentPrice, type } = req.body;

    // Validation
    if (!name || !avgPrice || !quantity || !currentPrice) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // Calculate invested automatically
    const invested = Number(avgPrice) * Number(quantity);

    const investment = await prisma.investment.create({
      data: {
        name: name.toUpperCase(),
        type: type || "stocks", // default type
        avgPrice: Number(avgPrice),
        quantity: Number(quantity),
        invested,
        currentPrice: Number(currentPrice),
        userId: req.user.id,
      },
    });

    res.status(201).json(investment);

  } catch (error) {
    console.error("CREATE INVESTMENT ERROR:", error);
    res.status(500).json({
      error: "Failed to create investment",
    });
  }
});

/*
=========================================
GET USER INVESTMENTS
=========================================
*/
router.get("/", authenticateToken, async (req, res) => {
  try {
    const investments = await prisma.investment.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(investments);

  } catch (error) {
    console.error("FETCH INVESTMENTS ERROR:", error);
    res.status(500).json({
      error: "Failed to fetch investments",
    });
  }
});

/*
=========================================
DELETE INVESTMENT
=========================================
*/
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.investment.delete({
      where: {
        id,
        userId: req.user.id, // important security
      },
    });

    res.json({
      message: "Deleted successfully",
    });

  } catch (error) {
    console.error("DELETE INVESTMENT ERROR:", error);
    res.status(500).json({
      error: "Delete failed",
    });
  }
});

/*
=========================================
UPDATE INVESTMENT
=========================================
*/
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { avgPrice, quantity, currentPrice } = req.body;

    const invested = Number(avgPrice) * Number(quantity);

    const updated = await prisma.investment.update({
      where: {
        id,
        userId: req.user.id,
      },
      data: {
        avgPrice: Number(avgPrice),
        quantity: Number(quantity),
        currentPrice: Number(currentPrice),
        invested,
      },
    });

    res.json(updated);

  } catch (error) {
    console.error("UPDATE INVESTMENT ERROR:", error);
    res.status(500).json({
      error: "Update failed",
    });
  }
});

export default router;
