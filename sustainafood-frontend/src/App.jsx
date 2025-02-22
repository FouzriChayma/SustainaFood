import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home'; // Your home page
import EditProfile from './pages/Editprofile'; // Your edit profile page
import Profile from './pages/Profile'; // Your profile page
import Signup from './pages/Signup'; // Your signup page
import Contact from './pages/Contact'
import Login from './pages/log'; // Your login page

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


      </Routes>
    </Router>
  );
};

export default App;
