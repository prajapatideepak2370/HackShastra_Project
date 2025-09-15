# SafeStay - Accommodation Finder

SafeStay is a prototype application that helps students find safe and affordable accommodation near their college or workplace.

## Features

- User input form for budget, location, and preferences
- AI-powered smart matching algorithm
- Google Maps integration for distance and travel time calculation
- Fraud detection system
- Rent split calculator
- Safety tags and verification badges

## Project Structure

```
safestay/
├── client/               # Frontend (React.js)
│   ├── index.html        # Main HTML file
│   ├── styles.css        # CSS styles
│   └── app.js            # JavaScript functionality
│
└── server/               # Backend (Node.js)
    ├── models/           # MongoDB models
    ├── routes/           # API routes
    ├── utils/            # Utility functions
    ├── package.json      # Dependencies
    └── server.js         # Main server file
```

## How to Run

### Frontend

1. Open the `client/index.html` file in a web browser

### Backend (Optional for full functionality)

1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Start the server: `npm start`

## Demo Flow

1. Enter budget ₹8000, location "Delhi University"
2. Select accommodation type (Flat/PG/Hostel)
3. Select room type (Single/Sharing)
4. If sharing, select number of roommates
5. Click "Find Accommodations"
6. View top recommendations with:
   - Rent and deposit information
   - Travel time from your location
   - Safety score and verification status
   - Rent split calculation (if sharing)
   - AI-generated explanation

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB (simulated)
- APIs: Google Maps (simulated), OpenAI (simulated)

## Note

This is a prototype version with simulated data and API responses for demonstration purposes.