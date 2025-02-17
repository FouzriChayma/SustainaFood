const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
async function addUser(req, res) {
    try {
        const { password, confirmPassword } = req.body;

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with the hashed password
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
    const { email, password } = req.body;

    try {
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

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = { addUser, getUsers, getUserById, updateUser, deleteUser, user_signin };