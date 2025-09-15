document.addEventListener('DOMContentLoaded', function() {
    // Show roommates field when sharing is selected
    const sharingRadio = document.getElementById('sharing');
    const singleRadio = document.getElementById('single');
    const roommatesContainer = document.getElementById('roommatesContainer');
    
    sharingRadio.addEventListener('change', function() {
        roommatesContainer.style.display = 'block';
    });
    
    singleRadio.addEventListener('change', function() {
        roommatesContainer.style.display = 'none';
    });
    
    // Handle form submission
    const searchForm = document.getElementById('searchForm');
    const resultsContainer = document.getElementById('resultsContainer');
    const listingsContainer = document.getElementById('listingsContainer');
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const budget = document.getElementById('budget').value;
        const location = document.getElementById('location').value;
        const accommodationType = document.querySelector('input[name="accommodationType"]:checked').value;
        const roomType = document.querySelector('input[name="roomType"]:checked').value;
        const roommates = roomType === 'sharing' ? document.getElementById('roommates').value : 1;
        
        // Show loading state
        listingsContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        resultsContainer.style.display = 'block';
        
        // Prepare data for API request
        const searchData = {
            budget: budget,
            location: location,
            accommodationType: accommodationType,
            roomType: roomType,
            roommates: roommates
        };
        
        // Make API request to backend
        fetchRecommendations(searchData);
    });
    
    // Function to fetch recommendations from backend
    function fetchRecommendations(searchData) {
        // For demo purposes, we'll use mock data instead of actual API call
        setTimeout(() => {
            const mockListings = getMockListings(searchData);
            displayListings(mockListings, searchData.roommates);
        }, 1500);
        
        // In a real implementation, you would use fetch API:
        /*
        fetch('http://localhost:3000/api/recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchData),
        })
        .then(response => response.json())
        .then(data => {
            displayListings(data, searchData.roommates);
        })
        .catch(error => {
            console.error('Error:', error);
            listingsContainer.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Error fetching recommendations. Please try again.</p></div>';
        });
        */
    }
    
    // Function to display listings
    function displayListings(listings, roommates) {
        listingsContainer.innerHTML = '';
        
        if (listings.length === 0) {
            listingsContainer.innerHTML = '<div class="col-12 text-center"><p>No listings found matching your criteria. Try adjusting your search parameters.</p></div>';
            return;
        }
        
        listings.forEach(listing => {
            const splitRent = Math.round(listing.rent / roommates);
            
            // Create safety badge
            let safetyBadge = '';
            if (listing.safetyScore >= 4) {
                safetyBadge = '<span class="safety-score safety-high">High Safety</span>';
            } else if (listing.safetyScore >= 3) {
                safetyBadge = '<span class="safety-score safety-medium">Medium Safety</span>';
            } else {
                safetyBadge = '<span class="safety-score safety-low">Low Safety</span>';
            }
            
            // Create verification badge
            const verificationBadge = listing.verified ? 
                '<span class="badge badge-verified">✅ Verified</span>' : 
                '<span class="badge badge-warning">⚠️ Suspicious</span>';
            
            const listingCard = `
                <div class="col-md-4 mb-4">
                    <div class="card property-card shadow">
                        <img src="${listing.image}" class="card-img-top" alt="${listing.title}">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title">${listing.title}</h5>
                                ${verificationBadge}
                            </div>
                            <p class="card-text">${listing.address}</p>
                            <p class="travel-time"><i class="bi bi-geo-alt"></i> ${listing.travelTime} from your location</p>
                            <div class="d-flex align-items-center mb-2">
                                ${safetyBadge}
                                <span class="ms-2">⭐ ${listing.rating}/5</span>
                            </div>
                            <div class="price-container mb-3">
                                <div class="price">₹${listing.rent}/month</div>
                                ${roommates > 1 ? `<div class="split-price">₹${splitRent} per person with ${roommates} roommates</div>` : ''}
                            </div>
                            <div class="ai-explanation">
                                <small><strong>Why this is recommended:</strong> ${listing.aiExplanation}</small>
                            </div>
                            <div class="mt-3">
                                <button class="btn btn-primary w-100">Contact Owner</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            listingsContainer.innerHTML += listingCard;
        });
    }
    
    // Mock data for demonstration
    function getMockListings(searchData) {
        const budget = parseInt(searchData.budget);
        const accommodationType = searchData.accommodationType;
        
        // Base listings
        const listings = [
            {
                id: 1,
                title: "Modern PG Accommodation",
                address: "123 College Road, Near Delhi University",
                rent: 7500,
                deposit: 15000,
                accommodationType: "pg",
                travelTime: "10 mins",
                rating: 4.2,
                safetyScore: 4.5,
                verified: true,
                image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                aiExplanation: "This PG is 10 mins from Delhi University, under your budget, and has excellent safety ratings."
            },
            {
                id: 2,
                title: "Spacious 2BHK Apartment",
                address: "456 University Lane, Delhi",
                rent: 12000,
                deposit: 24000,
                accommodationType: "flat",
                travelTime: "15 mins",
                rating: 4.5,
                safetyScore: 4.8,
                verified: true,
                image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                aiExplanation: "This flat is perfect for sharing, located in a safe neighborhood with good connectivity to campus."
            },
            {
                id: 3,
                title: "Budget Hostel",
                address: "789 Student Hub, Delhi",
                rent: 6000,
                deposit: 6000,
                accommodationType: "hostel",
                travelTime: "5 mins",
                rating: 3.8,
                safetyScore: 3.5,
                verified: true,
                image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                aiExplanation: "This hostel is extremely close to campus and very affordable with basic amenities."
            },
            {
                id: 4,
                title: "Luxury PG with Meals",
                address: "101 Premium Residency, Delhi",
                rent: 9500,
                deposit: 19000,
                accommodationType: "pg",
                travelTime: "20 mins",
                rating: 4.7,
                safetyScore: 4.9,
                verified: true,
                image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                aiExplanation: "This premium PG offers excellent facilities including meals, though slightly farther from campus."
            },
            {
                id: 5,
                title: "Suspicious Listing - Too Good To Be True",
                address: "999 Fake Address, Delhi",
                rent: 4000,
                deposit: 4000,
                accommodationType: "flat",
                travelTime: "8 mins",
                rating: 2.1,
                safetyScore: 1.5,
                verified: false,
                image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                aiExplanation: "This listing has been flagged for suspicious activity. The price is unusually low for the area and amenities."
            }
        ];
        
        // Filter by budget and accommodation type
        let filteredListings = listings.filter(listing => {
            return listing.rent <= budget && 
                  (accommodationType === 'all' || listing.accommodationType === accommodationType);
        });
        
        // Sort by relevance (combination of price, travel time, and safety)
        filteredListings.sort((a, b) => {
            const scoreA = calculateRelevanceScore(a, budget);
            const scoreB = calculateRelevanceScore(b, budget);
            return scoreB - scoreA;
        });
        
        // Return top 3 listings
        return filteredListings.slice(0, 3);
    }
    
    // Calculate relevance score for sorting
    function calculateRelevanceScore(listing, budget) {
        const priceFactor = 1 - (listing.rent / budget); // Lower price = higher score
        const travelTimeFactor = 1 - (parseInt(listing.travelTime) / 60); // Shorter travel time = higher score
        const safetyFactor = listing.safetyScore / 5; // Higher safety = higher score
        const verificationFactor = listing.verified ? 1 : 0.5; // Verified listings get a boost
        
        // Weighted score calculation
        return (priceFactor * 0.4) + (travelTimeFactor * 0.2) + (safetyFactor * 0.3) + (verificationFactor * 0.1);
    }
});