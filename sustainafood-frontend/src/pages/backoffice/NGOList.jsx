import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/ngoList.css";

const ngoData = [
  {
    id: 1,
    name: "Green Future",
    email: "contact@greenfuture.org",
    password: "••••••••", // Crypté
    role: "User",
    phone: "+1 (345) 678 9012",
    photo: "https://via.placeholder.com/40",
    type: "Charitable",
    fiscalId: "NGO12345",
  },
  {
    id: 2,
    name: "Food for All",
    email: "support@foodforall.org",
    password: "••••••••",
    role: "User",
    phone: "+1 (234) 567 8901",
    photo: "https://via.placeholder.com/40",
    type: "Human-Rights",
    fiscalId: "NGO67890",
  },
];

const NGOList = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />

        <div className="ngo-list">
          <h3>NGO Management</h3>
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
                <th>Type</th>
                <th>Fiscal ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ngoData.map((ngo) => (
                <tr key={ngo.id}>
                  <td>{ngo.id}</td>
                  <td><img src={ngo.photo} alt="NGO" className="ngo-photo" /></td>
                  <td>{ngo.name}</td>
                  <td>{ngo.email}</td>
                  <td>{ngo.password}</td>
                  <td>{ngo.role}</td>
                  <td>{ngo.phone}</td>
                  <td>{ngo.type}</td>
                  <td>{ngo.fiscalId}</td>
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

export default NGOList;
