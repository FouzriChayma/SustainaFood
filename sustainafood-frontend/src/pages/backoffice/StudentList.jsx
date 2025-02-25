import Sidebar from "../../components/backoffcom/Sidebar";
import Navbar from "../../components/backoffcom/Navbar";
import "/src/assets/styles/backoffcss/studentList.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";


const studentData = [
  {
    id: 1,
    name: "John Doe",
    email: "johndoe@student.com",
    password: "••••••••", // Encrypted
    role: "User",
    phone: "+1 (345) 678 9012",
    photo: "https://via.placeholder.com/50",
    num_cin: "12345678",
    age: 22,
    sexe: "Male",
    student_card: "https://via.placeholder.com/70",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "janesmith@student.com",
    password: "••••••••",
    role: "User",
    phone: "+1 (234) 567 8901",
    photo: "https://via.placeholder.com/50",
    num_cin: "87654321",
    age: 20,
    sexe: "Male",
    student_card: "https://via.placeholder.com/70",
  },
];

const StudentList = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />

        <div className="student-list">
          <h3>Student Management</h3>
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
                <th>CIN</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentData.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td><img src="\src\assets\User_icon_2.svg.png" alt="Student" className="student-photo" /></td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.password}</td>
                  <td>{student.role}</td>
                  <td>{student.phone}</td>
                  <td>{student.num_cin}</td>
                  <td>{student.age}</td>
                  <td>{student.sexe}</td>
                  <td className="action-buttons">
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

export default StudentList;
