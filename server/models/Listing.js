const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    rent: {
        type: Number,
        required: true
    },
    deposit: {
        type: Number,
        required: true
    },
    accommodationType: {
        type: String,
        enum: ['flat', 'pg', 'hostel'],
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    safetyScore: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    verified: {
        type: Boolean,
        default: false
    },
    image: {
        type: String
    },
    ownerPhone: {
        type: String
    },
    ownerID: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Method to check for duplicate listings
listingSchema.statics.findDuplicates = async function(phone, address) {
    const phoneMatch = await this.findOne({ ownerPhone: phone });
    const addressMatch = await this.findOne({ address: address });
    
    return {
        isDuplicate: !!(phoneMatch || addressMatch),
        reason: phoneMatch ? 'phone' : addressMatch ? 'address' : null
    };
};

module.exports = mongoose.model('Listing', listingSchema);