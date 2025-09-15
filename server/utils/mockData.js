// Mock data utility for SafeStay prototype

// Function to get mock listings
function getMockListings() {
    return [
        {
            id: 1,
            title: "Modern PG Accommodation",
            address: "123 College Road, Near Delhi University",
            rent: 7500,
            deposit: 15000,
            accommodationType: "pg",
            rating: 4.2,
            safetyScore: 4.5,
            verified: true,
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        },
        {
            id: 2,
            title: "Spacious 2BHK Apartment",
            address: "456 University Lane, Delhi",
            rent: 12000,
            deposit: 24000,
            accommodationType: "flat",
            rating: 4.5,
            safetyScore: 4.8,
            verified: true,
            image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        },
        {
            id: 3,
            title: "Budget Hostel",
            address: "789 Student Hub, Delhi",
            rent: 6000,
            deposit: 6000,
            accommodationType: "hostel",
            rating: 3.8,
            safetyScore: 3.5,
            verified: true,
            image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        },
        {
            id: 4,
            title: "Luxury PG with Meals",
            address: "101 Premium Residency, Delhi",
            rent: 9500,
            deposit: 19000,
            accommodationType: "pg",
            rating: 4.7,
            safetyScore: 4.9,
            verified: true,
            image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        },
        {
            id: 5,
            title: "Suspicious Listing - Too Good To Be True",
            address: "999 Fake Address, Delhi",
            rent: 4000,
            deposit: 4000,
            accommodationType: "flat",
            rating: 2.1,
            safetyScore: 1.5,
            verified: false,
            image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        }
    ];
}

// Function to calculate relevance score for sorting
function calculateScore(listing, budget) {
    const priceFactor = 1 - (listing.rent / budget); // Lower price = higher score
    const travelTimeFactor = 1 - (parseInt(listing.travelTime) / 60); // Shorter travel time = higher score
    const safetyFactor = listing.safetyScore / 5; // Higher safety = higher score
    const verificationFactor = listing.verified ? 1 : 0.5; // Verified listings get a boost
    
    // Weighted score calculation
    return (priceFactor * 0.4) + (travelTimeFactor * 0.2) + (safetyFactor * 0.3) + (verificationFactor * 0.1);
}

module.exports = {
    getMockListings,
    calculateScore
};