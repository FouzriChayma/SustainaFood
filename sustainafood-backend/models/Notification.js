const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('./Counter');

// Define the Meal schema
const notificationSchema = new Schema({
    id: { 
        type: Number, 
        unique: true, 
        required: true 
    },
    sender:{
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'sender is required']
    },
    receiver: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'receiver is required']
    },
    message: { 
        type: String, 
        required: [true, 'Message is required'] 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }

});

// Pre-save hook to auto-increment the 'id' field using the Counter model
notificationSchema.pre('save', async function (next) {
    const doc = this;
    if (doc.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { _id: 'notificationId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            doc.id = counter.seq;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

// Create and export the Meal model
const Notification = mongoose.model('Notification', NotificationSchema); 
module.exports = Notification; // Corrected export name