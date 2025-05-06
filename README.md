<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SustainaFood: Revolutionizing Food Redistribution</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f9fafb;
      color: #1f2937;
      line-height: 1.6;
    }
    .section-header {
      background: linear-gradient(to right, #10b981, #34d399);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .emoji {
      font-size: 1.5rem;
      margin-right: 0.5rem;
    }
    .link {
      transition: color 0.2s ease;
    }
    .link:hover {
      color: #059669;
    }
    .list-item {
      position: relative;
      padding-left: 1.5rem;
    }
    .list-item::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #10b981;
    }
    @media (max-width: 640px) {
      h1 {
        font-size: 2rem;
      }
      .container {
        padding: 1rem;
      }
    }
  </style>
</head>
<body class="min-h-screen">
  <div class="container mx-auto max-w-4xl px-6 py-12">
    <!-- Header -->
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold section-header mb-4">SustainaFood: Revolutionizing Food Redistribution 🌍</h1>
    </header>

    <!-- Introduction -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold section-header mb-4">A Feast of Waste in a Hungry World</h2>
      <p class="mb-4">
        Picture this: shelves groaning with unsold bread, crates of slightly bruised apples that nobody bought. Across the street, a student digs through their bag for the last crumpled ramen packet, while an NGO volunteer sighs over an empty pantry. It’s a tale of two worlds—one drowning in excess, the other starving for a chance. Society produces more than enough food, yet millions go hungry. It’s not a supply issue—it’s a distribution failure.
      </p>
      <p>
        <strong>SustainaFood</strong> is here to bridge that gap. Developed as a 4th-year integrated project at Esprit School of Engineering, SustainaFood is a platform designed to tackle food waste in Tunisia and Setif by connecting food donors (restaurants, supermarkets, personal donors), recipients (NGOs, students), and transporters in a seamless, efficient ecosystem. Our mission is to turn surplus into sustenance, ensuring no food goes to waste while no one goes hungry.
      </p>
    </section>

    <!-- Project Vision -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold section-header mb-4">🎯 Project Vision</h2>
      <p class="mb-4">SustainaFood addresses the paradox of food waste and hunger by:</p>
      <ul class="space-y-2">
        <li class="list-item">Redistributing Surplus: Connecting donors with excess food to recipients in need.</li>
        <li class="list-item">Optimizing Logistics: Assigning transporters to ensure timely deliveries.</li>
        <li class="list-item">Leveraging AI: Using machine learning to detect donation anomalies, predict supply/demand, and classify food items.</li>
        <li class="list-item">Empowering Communities: Enabling NGOs, students, restaurants, supermarkets, and individuals to participate in a sustainable food ecosystem.</li>
      </ul>
    </section>

    <!-- Features -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold section-header mb-4">🚀 Features</h2>
      <ul class="space-y-2">
        <li class="list-item"><strong>Donation Management:</strong> Create, update, and track food donations (prepared meals or packaged products).</li>
        <li class="list-item"><strong>Request System:</strong> NGOs and students can request specific food items based on their needs.</li>
        <li class="list-item"><strong>AI-Powered Insights:</strong>
          <ul class="pl-6 space-y-1">
            <li class="list-item">Anomaly detection to flag suspicious donations (e.g., large quantities near expiry).</li>
            <li class="list-item">Supply/demand forecasting to anticipate food needs.</li>
            <li class="list-item">Food classification to ensure donations meet recipient requirements.</li>
          </ul>
        </li>
        <li class="list-item"><strong>Delivery Coordination:</strong> Assign transporters to deliveries and track their status.</li>
        <li class="list-item"><strong>User Roles:</strong> Supports multiple roles (admin, donor, recipient, transporter) with role-based access control.</li>
        <li class="list-item"><strong>Analytics Dashboards:</strong> Provide donors and recipients with insights into their contributions and fulfilled requests.</li>
        <li class="list-item"><strong>Notifications:</strong> Real-time alerts for donation approvals, rejections, and delivery updates.</li>
        <li class="list-item"><strong>Feedback System:</strong> Allows users to rate and review delivery experiences.</li>
        <li class="list-item"><strong>Google Authentication:</strong> Secure login with Google OAuth and optional 2FA.</li>
        <li class="list-item"><strong>Backoffice for Admins:</strong> Manage users, donations, requests, and anomalies with a comprehensive admin dashboard.</li>
      </ul>
    </section>

    <!-- Tech Stack -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold section-header mb-4">🛠️ Tech Stack</h2>
      <h3 class="text-xl font-medium mb-2">Backend</h3>
      <ul class="space-y-2 mb-4">
        <li class="list-item"><strong>Node.js & Express:</strong> RESTful API for handling requests and business logic.</li>
        <li class="list-item"><strong>MongoDB & Mongoose:</strong> NoSQL database for storing donations, requests, users, and transactions.</li>
        <li class="list-item"><strong>Passport.js:</strong> Google OAuth for secure authentication.</li>
        <li class="list-item"><strong>JWT:</strong> Token-based authentication for secure API access.</li>
        <li class="list-item"><strong>Nodemailer:</strong> Email notifications for donation approvals/rejections and user actions.</li>
        <li class="list-item"><strong>Multer:</strong> File uploads for user profiles and donation images.</li>
      </ul>
      <h3 class="text-xl font-medium mb-2">Frontend</h3>
      <ul class="space-y-2 mb-4">
        <li class="list-item"><strong>React & React Router:</strong> Single-page application with dynamic routing.</li>
        <li class="list-item"><strong>Axios:</strong> HTTP client for API communication.</li>
        <li class="list-item"><strong>Context API:</strong> Global state management for alerts and user data.</li>
        <li class="list-item"><strong>Tailwind CSS:</strong> Utility-first CSS for responsive design.</li>
      </ul>
      <h3 class="text-xl font-medium mb-2">AI</h3>
      <ul class="space-y-2 mb-4">
        <li class="list-item"><strong>Python & Flask:</strong> RESTful API for AI-driven forecasting and anomaly detection.</li>
        <li class="list-item"><strong>scikit-learn & Pandas:</strong> Machine learning and data processing.</li>
        <li class="list-item"><strong>Virtual Environment:</strong> venv for Python dependency management.</li>
      </ul>
      <h3 class="text-xl font-medium mb-2">Other</h3>
      <ul class="space-y-2">
        <li class="list-item"><strong>Jenkins:</strong> CI/CD pipeline configuration.</li>
        <li class="list-item"><strong>dotenv:</strong> Environment variable management for secure configuration.</li>
        <li class="list-item"><strong>node-cron:</strong> Scheduled tasks for periodic ML model updates.</li>
      </ul>
    </section>

    <!-- Getting Started -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold section-header mb-4">🏗️ Getting Started</h2>
      <h3 class="text-xl font-medium mb-2">Prerequisites</h3>
      <ul class="space-y-2 mb-4">
        <li class="list-item">Node.js (v16 or higher)</li>
        <li class="list-item">MongoDB (local or Atlas)</li>
        <li class="list-item">Python (v3.8 or higher)</li>
        <li class="list-item">Git</li>
        <li class="list-item">pip: Python package manager</li>
      </ul>
      <h3 class="text-xl font-medium mb-2">Installation</h3>
      <ol class="space-y-2 mb-4">
        <li class="list-item">
          <strong>Clone the Repository:</strong><br>
          <code class="bg-gray-100 p-1 rounded">git clone https://github.com/FouzriChayma/SustainaFood.git</code><br>
          <code class="bg-gray-100 p-1 rounded">cd sustainafood</code>
        </li>
        <li class="list-item">
          <strong>Install Backend Dependencies:</strong><br>
          <code class="bg-gray-100 p-1 rounded">cd sustainafood-backend</code><br>
          <code class="bg-gray-100 p-1 rounded">npm install</code><br>
          <code class="bg-gray-100 p-1 rounded">cd ..</code>
        </li>
        <li class="list-item">
          <strong>Install Frontend Dependencies:</strong><br>
          <code class="bg-gray-100 p-1 rounded">cd sustainafood-frontend</code><br>
          <code class="bg-gray-100 p-1 rounded">npm install</code><br>
          <code class="bg-gray-100 p-1 rounded">cd ..</code>
        </li>
        <li class="list-item">
          <strong>Set Up AI Environment:</strong><br>
          <code class="bg-gray-100 p-1 rounded">cd sustinia-ai</code><br>
          <code class="bg-gray-100 p-1 rounded">python -m venv venv</code><br>
          <code class="bg-gray-100 p-1 rounded">venv\Scripts\activate</code> <span class="text-gray-600"># On Windows</span><br>
          <code class="bg-gray-100 p-1 rounded">pip install -r requirements.txt</code>
        </li>
        <li class="list-item">
          <strong>Set Up Environment Variables:</strong><br>
          Create a <code class="bg-gray-100 p-1 rounded">.env</code> file in <code class="bg-gray-100 p-1 rounded">sustainafood-backend</code> with:
          <pre class="bg-gray-100 p-4 rounded">
MONGODB_URI=your_mongodb_connection_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
          </pre>
        </li>
        <li class="list-item">
          <strong>Configure MongoDB:</strong><br>
          Update <code class="bg-gray-100 p-1 rounded">sustainafood-backend/config/database.json</code> with your MongoDB connection details if not using <code class="bg-gray-100 p-1 rounded">.env</code>.
        </li>
        <li class="list-item">
          <strong>Run the AI Flask API:</strong><br>
          <code class="bg-gray-100 p-1 rounded">cd sustinia-ai</code><br>
          <code class="bg-gray-100 p-1 rounded">venv\Scripts\activate</code><br>
          <code class="bg-gray-100 p-1 rounded">python app.py</code><br>
          The API will run on <a href="http://127.0.0.1:5000" class="link">http://127.0.0.1:5000</a>.
        </li>
        <li class="list-item">
          <strong>Start the Backend:</strong><br>
          <code class="bg-gray-100 p-1 rounded">cd sustainafood-backend</code><br>
          <code class="bg-gray-100 p-1 rounded">npm start</code><br>
          The server will run on <a href="http://localhost:3000" class="link">http://localhost:3000</a>.
        </li>
        <li class="list-item">
          <strong>Start the Frontend:</strong><br>
          <code class="bg-gray-100 p-1 rounded">cd sustainafood-frontend</code><br>
          <code class="bg-gray-100 p-1 rounded">npm start</code><br>
          The React app will run on <a href="http://localhost:3001" class="link">http://localhost:3001</a>.
        </li>
      </ol>
    </section>

    <!-- API Endpoints -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold section-header mb-4">API Endpoints</h2>
      <h3 class="text-xl font-medium mb-2">Auth</h3>
      <ul class="space-y-2 mb-4">
        <li class="list-item"><code class="bg-gray-100 p-1 rounded">/auth/google</code>: Google OAuth login</li>
        <li class="list-item"><code class="bg-gray-100 p-1 rounded">/auth/google/callback</code>: Callback</li>
      </ul>
      <h3 class="text-xl font-medium mb-2">Donations</h3>
      <ul class="space-y-2 mb-4">
        <li class="list-item"><code class="bg-gray-100 p-1 rounded">GET /donation</code>: List all donations</li>
        <li class="list-item"><code class="bg-gray-100 p-1 rounded">POST /donation</code>: Create donation</li>
        <li class="list-item"><code class="bg-gray-100 p-1 rounded">GET /donation/anomalies</code>: List anomalous donations</li>
      </ul>
      <h3 class="text-xl font-medium mb-2">Requests</h3>
      <ul class="space-y-2 mb-4">
        <li class="list-item"><code class="bg-gray-100 p-1 rounded">GET /request</code>: List all requests</li>
        <li class="list-item"><code class="bg-gray-100 p-1 rounded">POST /request</code>: Create request</li>
      </ul>
      <h3 class="text-xl font-medium mb-2">AI Forecasts</h3>
      <ul class="space-y-2">
        <li class="list-item"><code class="bg-gray-100 p-1 rounded">GET http://127.0.0.1:5000/forecast/donations</code>: Donation predictions</li>
        <li class="list-item"><code class="bg-gray-100 p-1 rounded">GET http://127.0.0.1:5000/forecast/requests</code>: Request predictions</li>
      </ul>
    </section>

    <!-- Frontend Pages -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold section-header mb-4">Frontend Pages</h2>
      <h3 class="text-xl font-medium mb-2">Public</h3>
      <ul class="space-y-2 mb-4">
        <li class="list-item">Home, Login, Signup, Contact, About, Forget Password</li>
      </ul>
      <h3 class="text-xl font-medium mb-2">User</h3>
      <ul class="space-y-2 mb-4">
        <li class="list-item">Profile, Edit Profile, Add Donation, My Donations, My Requests, Analytics Dashboard</li>
      </ul>
      <h3 class="text-xl font-medium mb-2">Admin</h3>
      <ul class="space-y-2">
        <li class="list-item">Dashboard, Donation List, Anomaly Dashboard, User Management</li>
      </ul>
    </section>

    <!-- Contributing -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold section-header mb-4">🤝 Contributing</h2>
      <p class="mb-4">We welcome contributions from the community! To contribute:</p>
      <ol class="space-y-2">
        <li class="list-item">Fork the repository.</li>
        <li class="list-item">Create a feature branch (<code class="bg-gray-100 p-1 rounded">git checkout -b feature/your-feature</code>).</li>
        <li class="list-item">Commit your changes (<code class="bg-gray-100 p-1 rounded">git commit -m "Add your feature"</code>).</li>
        <li class="list-item">Push to the branch (<code class="bg-gray-100 p-1 rounded">git push origin feature/your-feature</code>).</li>
        <li class="list-item">Open a Pull Request.</li>
      </ol>
      <p class="mt-4">Please follow our <a href="#" class="link">Code of Conduct</a> and ensure your code adheres to our linting and formatting standards.</p>
    </section>

    <!-- Team -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold section-header mb-4">🧑‍💻 The Dev Dreamers Team</h2>
      <p class="mb-4">Developed by the talented 4th-year students at Esprit School of Engineering:</p>
      <ul class="space-y-2">
        <li class="list-item">Ben Rebah Mouna</li>
        <li class="list-item">Satouri Tassnime</li>
        <li class="list-item">Chayma Fouzei</li>
        <li class="list-item">Mariem Touzri</li>
        <li class="list-item">Wala Amar</li>
      </ul>
    </section>

    <!-- License -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold section-header mb-4">📜 License</h2>
      <p>This project is licensed under the MIT License. See the <a href="#" class="link">LICENSE</a> file for details.</p>
    </section>

    <!-- Contact -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold section-header mb-4">📬 Contact</h2>
      <p>For questions or feedback, reach out to us at:</p>
      <ul class="space-y-2">
        <li class="list-item">Email: <a href="mailto:sustainafood.team@gmail.com" class="link">sustainafood.team@gmail.com</a></li>
        <li class="list-item">GitHub Issues: <a href="https://github.com/FouzriChayma/SustainaFood/issues" class="link">Create an issue</a> in this repository</li>
      </ul>
    </section>

    <!-- Footer -->
    <footer class="text-center mt-12">
      <p class="text-lg font-semibold section-header">🌱 SustainaFood – Turning waste into hope, one donation at a time.</p>
    </footer>
  </div>
</body>
</html>
