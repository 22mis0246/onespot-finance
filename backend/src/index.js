// ================== IMPORTS ==================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./auth.js";

import investmentRoutes from "./investment.js";
import expenseRoutes from "./expense.js";
import liabilityRoutes from "./liability.js";
import goalRoutes from "./goal.js";
import dashboardRoutes from "./dashboard.js";


// ================== CONFIG ==================
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ================== YAHOO INSTANCE (VERY IMPORTANT FOR v3) ==================


// ================== TEST ROUTE ==================
app.get("/", (req, res) => {
  res.send("OneSpot Finance API running 🚀");
});

// ================== STOCK PRICE ROUTE ==================
/*
  Example:
  http://localhost:4000/api/stock/ITC
  Automatically converts to ITC.NS
*/
app.get("/api/stock/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase() + ".NS";

    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
        }
      }
    );

    const data = await response.json();

    const result = data.chart.result;

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Stock not found" });
    }

    const price = result[0].meta.regularMarketPrice;

    res.json({
      symbol,
      price
    });

  } catch (err) {
    console.error("Yahoo error:", err);
    res.status(500).json({ error: "Failed to fetch stock price" });
  }
});
// ================== AUTH ROUTES ==================
app.use("/api/auth", authRoutes);
//Investment routes
app.use("/api/investments", investmentRoutes);
//Expense
app.use("/api/expenses", expenseRoutes);
//Liabilty
app.use("/api/liabilities", liabilityRoutes);
//goal
app.use("/api/goals", goalRoutes);
//dashboard
app.use("/api", dashboardRoutes);

// ================== START SERVER ==================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});