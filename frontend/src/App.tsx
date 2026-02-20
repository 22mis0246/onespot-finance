import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Investments from "./pages/Investments.tsx";
import IndianEquity from "./pages/IndianEquity";
import GlobalEquity from "./pages/GlobalEquity";
import GoldSilver from "./pages/GoldSilver";
import Expenses from "./pages/Expenses";
import Liabilities from "./pages/Liabilities";
import Goals from "./pages/Goals";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/investments/indian-equity" element={<IndianEquity />} />
        <Route path="/investments/global-equity" element={<GlobalEquity />} />
        <Route path="/investments/gold-silver" element={<GoldSilver />} />
         <Route path="/expenses" element={<Expenses />} /> 
         <Route path="/liabilities" element={<Liabilities />} />
         <Route path="/goals" element={<Goals />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
