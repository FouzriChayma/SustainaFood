import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../assets/styles/supermarketList.css";

const supermarketData = [
  {
    id: 1,
    name: "Fresh Market",
    email: "contact@freshmarket.com",
    password: "••••••••", // Crypté
    role: "User",
    phone: "+1 (345) 678 9012",
    photo: "https://via.placeholder.com/40",
    taxR: "SM12345",
  },
  {
    id: 2,
    name: "Green Grocery",
    email: "info@greengrocery.com",
    password: "••••••••",
    role: "User",
    phone: "+1 (234) 567 8901",
    photo: "https://via.placeholder.com/40",
    taxR: "SM67890",
  },
];

const SupermarketList = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="content">
        <Navbar />

        <div className="supermarket-list">
          <h3>Supermarket Management</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Email</th>
                <th>Password</th>
                <th>Role</th>
                <th>Phone</th>
                <th>TaxR</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {supermarketData.map((supermarket) => (
                <tr key={supermarket.id}>
                  <td>{supermarket.id}</td>
                  <td><img src={supermarket.photo} alt="Supermarket" className="supermarket-photo" /></td>
                  <td>{supermarket.name}</td>
                  <td>{supermarket.email}</td>
                  <td>{supermarket.password}</td>
                  <td>{supermarket.role}</td>
                  <td>{supermarket.phone}</td>
                  <td>{supermarket.taxR}</td>
                  <td>
                    <button className="view-btn">👁</button>
                    <button className="edit-btn">✏</button>
                    <button className="delete-btn">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupermarketList;
