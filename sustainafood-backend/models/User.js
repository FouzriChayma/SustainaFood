// models/User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('./Counter'); // Import the Counter model

// Define possible values for sexe, ONG type, and vehicule type
const Sexe = Object.freeze({
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
});

const OngType = Object.freeze({
  CHARITY: 'charity',
  NGO: 'ngo',
  FOUNDATION: 'foundation'
});

const VehiculeType = Object.freeze({
  CAR: 'car',
  MOTORBIKE: 'motorbike',
  BICYCLE: 'bicycle'
});

const role = Object.freeze({
  ADMIN: 'admin',
  ONG: 'ong',
  RESTAUTANT: 'restaurant',
  SUPERMARKET: 'supermarket',
  STUDENT: 'student',
});

// User schema definition
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmPassword: { type: String, required: true },
  role: { type: String, enum: Object.values(role), required: true },
  id: { type: Number },  // Custom id that will be auto-incremented
  phone: { type: Number, required: true },
  address: { type: String, required: true },
  photo: { type: String },
  age: { type: Number },
  sexe: { type: String, enum: Object.values(Sexe) },
  image_carte_etudiant: { type: String },
  image_carte_identite: { type: String },
  id_fiscale: { type: String },
  type: { type: String, enum: Object.values(OngType), required: true },
  vehiculeType: { type: String, enum: Object.values(VehiculeType), required: true },
  taxR: { type: String },
  isBlocked: { type: Boolean, default: false }
});

// Pre-save hook to automatically increment the `id` field before saving a user
userSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Find and increment the counter for `id`
      const counter = await Counter.findOneAndUpdate(
        { _id: 'userId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true } // Create the counter if it doesn't exist
      );
      this.id = counter.seq;  // Set the custom `id` field to the incremented counter
      next();  // Proceed to save the user
    } catch (err) {
      next(err);  // Handle any errors that occur during the counter update
    }
  } else {
    next();  // If it's not a new user, just continue without modifying `id`
  }
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
