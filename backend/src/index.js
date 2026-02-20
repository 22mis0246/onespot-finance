// ================== IMPORTS ==================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./auth.js";
import YahooFinance from "yahoo-finance2";
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
const yahooFinance = new YahooFinance();

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
    // Convert to uppercase
    const userSymbol = req.params.symbol.toUpperCase();

    // Always NSE
    const yahooSymbol = `${userSymbol}.NS`;

    console.log("Fetching price for:", yahooSymbol);

    // Fetch live quote
    const quote = await yahooFinance.quote(yahooSymbol);

    // If invalid stock
    if (!quote || !quote.regularMarketPrice) {
      return res.status(404).json({
        error: "Invalid stock symbol",
      });
    }

    // Send clean response
    res.json({
      symbol: yahooSymbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
    });

  } catch (error) {
    console.error("Yahoo error:", error.message);
    res.status(500).jsovdn({
      error: "Error fetching stock price",
    });
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
app.use("/api/dashboard", dashboardRoutes);

// ================== START SERVER ==================
const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
