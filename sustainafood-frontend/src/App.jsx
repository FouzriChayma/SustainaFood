import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home'; // Your home page
import EditProfile from './pages/Editprofile'; // Your edit profile page
import Profile from './pages/Profile'; // Your profile page
import Signup from './pages/Signup'; // Your signup page
import Contact from './pages/Contact'


import Login from './pages/log'; // Your login page
import Dashboard from "./pages/backoffice/Dashboard";
import NGOList from "./pages/backoffice/NGOList";
import SupermarketList from "./pages/backoffice/SupermarketList";
import StudentList from "./pages/backoffice/StudentList";
import TransporterList from "./pages/backoffice/TransporterList";
import About from "./pages/About";
const App = () => {
  return (

    <Router>
      <Routes>
      <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
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
    </Router>
  );
};

export default App;
