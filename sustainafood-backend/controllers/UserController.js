const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto"); // For generating random reset codes
require("dotenv").config(); // Load environment variables

// Generate a 6-digit reset code
const generateResetCode = () => Math.floor(100000 + Math.random() * 900000).toString(); 

// Function to generate a reset code and send it via email
// 🚀 Send Reset Code (Forgot Password)
async function sendResetCode(req, res) {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Generate reset code
        const resetCode = generateResetCode();

        // Store reset code & expiration
        user.resetCode = resetCode;
        user.resetCodeExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes
        await user.save();

        // Configure email transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS, 
            },
        });

        // Email details
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Code",
            text: `Your password reset code is: ${resetCode}. This code is valid for 10 minutes.`,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Reset code sent successfully" });

    } catch (error) {
        console.error("Error sending reset code:", error);
        res.status(500).json({ error: "Error sending reset code" });
    }
}

// 🚀 Validate Reset Code
async function validateResetCode(req, res) {
    const { email, resetCode } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || user.resetCode !== resetCode || user.resetCodeExpires < Date.now()) {
            return res.status(400).json({ error: "Invalid or expired reset code" });
        }

        res.status(200).json({ message: "Reset code verified" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}

// 🚀 Reset Password
async function resetPassword(req, res) {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password & clear reset code
        user.password = hashedPassword;
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password successfully reset" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}





async function addUser(req, res) {
    try {
        const { email, password, confirmPassword, phone, name, address, role } = req.body;

        // Vérifier si tous les champs sont remplis
        if (!email || !password || !confirmPassword || !phone || !name || !address || !role) {
            return res.status(400).json({ error: "Veuillez remplir tous les champs." });
        }

        // Vérifier si les mots de passe correspondent
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        // Vous pouvez également ajouter une validation de l'e-mail ici
        // Par exemple, vérifier que l'e-mail n'est pas déjà utilisé

        // Hacher le mot de passe avant de le stocker
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur avec le mot de passe haché
        const user = new User({ ...req.body, password: hashedPassword });

        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Get all users
async function getUsers(req, res) {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get a user by ID
async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getUserByEmailAndPassword(req, res) {
    const { email, password } = req.body; // Récupérer l'email et le mot de passe depuis le corps de la requête

    try {
        // Trouver l'utilisateur par email
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Si l'utilisateur est trouvé et le mot de passe est correct, renvoyer les détails de l'utilisateur
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// Update a user
const updateUser = async (req, res) => {
    try {
        const { name, email, phone, address, photo, age, sexe, image_carte_etudiant, 
                num_cin, id_fiscale, type, vehiculeType, taxR, isBlocked, resetCode, resetCodeExpires } = req.body;

        // Filtrage des attributs autorisés pour éviter des mises à jour indésirables
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone && !isNaN(phone)) updateData.phone = phone;
        if (address) updateData.address = address;
        if (photo) updateData.photo = photo;
        if (age && !isNaN(age)) updateData.age = age;
        if (sexe) updateData.sexe = sexe;
        if (image_carte_etudiant) updateData.image_carte_etudiant = image_carte_etudiant;
        if (num_cin) updateData.num_cin = num_cin;
        if (id_fiscale) updateData.id_fiscale = id_fiscale;
        if (type) updateData.type = type;
        if (vehiculeType) updateData.vehiculeType = vehiculeType;
        if (taxR) updateData.taxR = taxR;
        if (typeof isBlocked === 'boolean') updateData.isBlocked = isBlocked;
        if (resetCode) updateData.resetCode = resetCode;
        if (resetCodeExpires) updateData.resetCodeExpires = resetCodeExpires;

        // Vérifier si l'utilisateur existe
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Vérification supplémentaire pour empêcher la modification du rôle par un utilisateur non autorisé
        if (req.body.role && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Unauthorized to update role" });
        }
        if (req.body.role) updateData.role = req.body.role;

        // Ne pas permettre la modification du mot de passe via cette méthode
        if (req.body.password) {
            return res.status(400).json({ error: "Password cannot be updated this way" });
        }

        // Mise à jour de l'utilisateur
        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// 🚀 Block or Unblock User
async function toggleBlockUser(req, res) {
    try {
        const { id } = req.params; // Get user ID from request parameters

        // Find the user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Toggle the isBlocked field
        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`, isBlocked: user.isBlocked });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// Delete a user
async function deleteUser(req, res) {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Signin (generate JWT token)
async function user_signin(req, res) {
    console.log("Requête reçue :", req.body); // 🔹 LOG DES DONNÉES REÇUES

    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const payload = {
            userId: user._id,
            role: user.role,
        };

        const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "1h" });

        res.status(200).json({ token, role: user.role, id: user._id });
    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).json({ error: "Server error" });
    }
}
// 🚀 View Student by ID
async function viewStudent(req, res) {
    try {
        // Retrieve student ID from request parameters
        const studentId = req.params.id;

        // Find the student by ID
        const student = await User.findById(studentId); // Assuming you're storing student data in the User model
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Send the student details in the response
        res.status(200).json(student);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}

async function viewRestaurant(req, res) {
    try {
        // Retrieve restaurant ID from request parameters
        const restaurantId = req.params.id;

        // Find the restaurant by ID (assuming you're storing restaurant data in the User model)
        const restaurant = await User.findById(restaurantId);
        
        // Check if the restaurant exists
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        // Send the restaurant details in the response
        res.status(200).json(restaurant);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}
async function viewSupermarket(req, res) {
    try {
        // Retrieve supermarket ID from request parameters
        const supermarketId = req.params.id;

        // Find the supermarket by ID (assuming you're storing supermarket data in the User model)
        const supermarket = await User.findById(supermarketId);
        
        // Check if the supermarket exists
        if (!supermarket) {
            return res.status(404).json({ error: "Supermarket not found" });
        }

        // Send the supermarket details in the response
        res.status(200).json(supermarket);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}
async function viewNGO(req, res) {
    try {
        // Récupérer l'ID de l'ONG depuis les paramètres de la requête
        const ongId = req.params.id;

        // Trouver l'ONG par ID (en supposant que les ONG sont stockées dans le modèle User)
        const ong = await User.findById(ongId);
        
        // Vérifier si l'ONG existe
        if (!ong) {
            return res.status(404).json({ error: "ONG not found" });
        }

        // Envoyer les détails de l'ONG dans la réponse
        res.status(200).json(ong);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}


module.exports = { addUser, getUsers, getUserById, updateUser, deleteUser, user_signin,getUserByEmailAndPassword , resetPassword ,validateResetCode,sendResetCode , toggleBlockUser , viewStudent , viewRestaurant , viewSupermarket, viewNGO};