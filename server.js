const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Load IPs from a file or initialize an empty array
let ipData = [];
if (fs.existsSync('ips.json')) {
    ipData = JSON.parse(fs.readFileSync('ips.json', 'utf-8'));
}

// Function to check if IP exists
const hasRecentView = (ip) => {
    const existingIP = ipData.find(entry => entry.ip === ip);
    // Check if IP exists in the last 24 hours
    if (existingIP) {
        const now = new Date();
        const diff = (now - new Date(existingIP.timestamp)) / (1000 * 60 * 60); // Hours difference
        return diff < 24; // Return true if within the last 24 hours
    }
    return false;
}

// Middleware to count views
app.get('/view', (req, res) => {
    const userIP = req.ip; // Get the user's IP address

    // Check if IP has visited recently
    if (!hasRecentView(userIP)) {
        // Increment view count
        let viewCount = fs.existsSync('viewCount.txt') ? parseInt(fs.readFileSync('viewCount.txt', 'utf-8')) : 0;
        viewCount += 1;
        fs.writeFileSync('viewCount.txt', viewCount.toString());

        // Store IP and timestamp
        ipData.push({ ip: userIP, timestamp: new Date() });
        fs.writeFileSync('ips.json', JSON.stringify(ipData));
    }

    // Send view count to client
    res.json({ viewCount: fs.readFileSync('viewCount.txt', 'utf-8') });
});

// Serve static files (like images, fonts, etc.)
app.use(express.static(path.join(__dirname)));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
