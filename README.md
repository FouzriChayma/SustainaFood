<p align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHkwMjF5Zm9naDU2MWl5dXRwMzhzNDdoejBhbmJoYXowZTJyejllcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/a7kYlAGwDBffXZKosw/giphy.gif" alt="Java Animation" style="width:100%;">
</p>
---
# 🌍 SustainaFood: Revolutionizing Food Redistribution

📧 Contact: sustainafood.team@gmail.com  
🌐 [GitHub Repository](https://github.com/FouzriChayma/SustainaFood)

---

## 🥖 A Feast of Waste in a Hungry World

Shelves groaning with unsold bread. Crates of bruised apples.  
Across the street, a student digs through their bag for the last crumpled ramen packet.  
Society produces more than enough food, yet millions go hungry. It’s not a supply issue — it’s a distribution failure.

**SustainaFood** bridges that gap.

Developed as a 4th-year integrated project at **Esprit School of Engineering**, SustainaFood connects:
- 🍽️ **Food donors** (restaurants, supermarkets, individuals)
- 🙋‍♀️ **Recipients** (NGOs, students)
- 🚚 **Transporters**

Our mission is simple: **turn surplus into sustenance**.

---

## 🎯 Project Vision

- ♻️ **Redistribute Surplus** — Link donors to recipients in real-time.
- 🛻 **Optimize Deliveries** — Assign and track transporters.
- 🤖 **Leverage AI** — Detect anomalies, predict needs, classify donations.
- 💪 **Empower Communities** — Create a sustainable food ecosystem.

---

## 🚀 Features

- ✅ Donation Management: Create, update, track donations.
- 📦 Request System: NGOs/students request food items.
- 🤖 AI-Powered Insights:
  - Detect anomalies in donation data
  - Predict food supply/demand
  - Classify food types
- 🚚 Delivery Coordination: Assign and track transporters
- 🔐 User Roles: Admin, Donor, Recipient, Transporter (RBAC)
- 📊 Dashboards: Contribution insights for donors/recipients
- 🔔 Real-Time Notifications
- ⭐ Feedback System: Rate & review deliveries
- 🔐 Google Authentication + Optional 2FA
- 🛠️ Backoffice for Admins

---

## 🛠️ Tech Stack

### Backend

- **Node.js** & **Express** – RESTful API
- **MongoDB** & **Mongoose** – NoSQL database
- **Passport.js** – Google OAuth
- **JWT** – Token-based auth
- **Nodemailer** – Email notifications
- **Multer** – File uploads

### Frontend

- **React** & **React Router**
- **Axios** – API communication
- **Context API** – Global state
- **Tailwind CSS** – Responsive UI

### AI

- **Python** & **Flask** – AI API
- **scikit-learn**, **Pandas** – ML tools
- **venv** – Python dependency management

### DevOps

- **Jenkins** – CI/CD pipeline
- **dotenv** – Config management
- **node-cron** – Scheduled ML updates

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- Python (v3.8+)
- Git
- pip

---

### 🔧 Installation

# 1. Clone the repo
git clone https://github.com/FouzriChayma/SustainaFood.git
cd sustainafood

# 2. Backend Setup
cd sustainafood-backend
npm install
cd ..

# 3. Frontend Setup
cd sustainafood-frontend
npm install
cd ..

# 4. AI Setup
cd sustinia-ai
python -m venv venv
source venv/bin/activate     # or venv\Scripts\activate on Windows
pip install -r requirements.txt
🔐 Environment Variables
Create a .env in sustainafood-backend:

env
Copier
Modifier
MONGODB_URI=your_mongodb_uri
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
JWT_SECRET=your_jwt_secret
NODE_ENV=development
▶️ Running the App
bash
Copier
Modifier
# Start AI Server (http://127.0.0.1:5000)
cd sustinia-ai
source venv/bin/activate
python app.py

# Start Backend (http://localhost:3000)
cd sustainafood-backend
npm start

# Start Frontend (http://localhost:3001)
cd sustainafood-frontend
npm start
📡 API Endpoints
Auth
GET /auth/google – Login

GET /auth/google/callback – Callback

Donations
GET /donation

POST /donation

GET /donation/anomalies

Requests
GET /request

POST /request

AI Forecasts
GET /forecast/donations

GET /forecast/requests

🌐 Frontend Pages
Public: Home, Login, Signup, Contact, About, Forgot Password

User: Profile, Add Donation, My Donations, Requests, Analytics

Admin: Dashboard, User Management, Anomaly Detection

🤝 Contributing
We welcome contributions from the community!

Fork the repository

Create your feature branch
git checkout -b feature/your-feature

Commit your changes
git commit -m "Add your feature"

Push to the branch
git push origin feature/your-feature

Open a Pull Request

Please follow our Code of Conduct and ensure your code follows our standards.

👥 Dev Dreamers Team
Made with ❤️ by 4th-year engineering students at Esprit:

Ben Rebah Mouna

Satouri Tassnime

Chayma Fouzei

Mariem Touzri

Wala Amar

📜 License
This project is licensed under the MIT License. See the LICENSE file.

📬 Contact
📧 Email: sustainafood.team@gmail.com

🐛 GitHub Issues: Report issues here

🌱 SustainaFood – Turning waste into hope, one donation at a time.
