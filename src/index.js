//Import the package
const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();

// Define the instance of Express server
app.use(express.json());

// Define the limiters
// Limit to 5 /weather requests per minute per IP.
const weatherLimiter = rateLimit({
    windowMS: 60 * 1000,
    limit: 5,
    message: {error: "Too many weather requests, cool down!"}
});

// Apply limiter to all request routes
app.use(weatherLimiter);

// Routes
app.get("/", (request, response) => {
    response.json({
        "message": "Hello World!"
    });
});

validateCoords = (request, response, next) => {
    const {latitude, longitude} = request.body;
    if (typeof latitude !== "number" || 
        typeof longitude !== "number" || 
        latitude < -90 || latitude > 90 ||
        longitude < -180 || longitude > 180) {
            return response.status(400).json({
                "error": "Invalid or missing co-ordinates."
            });
    }

    next();
}

function blockAntartica(request, response, next) {
    const {latitude} = request.body;
    if (latitude < -89) {
        return response.status(403).json({
            "error": "Sorry, no weather for Antartica"
        });
    }

    next();
}

dummyAuth = (request, response, next) => {
    // For demo, simulate the authenticated users only
    const authenticated = false;
    if (!authenticated) {
        return response.status(401).json({
            "error": "You must be logged in!"
        });
    }

    next();
}

checkAdminRole = (request, response, next) => {
    // For demo, simulate getting admin check from the token/header
    const user = {isAdmin: true};
    if (!user || !user.isAdmin) {
        response.status(403).json({
            "error": "Admins only."
        });
    }

    next();
}

app.post("/weather", dummyAuth, blockAntartica, validateCoords, async (request, response) => {
    const {latitude, longitude} = request.body;
    try {
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);

        const data = await weatherResponse.json();
        if (!response.ok) {
            // Pass API fetch error to error middleware
            throw new Error(data.error || "Failed to fetch weather data");
        }
        
        response.json({
            location: {latitude, longitude},
            current:data.current_weather,
            units: data.current_weather_units
        });
    }
    catch (error) {
        /*response.json({
            "message": "An error occured",
            "data": error
        });*/
        next(error);
    }

    next();
});

// Logger middleware
app.use((request, response, next) => {
    console.log(`[WEATHER] ${request.method} ${request.url} at ${new Date().toISOString()}`);
    next();
});

app.use((error, request, response, next) => {
    console.log("[WEATHER ERROR: ", error.stack);
    response.status(500).json({
        "error": "Whoops! Something broke with the weather!"
    });
});

//Export the app instance to server.js
module.exports = app;