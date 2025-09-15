const express = require('express');
const router = express.Router();
const { getMockListings, calculateScore } = require('../utils/mockData');

// Get recommendations based on user preferences
router.post('/recommendations', (req, res) => {
    try {
        const { budget, location, accommodationType, roomType, roommates } = req.body;
        
        // Get mock listings (in a real app, this would query MongoDB)
        const listings = getMockListings();
        
        // Filter by budget and accommodation type
        let filteredListings = listings.filter(listing => {
            return listing.rent <= budget && 
                  (accommodationType === 'all' || listing.accommodationType === accommodationType);
        });
        
        // Calculate travel time and distance (simulated)
        filteredListings = filteredListings.map(listing => {
            // In a real app, this would use Google Maps API
            const travelTime = Math.floor(Math.random() * 30) + 5; // 5-35 mins
            return {
                ...listing,
                travelTime: `${travelTime} mins`
            };
        });
        
        // Sort by relevance score
        filteredListings.sort((a, b) => {
            const scoreA = calculateScore(a, budget);
            const scoreB = calculateScore(b, budget);
            return scoreB - scoreA;
        });
        
        // Add AI explanation (simulated)
        filteredListings = filteredListings.map(listing => {
            // In a real app, this would use OpenAI API
            let explanation = '';
            
            if (listing.verified) {
                explanation = `This ${listing.accommodationType} is ${listing.travelTime} from your location, `;
                
                if (listing.rent <= budget * 0.8) {
                    explanation += 'well under your budget, ';
                } else {
                    explanation += 'within your budget, ';
                }
                
                if (listing.safetyScore >= 4) {
                    explanation += 'and has excellent safety ratings.';
                } else if (listing.safetyScore >= 3) {
                    explanation += 'and has good safety ratings.';
                } else {
                    explanation += 'but has average safety ratings.';
                }
            } else {
                explanation = 'This listing has been flagged as suspicious. The price is unusually low for the area and amenities.';
            }
            
            return {
                ...listing,
                aiExplanation: explanation
            };
        });
        
        // Return top 3 listings
        res.json(filteredListings.slice(0, 3));
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;