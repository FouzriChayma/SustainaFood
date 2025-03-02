import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import EditProfile from './pages/Editprofile';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import Continueinfo from './pages/Continueinfo';
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

import PrivateRoute from "./PrivateRoute";
import NotFound from "./pages/Not-Found";
import AccountSettings from "./pages/AccountSettings.js";
const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/Contact" element={<Contact />} />
      <Route path="/Continueinfo" element={<Continueinfo />} />
      <Route path="/About" element={<About />} />
      <Route path="/forget-password" element={<ForgetPass />} />
      <Route path="/reset-code" element={<ResetCode />} />  
      <Route path="/reset-password" element={<ResetPassword />} />
    

      {/* Private Routes for Admin only */}
      <Route element={<PrivateRoute roles={["admin"]} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/recipients/ngos" element={<NGOList />} />
        <Route path="/donors/supermarkets" element={<SupermarketList />} />
        <Route path="/donors/restaurants" element={<RestaurantList />} />
        <Route path="/recipients/students" element={<StudentList />} />
        <Route path="/transporters" element={<TransporterList />} />
        <Route path="/students/view/:id" element={<ViewStudent />} />
        <Route path="/restaurants/view/:id" element={<ViewRestaurant />} />
        <Route path="/supermarkets/view/:id" element={<ViewSupermarket />} />
        <Route path="/ongs/view/:id" element={<ViewNGO />} />
        <Route path="/transporters/view/:id" element={<ViewTransporter />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
      </Route>

      {/* Private Routes for other roles (if needed) */}
      <Route element={<PrivateRoute roles={["ong", "restaurant", "supermarket", "student", "transporter"]} />}>
        {/* Place here any additional routes only accessible for these roles */}

        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path= "/account-settings" element={<AccountSettings />} />
      </Route>

       {/* NotFound Route - This should be the last route */}
       <Route path="*" element={<NotFound />} />



    </Routes>
  );
};

export default App;