import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/transporterList.css";

const transporterData = [
  {
    id: 1,
    name: "John Transport",
    email: "john@transport.com",
    password: "••••••••", // Encrypted
    role: "Driver",
    phone: "+1 (345) 678 9012",
    photo: "https://via.placeholder.com/40",
    vehicleType: "Truck",
  },
  {
    id: 2,
    name: "Jane Logistics",
    email: "jane@logistics.com",
    password: "••••••••",
    role: "Dispatcher",
    phone: "+1 (234) 567 8901",
    photo: "https://via.placeholder.com/40",
    vehicleType: "Van",
  },
];

const TransporterList = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />

        <div className="transporter-list">
          <h3>Transporter Management</h3>
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
                <th>Vehicle Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transporterData.map((transporter) => (
                <tr key={transporter.id}>
                  <td>{transporter.id}</td>
                  <td><img src={transporter.photo} alt="Transporter" className="transporter-photo" /></td>
                  <td>{transporter.name}</td>
                  <td>{transporter.email}</td>
                  <td>{transporter.password}</td>
                  <td>{transporter.role}</td>
                  <td>{transporter.phone}</td>
                  <td>{transporter.vehicleType}</td>
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

export default TransporterList;
