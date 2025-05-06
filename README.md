**SustainaFood: Revolutionizing Food Redistribution 🌍

A Feast of Waste in a Hungry WorldPicture this: shelves groaning with unsold bread, crates of slightly bruised apples that nobody bought. Across the street, a student digs through their bag for the last crumpled ramen packet, while an NGO volunteer sighs over an empty pantry. It’s a tale of two worlds—one drowning in excess, the other starving for a chance. Society produces more than enough food, yet millions go hungry. It’s not a supply issue—it’s a distribution failure.

SustainaFood is here to bridge that gap. Developed as a 4th-year integrated project at Esprit School of Engineering, SustainaFood is a platform designed to tackle food waste in Tunisia and Setif by connecting food donors (restaurants, supermarkets, personal donors), recipients (NGOs, students), and transporters in a seamless, efficient ecosystem. Our mission is to turn surplus into sustenance, ensuring no food goes to waste while no one goes hungry.
🎯 Project Vision
SustainaFood addresses the paradox of food waste and hunger by:

Redistributing Surplus: Connecting donors with excess food to recipients in need.
Optimizing Logistics: Assigning transporters to ensure timely deliveries.
Leveraging AI: Using machine learning to detect donation anomalies, predict supply/demand, and classify food items.
Empowering Communities: Enabling NGOs, students, restaurants, supermarkets, and individuals to participate in a sustainable food ecosystem.

🚀 Features

Donation Management: Create, update, and track food donations (prepared meals or packaged products).
Request System: NGOs and students can request specific food items based on their needs.
AI-Powered Insights:
Anomaly detection to flag suspicious donations (e.g., large quantities near expiry).
Supply/demand forecasting to anticipate food needs.
Food classification to ensure donations meet recipient requirements.


Delivery Coordination: Assign transporters to deliveries and track their status.
User Roles: Supports multiple roles (admin, donor, recipient, transporter) with role-based access control.
Analytics Dashboards: Provide donors and recipients with insights into their contributions and fulfilled requests.
Notifications: Real-time alerts for donation approvals, rejections, and delivery updates.
Feedback System: Allows users to rate and review delivery experiences.
Google Authentication: Secure login with Google OAuth and optional 2FA.
Backoffice for Admins: Manage users, donations, requests, and anomalies with a comprehensive admin dashboard.

🛠️ Tech Stack
Backend

Node.js & Express: RESTful API for handling requests and business logic.
MongoDB & Mongoose: NoSQL database for storing donations, requests, users, and transactions.
Passport.js: Google OAuth for secure authentication.
JWT: Token-based authentication for secure API access.
Nodemailer: Email notifications for donation approvals/rejections and user actions.
Multer: File uploads for user profiles and donation images.

Frontend

React & React Router: Single-page application with dynamic routing.
Axios: HTTP client for API communication.
Context API: Global state management for alerts and user data.
Tailwind CSS: Utility-first CSS for responsive design (assumed based on modern React practices).

AI

Python & Flask: RESTful API for AI-driven forecasting and anomaly detection.
scikit-learn & Pandas: Machine learning and data processing (assumed based on food41_classifier.h5 and .pkl files).
Virtual Environment: venv for Python dependency management.

Other

Jenkins: CI/CD pipeline configuration (jenkinsfile).
dotenv: Environment variable management for secure configuration.
node-cron: Scheduled tasks for periodic ML model updates (assumed from backend).

📂 Project Structure
sustainafood/
├── sustainafood-backend/       # Node.js backend with Express routes and controllers
│   ├── config/                # Configuration files
│   ├── controllers/           # API logic
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express route definitions
│   ├── Middleware/            # Custom middleware
│   ├── public/                # Static assets
│   ├── views/                 # Twig templates
│   └── ...
├── sustainafood-frontend/     # React frontend
│   ├── src/                   # React components and pages
│   │   ├── pages/            # React page components
│   │   ├── components/       # Reusable React components
│   │   ├── contexts/         # React context
│   │   └── App.jsx           # Main React app
│   └── ...
├── sustinia-ai/               # AI component with Flask API
│   ├── food41/               # Data or model files (e.g., food41_classifier.h5)
│   ├── venv/                 # Virtual environment
│   ├── app.py                # Flask API entry point
│   ├── class_indices.json    # Class indices for model
│   ├── cmd_ai                # AI command script
│   ├── data/                 # Dataset and augmentation files
│   ├── decoupage.py          # Data processing script
│   ├── donation_forecast_model.pkl # Trained donation forecast model
│   ├── evaluate_model.py     # Model evaluation script
│   ├── model.py              # Machine learning model definition
│   ├── request_forecast_model.pkl # Trained request forecast model
│   └── ...
├── jenkinsfile                # Jenkins CI/CD configuration
├── package-lock.json          # Node.js dependency lock file
├── repomix-output.xml         # Repository mix output (likely CI/CD artifact)
└── README.md                  # Project documentation

🏗️ Getting Started
Prerequisites

Node.js (v16 or higher)
MongoDB (local or Atlas)
Python (v3.8 or higher)
Git
pip: Python package manager

Installation

Clone the Repository:
git clone https://github.com/your-repo/sustainafood.git
cd sustainafood


Install Backend Dependencies:
cd sustainafood-backend
npm install
cd ..


Install Frontend Dependencies:
cd sustainafood-frontend
npm install
cd ..


Set Up AI Environment:
cd sustinia-ai
python -m venv venv
venv\Scripts\activate  # On Windows
# venv/bin/activate    # On macOS/Linux
pip install -r requirements.txt  # Create requirements.txt with necessary packages (e.g., flask, scikit-learn, pandas)


Set Up Environment Variables:Create a .env file in sustainafood-backend with:
MONGODB_URI=your_mongodb_connection_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development


Configure MongoDB:Update sustainafood-backend/config/database.json with your MongoDB connection details if not using .env.

Run the AI Flask API:
cd sustinia-ai
venv\Scripts\activate  # On Windows
python app.py

The API will run on http://127.0.0.1:5000.

Start the Backend:
cd sustainafood-backend
npm start

The server will run on http://localhost:3000.

Start the Frontend:
cd sustainafood-frontend
npm start

The React app will run on http://localhost:3001 (or another port if configured).


API Endpoints

Auth: /auth/google (Google OAuth login), /auth/google/callback (callback)
Donations: 
GET /donation (list all donations)
POST /donation (create donation)
GET /donation/anomalies (list anomalous donations)


Requests: 
GET /request (list all requests)
POST /request (create request)


AI Forecasts: 
GET http://127.0.0.1:5000/forecast/donations (donation predictions)
GET http://127.0.0.1:5000/forecast/requests (request predictions)



Frontend Pages

Public: Home, Login, Signup, Contact, About, Forget Password
User: Profile, Edit Profile, Add Donation, My Donations, My Requests, Analytics Dashboard
Admin: Dashboard, Donation List, Anomaly Dashboard, User Management

🤝 Contributing
We welcome contributions from the community! To contribute:

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit your changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a Pull Request.

Please follow our Code of Conduct and ensure your code adheres to our linting and formatting standards.
🧑‍💻 The Dev Dreamers Team
Developed by the talented 4th-year students at Esprit School of Engineering:

Ben Rebah Mouna
Satouri Tassnime
Chayma Fouzei
Mariem Touzri
Wala Amar

📜 License
This project is licensed under the MIT License. See the LICENSE file for details.
📬 Contact
For questions or feedback, reach out to us at:

Email: sustainafood.team@gmail.com
GitHub Issues: Create an issue in this repository


🌱 SustainaFood – Turning waste into hope, one donation at a time.
