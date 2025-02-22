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
const updateUser = async (req, res) => {
    try {
        const { name, email, phone, address, photo, age, sexe, image_carte_etudiant, 
                image_carte_identite, id_fiscale, type, vehiculeType, taxR, isBlocked } = req.body;

        // Filtrage des attributs autorisés pour éviter des mises à jour indésirables
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;
        if (photo) updateData.photo = photo;
        if (age) updateData.age = age;
        if (sexe) updateData.sexe = sexe;
        if (image_carte_etudiant) updateData.image_carte_etudiant = image_carte_etudiant;
        if (image_carte_identite) updateData.image_carte_identite = image_carte_identite;
        if (id_fiscale) updateData.id_fiscale = id_fiscale;
        if (type) updateData.type = type;
        if (vehiculeType) updateData.vehiculeType = vehiculeType;
        if (taxR) updateData.taxR = taxR;
        if (typeof isBlocked === 'boolean') updateData.isBlocked = isBlocked; // Vérification explicite pour éviter de mal interpréter une valeur vide

        // Vérifier si l'utilisateur existe
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Mise à jour de l'utilisateur
        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



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