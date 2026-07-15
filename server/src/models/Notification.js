const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    type: { 
        type: String, 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    // Optional generic reference to the source entity (e.g. a Session or Match document)
    relatedId: { 
        type: mongoose.Schema.Types.ObjectId 
    },
    relatedModel: { 
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);