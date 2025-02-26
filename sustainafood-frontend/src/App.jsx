import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import EditProfile from './pages/Editprofile';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import Contact from './pages/Contact';
import Login from './pages/log';
import Dashboard from "./pages/backoffice/Dashboard";
import NGOList from "./pages/backoffice/ONGList.jsx";
import SupermarketList from "./pages/backoffice/SupermarketList";
import StudentList from "./pages/backoffice/StudentList";
import TransporterList from "./pages/backoffice/TransporterList";
import About from "./pages/About";
import RestaurantList from './pages/backoffice/RestaurantList';
import AdminProfile from './pages/backoffice/AdminProfile';
import ForgetPass from "./pages/ForgetPass";
import ResetCode from "./pages/ResetCode";
import ResetPassword from "./pages/ResetPassword";
import ViewStudent from './pages/backoffice/view-student';
import ViewRestaurant from './pages/backoffice/view-restaurant';
import ViewSupermarket from './pages/backoffice/view-supermarket';
import ViewNGO from './pages/backoffice/view-ngo.jsx';
import ViewTransporter from './pages/backoffice/view-transporter';
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
        <Route path="/donors/restaurants" element={<RestaurantList />} />
      <Route path="/recipients/students" element={<StudentList />} />
      <Route path="/transporters" element={<TransporterList />} />
      <Route path="/About" element={<About />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/students/view/:id" element={<ViewStudent />} />
        <Route path="/restaurants/view/:id" element={<ViewRestaurant />} />
        <Route path="/supermarkets/view/:id" element={<ViewSupermarket />} />
        <Route path="/ongs/view/:id" element={<ViewNGO />} />
        <Route path="/transporters/view/:id" element={<ViewTransporter />} />
        <Route path="/forget-password" element={<ForgetPass />} />
        <Route path="/reset-code" element={<ResetCode />} />  
        <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
};

export default App;
