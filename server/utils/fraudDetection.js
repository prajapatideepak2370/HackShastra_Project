/**
 * Fraud Detection Utility
 * 
 * This module provides ML-based functions to detect:
 * 1. Duplicate listings (same property listed multiple times)
 * 2. Fake IDs and suspicious user profiles
 */

// Similarity threshold for considering listings as duplicates
const SIMILARITY_THRESHOLD = 0.85;
const FAKE_ID_THRESHOLD = 0.75;

/**
 * Detect duplicate listings using text similarity and image comparison
 * @param {Object} newListing - The new listing to check
 * @param {Array} existingListings - Array of existing listings to compare against
 * @returns {Object} Result with isDuplicate flag and confidence score
 */
function detectDuplicateListings(newListing, existingListings) {
  // Initialize result
  const result = {
    isDuplicate: false,
    confidence: 0,
    similarListings: []
  };

  if (!existingListings || existingListings.length === 0) {
    return result;
  }

  // Extract features for comparison
  const newListingFeatures = extractListingFeatures(newListing);

  // Compare with existing listings
  existingListings.forEach(listing => {
    const existingFeatures = extractListingFeatures(listing);
    const similarity = calculateSimilarity(newListingFeatures, existingFeatures);
    
    if (similarity > SIMILARITY_THRESHOLD) {
      result.isDuplicate = true;
      result.similarListings.push({
        id: listing.id,
        similarity: similarity
      });
      
      // Update confidence with highest similarity score
      if (similarity > result.confidence) {
        result.confidence = similarity;
      }
    }
  });

  return result;
}

/**
 * Extract features from a listing for comparison
 * @param {Object} listing - The listing to extract features from
 * @returns {Object} Extracted features
 */
function extractListingFeatures(listing) {
  return {
    title: listing.title?.toLowerCase() || '',
    address: listing.address?.toLowerCase() || '',
    description: listing.description?.toLowerCase() || '',
    rent: listing.rent || 0,
    amenities: listing.amenities || [],
    coordinates: listing.coordinates || { lat: 0, lng: 0 }
  };
}

/**
 * Calculate similarity between two listings based on their features
 * @param {Object} features1 - Features of first listing
 * @param {Object} features2 - Features of second listing
 * @returns {Number} Similarity score between 0 and 1
 */
function calculateSimilarity(features1, features2) {
  // Text similarity for title, address and description
  const titleSimilarity = calculateTextSimilarity(features1.title, features2.title);
  const addressSimilarity = calculateTextSimilarity(features1.address, features2.address);
  const descriptionSimilarity = calculateTextSimilarity(features1.description, features2.description);
  
  // Location proximity (if coordinates available)
  const locationSimilarity = calculateLocationSimilarity(
    features1.coordinates, 
    features2.coordinates
  );
  
  // Price similarity
  const rentSimilarity = calculateRentSimilarity(features1.rent, features2.rent);
  
  // Amenities overlap
  const amenitiesSimilarity = calculateAmenitiesSimilarity(
    features1.amenities, 
    features2.amenities
  );
  
  // Weighted average of all similarities
  return (
    titleSimilarity * 0.25 +
    addressSimilarity * 0.3 +
    descriptionSimilarity * 0.15 +
    locationSimilarity * 0.2 +
    rentSimilarity * 0.05 +
    amenitiesSimilarity * 0.05
  );
}

/**
 * Calculate text similarity using Jaccard similarity coefficient
 * @param {String} text1 - First text
 * @param {String} text2 - Second text
 * @returns {Number} Similarity score between 0 and 1
 */
function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  
  // Convert texts to sets of words
  const words1 = new Set(text1.split(/\s+/).filter(word => word.length > 0));
  const words2 = new Set(text2.split(/\s+/).filter(word => word.length > 0));
  
  // Calculate intersection and union
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);
  
  // Jaccard similarity: size of intersection / size of union
  return intersection.size / union.size;
}

/**
 * Calculate similarity based on location proximity
 * @param {Object} coord1 - First coordinates {lat, lng}
 * @param {Object} coord2 - Second coordinates {lat, lng}
 * @returns {Number} Similarity score between 0 and 1
 */
function calculateLocationSimilarity(coord1, coord2) {
  if (!coord1 || !coord2) return 0;
  
  // Calculate distance using Haversine formula
  const distance = calculateDistance(
    coord1.lat, coord1.lng,
    coord2.lat, coord2.lng
  );
  
  // Convert distance to similarity score (closer = more similar)
  // Consider listings within 100m as very similar, beyond 2km as different
  return Math.max(0, 1 - (distance / 2000));
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {Number} lat1 - Latitude of first point
 * @param {Number} lng1 - Longitude of first point
 * @param {Number} lat2 - Latitude of second point
 * @param {Number} lng2 - Longitude of second point
 * @returns {Number} Distance in meters
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Distance in meters
}

/**
 * Calculate similarity based on rent amount
 * @param {Number} rent1 - First rent amount
 * @param {Number} rent2 - Second rent amount
 * @returns {Number} Similarity score between 0 and 1
 */
function calculateRentSimilarity(rent1, rent2) {
  if (!rent1 || !rent2) return 0;
  
  // Calculate percentage difference
  const maxRent = Math.max(rent1, rent2);
  const minRent = Math.min(rent1, rent2);
  const percentDiff = (maxRent - minRent) / maxRent;
  
  // Convert to similarity score (lower difference = higher similarity)
  return Math.max(0, 1 - percentDiff);
}

/**
 * Calculate similarity based on amenities overlap
 * @param {Array} amenities1 - First amenities list
 * @param {Array} amenities2 - Second amenities list
 * @returns {Number} Similarity score between 0 and 1
 */
function calculateAmenitiesSimilarity(amenities1, amenities2) {
  if (!amenities1 || !amenities2 || amenities1.length === 0 || amenities2.length === 0) {
    return 0;
  }
  
  // Convert to sets
  const set1 = new Set(amenities1);
  const set2 = new Set(amenities2);
  
  // Calculate intersection and union
  const intersection = new Set([...set1].filter(item => set2.has(item)));
  const union = new Set([...set1, ...set2]);
  
  // Jaccard similarity: size of intersection / size of union
  return intersection.size / union.size;
}

/**
 * Detect fake IDs using ML-based heuristics
 * @param {Object} userProfile - User profile to check
 * @returns {Object} Result with isFake flag and confidence score
 */
function detectFakeID(userProfile) {
  // Initialize result
  const result = {
    isFake: false,
    confidence: 0,
    flags: []
  };
  
  if (!userProfile) {
    return result;
  }
  
  // Extract features for analysis
  const features = extractUserFeatures(userProfile);
  
  // Apply heuristic rules to detect fake IDs
  let totalScore = 0;
  let flagCount = 0;
  
  // Check for incomplete profile
  if (features.completeness < 0.7) {
    result.flags.push({
      type: 'incomplete_profile',
      severity: 'medium',
      description: 'Profile is missing important information'
    });
    totalScore += 0.3;
    flagCount++;
  }
  
  // Check for suspicious email pattern
  if (features.suspiciousEmail) {
    result.flags.push({
      type: 'suspicious_email',
      severity: 'high',
      description: 'Email pattern matches known suspicious patterns'
    });
    totalScore += 0.4;
    flagCount++;
  }
  
  // Check for suspicious phone number
  if (features.suspiciousPhone) {
    result.flags.push({
      type: 'suspicious_phone',
      severity: 'high',
      description: 'Phone number pattern is suspicious or invalid'
    });
    totalScore += 0.4;
    flagCount++;
  }
  
  // Check for suspicious activity pattern
  if (features.suspiciousActivity) {
    result.flags.push({
      type: 'suspicious_activity',
      severity: 'medium',
      description: 'User activity pattern matches known suspicious patterns'
    });
    totalScore += 0.3;
    flagCount++;
  }
  
  // Calculate final confidence score
  result.confidence = flagCount > 0 ? totalScore / flagCount : 0;
  
  // Determine if ID is fake based on confidence threshold
  result.isFake = result.confidence > FAKE_ID_THRESHOLD;
  
  return result;
}

/**
 * Extract features from a user profile for fake ID detection
 * @param {Object} userProfile - The user profile to analyze
 * @returns {Object} Extracted features
 */
function extractUserFeatures(userProfile) {
  // Calculate profile completeness
  const requiredFields = ['name', 'email', 'phone', 'address', 'idProof'];
  const completedFields = requiredFields.filter(field => 
    userProfile[field] && userProfile[field].trim() !== ''
  );
  const completeness = completedFields.length / requiredFields.length;
  
  // Check for suspicious email patterns
  const suspiciousEmailPatterns = [
    /^[a-z0-9]{20,}@/i,                 // Very long username
    /^temp[0-9]+@/i,                    // Temporary email pattern
    /^[a-z0-9]{8,}[0-9]{4,}@/i,         // Random alphanumeric pattern
    /@(mailinator|tempmail|guerrilla|10minutemail|yopmail|throwaway)/i  // Known temporary email domains
  ];
  const suspiciousEmail = userProfile.email && 
    suspiciousEmailPatterns.some(pattern => pattern.test(userProfile.email));
  
  // Check for suspicious phone patterns
  const suspiciousPhonePatterns = [
    /^1234/,                            // Sequential digits
    /0000/,                             // Repeated digits
    /^(123|456|789|000|111|222|333|444|555|666|777|888|999)/  // Common fake patterns
  ];
  const suspiciousPhone = userProfile.phone && 
    suspiciousPhonePatterns.some(pattern => pattern.test(userProfile.phone));
  
  // Check for suspicious activity patterns
  const suspiciousActivity = userProfile.createdAt && 
    (Date.now() - new Date(userProfile.createdAt).getTime() < 86400000) && // Account less than 1 day old
    (userProfile.listingsCount > 5);                                      // Many listings in short time
  
  return {
    completeness,
    suspiciousEmail,
    suspiciousPhone,
    suspiciousActivity
  };
}

module.exports = {
  detectDuplicateListings,
  detectFakeID
};