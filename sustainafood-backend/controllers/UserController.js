const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
async function addUser(req, res) {
    try {
        const { email, password, confirmPassword, phone, name, address, role } = req.body;

        // Vérifier si tous les champs obligatoires sont remplis
        if (!email || !password || !confirmPassword || !phone || !name || !address || !role) {
            return res.status(400).json({ error: "Veuillez remplir tous les champs." });
        }

        // Vérifier si les mots de passe correspondent
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        // Vérifier si l'email est déjà utilisé
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Hacher le mot de passe avant de le stocker
        const hashedPassword = await bcrypt.hash(password, 10);

        // Création de l'utilisateur sans stocker confirmPassword
        const user = new User({
            email,
            password: hashedPassword,
            phone,
            name,
            address,
            role
        });

        await user.save();
        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
async function updateUser(req, res) {
    try {
        const { name, address, sexe, photo, phone, vehiculeType, image_carte_etudiant } = req.body;
        const updateData = { name, address, sexe, photo, phone, vehiculeType, image_carte_etudiant };

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
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


module.exports = { addUser, getUsers, getUserById, updateUser, deleteUser, user_signin,getUserByEmailAndPassword };