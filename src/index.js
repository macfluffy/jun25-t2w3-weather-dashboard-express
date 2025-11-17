//Import the package
const express = require("express");

// Define the isntance of Express server
const app = express();
app.use(express.json());

// Logger middleware
app.use((request, response, next) => {
    console.log(`[WEATHER] ${request.method} ${request.url} at ${new Date().toISOString()}`);
    next();
});

app.get("/", (request, response) => {
    response.json({
        "message": "Hello World!"
    });
});

//Export the app instance to server.js
module.exports = {app};