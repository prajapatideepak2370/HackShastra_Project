// app.js - version with city filtering, no Google Maps
document.addEventListener('DOMContentLoaded', function () {
    // UI elements
    const sharingRadio = document.getElementById('sharing');
    const singleRadio = document.getElementById('single');
    const roommatesContainer = document.getElementById('roommatesContainer');
    const searchForm = document.getElementById('searchForm');
    const listingsContainer = document.getElementById('listingsContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsCount = document.getElementById('resultsCount');
    const favoritesContainer = document.getElementById('favoritesContainer');
    const budgetSlider = document.getElementById('budget');
    const budgetValue = document.getElementById('budgetValue');
    const sortBy = document.getElementById('sortBy');

    // Roommates UI toggles
    sharingRadio?.addEventListener('change', () => roommatesContainer.style.display = 'block');
    singleRadio?.addEventListener('change', () => roommatesContainer.style.display = 'none');

    // Budget live display
    budgetValue.textContent = `₹${budgetSlider.value}`;
    budgetSlider.addEventListener('input', () => budgetValue.textContent = `₹${budgetSlider.value}`);

    // Favorites on load
    displayFavorites();

    // Handle search form submit
    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const budget = parseInt(budgetSlider.value);
        const location = document.getElementById('location').value.trim();
        const accommodationType = document.getElementById('accommodationType').value;
        const roomType = document.querySelector('input[name="roomType"]:checked').value;
        const roommates = roomType === 'sharing' ? parseInt(document.getElementById('roommates').value) : 1;

        const searchData = { budget, location, accommodationType, roomType, roommates, sort: sortBy.value };
        showSkeletons();
        resultsContainer.style.display = 'block';

        setTimeout(() => {
            const mock = getMockListings(searchData);
            const sorted = applySort(mock, searchData.sort);
            displayListings(sorted, roommates);
            resultsCount.textContent = `${sorted.length} results`;
        }, 900);
    });

    // Sorting change (re-run last search)
    sortBy.addEventListener('change', () => {
        if (resultsContainer.style.display === 'block') {
            searchForm.requestSubmit();
        }
    });

    // Skeleton loading
    function showSkeletons() {
        listingsContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            listingsContainer.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="skeleton p-3" style="height:320px"></div>
            </div>`;
        }
    }

    // Display listings
    function displayListings(listings, roommates = 1) {
        listingsContainer.innerHTML = '';
        if (!listings || listings.length === 0) {
            listingsContainer.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No listings found matching your criteria.</p></div>';
            return;
        }

        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

        listings.forEach(listing => {
            const splitRent = Math.round(listing.rent / roommates);
            let safetyBadge = '';
            if (listing.safetyScore >= 4) safetyBadge = '<span class="safety-score safety-high">High Safety</span>';
            else if (listing.safetyScore >= 3) safetyBadge = '<span class="safety-score safety-medium">Medium Safety</span>';
            else safetyBadge = '<span class="safety-score safety-low">Low Safety</span>';

            // Enhanced fraud detection badges
            let verifiedBadge = '';
            if (listing.verified) {
                verifiedBadge = '<span class="badge badge-verified me-1">Verified</span>';
            } else {
                // Show specific fraud warning based on detection type
                if (listing.fraudDetails?.isDuplicate) {
                    verifiedBadge = '<span class="badge badge-warning me-1" title="This listing appears to be a duplicate">Duplicate Listing</span>';
                } else if (listing.fraudDetails?.hasFakeID) {
                    verifiedBadge = '<span class="badge badge-warning me-1" title="Owner verification failed">Fake ID</span>';
                } else {
                    verifiedBadge = '<span class="badge badge-warning me-1">Suspicious</span>';
                }
            }
            const isFav = favorites.includes(listing.id);

            const listingCard = document.createElement('div');
            listingCard.className = 'col-md-4 mb-4';
            listingCard.innerHTML = `
                <div class="card property-card shadow-sm h-100">
                    ${listing.fraudDetails?.isDuplicate ? '<div class="fraud-alert">Potential Duplicate</div>' : ''}
                    ${listing.fraudDetails?.hasFakeID ? '<div class="fraud-alert fake-id-alert">Suspicious Owner</div>' : ''}
                    <img src="${listing.image || 'https://via.placeholder.com/300x200/EEEEEE/999999?text=Property'}" class="card-img-top" alt="${escapeHtml(listing.title)}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200/EEEEEE/999999?text=No+Image'">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h6 class="card-title mb-0">${listing.title}</h6>
                                <small class="text-muted">${listing.address}</small>
                            </div>
                            <div class="text-end">
                                ${verifiedBadge}
                                <button class="favorite-btn ${isFav ? 'favorite-active' : ''}" title="Save to favorites" onclick="toggleFavorite(${listing.id})">
                                    <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
                                </button>
                            </div>
                        </div>

                        <p class="travel-time mb-1"><i class="bi bi-geo-alt me-1"></i>${listing.travelTime}</p>

                        <div class="d-flex align-items-center mb-2">
                            ${safetyBadge}
                            <span class="ms-2">⭐ ${listing.rating}/5</span>
                        </div>

                        <div class="price-container mb-2">
                            <div class="price">₹${listing.rent}/month</div>
                            ${roommates > 1 ? `<div class="split-price">₹${splitRent} per person with ${roommates} roommates</div>` : ''}
                        </div>

                        <div class="ai-explanation mb-3"><small><strong>Why this is recommended:</strong> ${listing.aiExplanation}</small></div>

                        <div class="mt-auto d-grid gap-2">
                            <button class="btn btn-outline-primary btn-sm"><i class="bi bi-images me-1"></i> View Photos</button>
                            <a class="btn btn-success btn-sm" target="_blank" rel="noopener"
                               href="https://wa.me/91${listing.contact || '1234567890'}?text=${encodeURIComponent('Hello! I am interested in ' + listing.title)}">
                               <i class="bi bi-whatsapp me-1"></i> Contact on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            `;
            listingsContainer.appendChild(listingCard);
        });

        displayFavorites();
    }

    function escapeHtml(s) { return s ? s.replaceAll('<','&lt;').replaceAll('>','&gt;') : s; }

    // Favorites
    window.toggleFavorite = function (listingId) {
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (favorites.includes(listingId)) favorites = favorites.filter(id => id !== listingId);
        else favorites.push(listingId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        if (resultsContainer.style.display === 'block') searchForm.requestSubmit();
        else displayFavorites();
    };

    function displayFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        favoritesContainer.innerHTML = '';
        if (favorites.length === 0) {
            favoritesContainer.innerHTML = '<small class="text-muted">No favorites yet. Click the ❤️ on any listing to save it.</small>';
            return;
        }
        const all = getAllMockListings();
        favorites.forEach(id => {
            const item = all.find(x => x.id === id);
            const badge = document.createElement('div');
            badge.className = 'p-2 bg-white rounded shadow-sm';
            badge.style.minWidth = '160px';
            badge.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <small class="text-muted">#${id}</small>
                        <div class="fw-semibold">${item ? item.title : 'Listing ' + id}</div>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-danger" onclick="toggleFavorite(${id})"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
            `;
            favoritesContainer.appendChild(badge);
        });
    }

    // Sorting
    function applySort(listings, sort) {
        if (!listings) return [];
        const copy = [...listings];
        if (sort === 'priceLowHigh') return copy.sort((a, b) => a.rent - b.rent);
        if (sort === 'priceHighLow') return copy.sort((a, b) => b.rent - a.rent);
        if (sort === 'safety') return copy.sort((a, b) => b.safetyScore - a.safetyScore);
        return copy.sort((a, b) => calculateRelevanceScore(b, parseInt(budgetSlider.value)) - calculateRelevanceScore(a, parseInt(budgetSlider.value)));
    }

    // Filter listings by budget, type, and location (city)
    function getMockListings(searchData) {
        const budget = parseInt(searchData.budget || 20000);
        const accommodationType = searchData.accommodationType || 'all';
        const location = searchData.location.toLowerCase();

        let listings = getAllMockListings();

        let filtered = listings.filter(l => {
            const matchesBudget = l.rent <= budget;
            const matchesType = (accommodationType === 'all' || l.accommodationType === accommodationType);
            const matchesLocation = !location || l.address.toLowerCase().includes(location) || l.city.toLowerCase().includes(location);
            return matchesBudget && matchesType && matchesLocation;
        });

        filtered.sort((a, b) => calculateRelevanceScore(b, budget) - calculateRelevanceScore(a, budget));
        return filtered.slice(0, 6);
    }

function getAllMockListings() {
    return [
        // ---- Chennai ----
        {
            id: 1,
            city: "Chennai",
            title: "Budget PG in Chennai",
            address: "Anna Nagar, Chennai",
            rent: 7000,
            accommodationType: "pg",
            travelTime: "10 mins to Anna University",
            rating: 4.1,
            safetyScore: 4.2,
            verified: true,
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60",
            logo: "https://cdn-icons-png.flaticon.com/512/809/809957.png",
            aiExplanation: "Affordable PG close to Anna University with good safety.",
            contact: "919876543210"
        },
        {
            id: 2,
            city: "Chennai",
            title: "Luxury 3BHK Flat",
            address: "Besant Nagar, Chennai",
            rent: 22000,
            accommodationType: "flat",
            travelTime: "5 mins to Marina Beach",
            rating: 4.6,
            safetyScore: 4.8,
            verified: true,
            image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=60",
            logo: "https://cdn-icons-png.flaticon.com/512/883/883407.png",
            aiExplanation: "Premium flat near the beach, ideal for professionals.",
            contact: "919876111222"
        },
        {
            id: 3,
            city: "Chennai",
            title: "Student Hostel",
            address: "Velachery, Chennai",
            rent: 5500,
            accommodationType: "hostel",
            travelTime: "15 mins to IIT Madras",
            rating: 3.8,
            safetyScore: 3.9,
            verified: true,
            image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=60",
            logo: "https://cdn-icons-png.flaticon.com/512/906/906334.png",
            aiExplanation: "Budget-friendly hostel option for IIT students.",
            contact: "919000111333"
        },
        {
            id: 4,
            city: "Chennai",
            title: "Affordable 1BHK",
            address: "T. Nagar, Chennai",
            rent: 12000,
            accommodationType: "flat",
            travelTime: "Near shopping hub",
            rating: 4.2,
            safetyScore: 4.4,
            verified: true,
            image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=60",
            logo: "https://cdn-icons-png.flaticon.com/512/883/883407.png",
            aiExplanation: "Affordable flat in central Chennai, great for small families.",
            contact: "919000222444"
        },

        // ---- Bengaluru ----
        {
            id: 5,
            city: "Bengaluru",
            title: "PG near Christ University",
            address: "Koramangala, Bengaluru",
            rent: 9000,
            accommodationType: "pg",
            travelTime: "Walking distance to Christ University",
            rating: 4.3,
            safetyScore: 4.5,
            verified: true,
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=60",
            logo: "https://cdn-icons-png.flaticon.com/512/809/809957.png",
            aiExplanation: "Close to Christ University, ideal for students.",
            contact: "917722334455"
        },
        {
            id: 6,
            city: "Bengaluru",
            title: "2BHK Flat in Whitefield",
            address: "Whitefield, Bengaluru",
            rent: 15000,
            accommodationType: "flat",
            travelTime: "Near IT Park",
            rating: 4.5,
            safetyScore: 4.7,
            verified: true,
            image: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=800&q=60",
            logo: "https://cdn-icons-png.flaticon.com/512/883/883407.png",
            aiExplanation: "Perfect flat for IT professionals near tech hub.",
            contact: "919000444555"
        },
        {
            id: 7,
            city: "Bengaluru",
            title: "Affordable Hostel",
            address: "Jayanagar, Bengaluru",
            rent: 6500,
            accommodationType: "hostel",
            travelTime: "10 mins to Metro",
            rating: 3.9,
            safetyScore: 4.0,
            verified: true,
            image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=60",
            logo: "https://cdn-icons-png.flaticon.com/512/906/906334.png",
            aiExplanation: "Budget hostel with metro connectivity.",
            contact: "919333555666"
        },
        {
            id: 8,
            city: "Bengaluru",
            title: "Luxury 3BHK Flat",
            address: "Indiranagar, Bengaluru",
            rent: 25000,
            accommodationType: "flat",
            travelTime: "Near MG Road",
            rating: 4.7,
            safetyScore: 4.9,
            verified: true,
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=60",
            logo: "https://cdn-icons-png.flaticon.com/512/883/883407.png",
            aiExplanation: "High-end flat near MG Road with premium amenities.",
            contact: "919444555777"
        },

        // ---- Delhi ----
        {
            id: 9,
            city: "Delhi",
            title: "Girls PG in Delhi",
            address: "Lajpat Nagar, Delhi",
            rent: 8000,
            accommodationType: "pg",
            travelTime: "Near LSR College",
            rating: 4.2,
            safetyScore: 4.4,
            verified: true,
            image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=60",
            logo: "https://cdn-icons-png.flaticon.com/512/809/809957.png",
            aiExplanation: "Safe PG for girls near popular colleges.",
            contact: "919888777111"
        },
        {
            id: 10,
            city: "Delhi",
            title: "Luxury Flat",
            address: "South Extension, Delhi",
            rent: 25000,
            accommodationType: "flat",
            travelTime: "Near Metro Station",
            rating: 4.7,
            safetyScore: 4.9,
            verified: true,
            image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=60",
            logo: "https://cdn-icons-png.flaticon.com/512/883/883407.png",
            aiExplanation: "Premium flat with metro access and high safety.",
            contact: "919333444555"
        },
        {
            id: 11,
            city: "Delhi",
            title: "Hostel near DU",
            address: "North Campus, Delhi",
            rent: 6000,
            accommodationType: "hostel",
            travelTime: "5 mins to Delhi University",
            rating: 3.7,
            safetyScore: 3.8,
            verified: true,
            image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=60",
            logo: "https://cdn-icons-png.flaticon.com/512/906/906334.png",
            aiExplanation: "Affordable hostel option near Delhi University.",
            contact: "919111222333"
        },
        {
            id: 12,
            city: "Delhi",
            title: "Affordable 1BHK Flat",
            address: "Dwarka, Delhi",
            rent: 12000,
            accommodationType: "flat",
            travelTime: "Near Airport Express",
            rating: 4.0,
            safetyScore: 4.2,
            verified: true,
            image: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=800&q=60",
            logo: "https://cdn-icons-png.flaticon.com/512/883/883407.png",
            aiExplanation: "Budget-friendly flat in Dwarka with metro access.",
            contact: "919555666777"
        }
    ];
}


    function calculateRelevanceScore(listing, budget) {
        budget = parseFloat(budget) || 20000;
        const priceFactor = 1 - (listing.rent / budget);
        const safetyFactor = listing.safetyScore / 5;
        const verificationFactor = listing.verified ? 1 : 0.5;
        return (priceFactor * 0.5) + (safetyFactor * 0.3) + (verificationFactor * 0.2);
    }

    // Load default listings on page load
    function loadAndDisplayDefault() {
        showSkeletons();
        resultsContainer.style.display = 'block';
        setTimeout(() => {
            const data = getAllMockListings().slice(0, 6);
            displayListings(data, 1);
            resultsCount.textContent = `${data.length} results`;
        }, 600);
    }
    loadAndDisplayDefault();

    // ✅ Show Owner section when button is clicked
    const openOwnerBtn = document.getElementById('openOwnerBtn');
    const ownerSection = document.getElementById('owner');
    openOwnerBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      ownerSection.style.display = 'block';
      ownerSection.scrollIntoView({ behavior: 'smooth' });
    });

});