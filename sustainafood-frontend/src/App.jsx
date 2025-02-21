import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/backoffice/Dashboard";
import NGOList from "./pages/backoffice/NGOList";
import SupermarketList from "./pages/backoffice/SupermarketList";
import StudentList from "./pages/backoffice/StudentList";
import TransporterList from "./pages/backoffice/TransporterList";
import AboutUs from "./pages/AboutUs";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/recipients/ngos" element={<NGOList />} />
        <Route path="/donors/supermarkets" element={<SupermarketList />} />
        <Route path="/recipients/students" element={<StudentList />} />
        <Route path="/transporters" element={<TransporterList />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
