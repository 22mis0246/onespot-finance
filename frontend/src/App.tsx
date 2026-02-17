import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Investments from "./pages/Investments.tsx";
import IndianEquity from "./pages/IndianEquity";
import GlobalEquity from "./pages/GlobalEquity";
import GoldSilver from "./pages/GoldSilver";
import Expenses from "./pages/Expenses";
import Liabilities from "./pages/Liabilities";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/investments/indian-equity" element={<IndianEquity />} />
        <Route path="/investments/global-equity" element={<GlobalEquity />} />
        <Route path="/investments/gold-silver" element={<GoldSilver />} />
         <Route path="/expenses" element={<Expenses />} /> 
         <Route path="/liabilities" element={<Liabilities />} />

        


      </Routes>
    </BrowserRouter>
  );
}

export default App;
