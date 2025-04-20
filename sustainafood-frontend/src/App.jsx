import React from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { AlertProvider } from "./contexts/AlertContext";
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
import ListDonationsRequest from './pages/ListDonationsRequest';
import PrivateRoute from "./PrivateRoute";
import NotFound from "./pages/Not-Found";
import AccountSettings from "./pages/AccountSettings.js";
import ListOfDonations from "./pages/ListOfDonations";
import AddDonation from "./pages/AddDonation";
import MyRequest from "./pages/MyRequest.jsx";
import MyDonations from "./pages/MyDonationsList.jsx";
import TwoFAVerification from "./pages/TwoFAVerification";
import DetailsDonations from "./pages/DetailsDonations";
import DonationList from "./pages/backoffice/DonationList.jsx";
import DonationTransactionList from "./pages/backoffice/DonationTransactionList.jsx";
import RequestTable from "./pages/backoffice/RequestTable.jsx";
import ProductList from "./pages/backoffice/ProductList.jsx";
import DetailsRequest from "./pages/DetailsRequest";
import ListOfRequests from "./pages/ListOfRequests";
import AlertDisplay from "./components/AlertDisplay";
// Composants supplémentaires (à créer si absents)
import RequestDetails from "./pages/backoffice/RequestDetails";
import ProductDetail from "./pages/backoffice/ProductDetail";
import DonationDetails from "./pages/backoffice/DonationDetails";
import AnomaliesDashbord from "./pages/backoffice/AnomaliesDashbord";
import DonationsRequestList from"./pages/backoffice/DonationsRequestList";
import RequestDonationsList from"./pages/backoffice/RequestDonationsList";
import PredictionsDashboard from './pages/backoffice/PredictionsDashboard';
import ListRequestsDonation from './pages/ListRequestsDonation';
import AiClassification from './pages/AiClassification';
import DonationRecommendations from './pages/DonationRecommendations';
import ViewDonationTransaction from "./pages/backoffice/ViewDonationTransaction.jsx";

import AnalyticsDashboard from './pages/AnalyticsDashboard';
import PersonalStatus from './pages/PersonalStatus';
const App = () => {
  return (
    <AlertProvider>
      <AlertDisplay />
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/Continueinfo" element={<Continueinfo />} />
        <Route path="/About" element={<About />} />
        <Route path="/forget-password" element={<ForgetPass />} />
        <Route path="/reset-code" element={<ResetCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/two-fa-verification" element={<TwoFAVerification />} />
        <Route path="/ListDonationsRequest/:id" element={<ListDonationsRequest />} />
      

        {/* Routes privées pour les admins */}
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
          <Route path="/Donations" element={<DonationList />} />
          <Route path="/DonationTransList" element={<DonationTransactionList />} />
          <Route path="/donation-transactions/view/:transactionId" element={<ViewDonationTransaction/>} />
          <Route path="/food-donation/requests" element={<RequestTable />} />
          <Route path="/food-donation/product" element={<ProductList />} />
          <Route path="/requests/view/:id" element={<RequestDetails />} />
          <Route path="/products/view/:id" element={<ProductDetail />} />
          <Route path="/donations/view/:id" element={<DonationDetails />} />
          <Route path="/DonationsRequestList/:id" element={<DonationsRequestList />} />
          <Route path="/RequestDonationsList/:id" element={<RequestDonationsList />} />
          <Route path="/PredictionsDashboard" element={<PredictionsDashboard />} />
          <Route path="/AnomaliesDashbord" element={<AnomaliesDashbord />} />


        </Route>

        {/* Routes privées pour ong, restaurant, supermarket, student, transporter */}
        <Route element={<PrivateRoute roles={["ong", "restaurant", "supermarket", "student", "transporter"]} />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/DonationRecommendations" element={<DonationRecommendations />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/PersonalStatus" element={<PersonalStatus />} />
        </Route>

        {/* Routes privées pour ong, restaurant, supermarket, student */}
        <Route element={<PrivateRoute roles={["ong", "restaurant", "supermarket", "student"]} />}>
          <Route path="/ListOfDonations" element={<ListOfDonations />} />
          <Route path="/ListOfRequests" element={<ListOfRequests />} />
          <Route path="/AddDonation" element={<AddDonation />} />
          <Route path="/DetailsDonations/:id" element={<DetailsDonations />} />
          <Route path="/DetailsRequest/:id" element={<DetailsRequest />} />
        </Route>

        {/* Routes privées pour ong, student */}
        <Route element={<PrivateRoute roles={["ong", "student"]} />}>
          <Route path="/myrequest" element={<MyRequest />} />
          <Route path="/ListDonationsRequest/:id" element={<ListDonationsRequest />} />
        </Route>

        {/* Routes privées pour supermarket, restaurant */}
        <Route element={<PrivateRoute roles={["supermarket", "restaurant"]} />}>
          <Route path="/mydonations" element={<MyDonations />} />
          <Route path="/ListRequestsDonation/:donationId" element={<ListRequestsDonation />} />
          <Route path="/AiClassification" element={<AiClassification />} />

        </Route>

        {/* Route pour les pages non trouvées */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AlertProvider>
  );
};

export default App;