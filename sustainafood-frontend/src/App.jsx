import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import EditProfile from './pages/Editprofile';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import Contact from './pages/Contact';
import Login from './pages/log';
import Dashboard from "./pages/backoffice/Dashboard";
import NGOList from "./pages/backoffice/NGOList";
import SupermarketList from "./pages/backoffice/SupermarketList";
import StudentList from "./pages/backoffice/StudentList";
import TransporterList from "./pages/backoffice/TransporterList";
import About from "./pages/About";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/Contact" element={<Contact />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/recipients/ngos" element={<NGOList />} />
      <Route path="/donors/supermarkets" element={<SupermarketList />} />
      <Route path="/recipients/students" element={<StudentList />} />
      <Route path="/transporters" element={<TransporterList />} />
      <Route path="/About" element={<About />} />
    </Routes>
  );
};

export default App;
