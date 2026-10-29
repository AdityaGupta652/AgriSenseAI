const express = require('express');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Open-Meteo API - Completely free, no API key required!
// Free weather data with excellent global coverage
const WEATHER_API_BASE = 'https://api.open-meteo.com/v1';

// ─── Live Weather Cache ──────────────────────────────────────────────────────
let weatherCache = {}; // { location: { data, timestamp } }
let connectedClients = new Map(); // Track connected clients and their locations

// ─── Geocoding Helper - Get coordinates from location name ──────────────────
async function getCoordinates(location) {
    try {
        // Try the location as-is first
        let response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
            params: {
                name: location,
                count: 1,
                language: 'en',
                format: 'json'
            }
        });
        
        if (response.data.results && response.data.results.length > 0) {
            const result = response.data.results[0];
            console.log(`✅ Geocoding found: ${location} -> ${result.name}, ${result.country}`);
            return {
                lat: result.latitude,
                lon: result.longitude,
                name: result.name,
                country: result.country
            };
        }
        
        // If not found, try just the first word (e.g., "Karnataka" from "Karnataka, india")
        const firstPart = location.split(',')[0].trim();
        if (firstPart !== location) {
            console.warn(`Location not found "${location}", trying "${firstPart}"`);
            response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
                params: {
                    name: firstPart,
                    count: 1,
                    language: 'en',
                    format: 'json'
                }
            });
            
            if (response.data.results && response.data.results.length > 0) {
                const result = response.data.results[0];
                console.log(`✅ Geocoding found: ${firstPart} -> ${result.name}, ${result.country}`);
                return {
                    lat: result.latitude,
                    lon: result.longitude,
                    name: result.name,
                    country: result.country
                };
            }
        }
        
        throw new Error(`Location not found: ${location}`);
    } catch (error) {
        console.error(`❌ Geocoding error for "${location}": ${error.message}`);
        // Fallback to default India location
        console.warn(`⚠️ Using default location: Bangalore, India`);
        return {
            lat: 12.9716,
            lon: 77.5946,
            name: 'Bangalore',
            country: 'India'
        };
    }
}

// ─── Fetch Weather from Open-Meteo (Free API) ─────────────────────────────────
async function fetchOpenMeteoWeather(location) {
    const coords = await getCoordinates(location);
    
    try {
        console.log(`📡 Fetching weather for coordinates: lat=${coords.lat}, lon=${coords.lon}`);
        // Simplified API call - just current weather to start
        const response = await axios.get(`${WEATHER_API_BASE}/forecast`, {
            params: {
                latitude: coords.lat,
                longitude: coords.lon,
                current: 'temperature_2m,weather_code,wind_speed_10m',
                daily: 'weather_code,temperature_2m_max',
                temperature_unit: 'celsius',
                wind_speed_unit: 'kmh'
            },
            timeout: 10000
        });
        
        console.log(`✅ Weather API response received`);
        return formatOpenMeteoData(response.data, coords);
    } catch (error) {
        console.error(`❌ Weather fetch error for ${location}:`, error.message);
        if (error.response) {
            console.error(`API Response Status: ${error.response.status}`);
            console.error(`API Response Data:`, error.response.data);
        }
        throw error;
    }
}

// ─── Format Open-Meteo response to our format ────────────────────────────────
function formatOpenMeteoData(apiData, coords) {
    const current = apiData.current || {};
    const daily = apiData.daily || {};
    
    // Provide defaults for missing fields
    current.humidity_2m = current.humidity_2m || 65;
    current.wind_speed_10m = current.wind_speed_10m || 10;
    
    // WMO Weather code interpretation
    const getWeatherCondition = (code) => {
        if (code === 0 || code === 1) return 'Clear';
        if (code === 2) return 'Partly Cloudy';
        if (code === 3) return 'Cloudy';
        if (code === 45 || code === 48) return 'Foggy';
        if (code === 51 || code === 53 || code === 55) return 'Light Rain';
        if (code === 61 || code === 63 || code === 65) return 'Rainy';
        if (code === 71 || code === 73 || code === 75 || code === 77) return 'Snow';
        if (code === 80 || code === 81 || code === 82) return 'Heavy Rain';
        if (code === 85 || code === 86) return 'Snow';
        if (code === 95 || code === 96 || code === 99) return 'Thunderstorm';
        return 'Unknown';
    };
    
    const currentCondition = getWeatherCondition(current.weather_code);
    
    // Process 7-day forecast
    const forecast = [];
    for (let i = 0; i < (daily.time ? daily.time.length : 7); i++) {
        const date = new Date(daily.time ? daily.time[i] : new Date().getTime() + i * 86400000);
        const dayNum = date.getDay();
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        const condition = getWeatherCondition(daily.weather_code ? daily.weather_code[i] : 0);
        const maxTemp = daily.temperature_2m_max ? daily.temperature_2m_max[i] : 25;
        const precipitation = daily.precipitation_sum ? (daily.precipitation_sum[i] || 0) : 0;
        const windSpeed = daily.wind_speed_10m_max ? daily.wind_speed_10m_max[i] : 15;
        const humidity = daily.relative_humidity_2m_max ? daily.relative_humidity_2m_max[i] : 70;
        
        // Determine severity
        let severity = 'normal';
        if (condition.includes('Thunderstorm') || condition.includes('Heavy Rain')) {
            severity = 'critical';
        } else if (maxTemp > 35 || precipitation > 30 || windSpeed > 40) {
            severity = 'warning';
        }
        
        forecast.push({
            date: daily.time ? daily.time[i] : date.toISOString().split('T')[0],
            day: dayNames[dayNum],
            temp: Math.round(maxTemp),
            humidity: humidity,
            windSpeed: Math.round(windSpeed),
            precipitation: Math.round(precipitation * 10) / 10,
            condition,
            severity
        });
    }
    
    // Generate alerts
    const alerts = [];
    for (let i = 1; i < forecast.length; i++) {
        const day = forecast[i];
        if (day.severity !== 'normal') {
            const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' });
            
            if (day.precipitation > 30) {
                alerts.push({
                    date: day.date,
                    message: `Heavy rainfall predicted on ${dayName} - ${day.precipitation}mm expected`,
                    severity: 'critical',
                    icon: '🌧️'
                });
            }
            
            if (day.condition.includes('Thunderstorm')) {
                alerts.push({
                    date: day.date,
                    message: `Severe thunderstorm warning for ${dayName}`,
                    severity: 'critical',
                    icon: '⛈️'
                });
            }
            
            if (day.temp > 38) {
                alerts.push({
                    date: day.date,
                    message: `Extreme heat warning on ${dayName} - ${day.temp}°C`,
                    severity: 'critical',
                    icon: '🔥'
                });
            }
            
            if (day.windSpeed > 40) {
                alerts.push({
                    date: day.date,
                    message: `Strong wind warning on ${dayName} - ${day.windSpeed} km/h`,
                    severity: 'warning',
                    icon: '💨'
                });
            }
        }
    }
    
    return {
        location: `${coords.name}, ${coords.country}`,
        coordinates: { lat: coords.lat, lon: coords.lon },
        current: {
            temp: Math.round(current.temperature_2m),
            condition: currentCondition,
            humidity: current.humidity_2m,
            windSpeed: Math.round(current.wind_speed_10m),
        },
        forecast,
        alerts,
        lastUpdated: new Date().toISOString(),
    };
}

// ─── User Store (In-memory) ──────────────────────────────────────────────────
let users = {}; // { email: { name, location, email, password } }

// ─── WebSocket Connection Handler ────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`📡 Client connected: ${socket.id}`);

    // Client subscribes to weather updates for a location
    socket.on('subscribe-weather', async (location) => {
        console.log(`📍 ${socket.id} subscribed to weather for: ${location}`);
        connectedClients.set(socket.id, location);
        socket.join(`weather-${location}`);

        try {
            // Always fetch fresh data on subscription
            console.log(`🔄 Fetching fresh weather for: ${location}`);
            const weatherData = await fetchOpenMeteoWeather(location);
            weatherCache[location] = { data: weatherData, timestamp: Date.now() };
            
            console.log(`📤 Sending weather-update to ${socket.id}`);
            socket.emit('weather-update', weatherData);
            console.log(`✅ weather-update sent successfully`);
        } catch (error) {
            console.error(`❌ Error getting weather: ${error.message}`);
            // Fallback to mock data if API fails
            const mockData = generateMockWeatherData(location);
            weatherCache[location] = { data: mockData, timestamp: Date.now() };
            
            console.log(`📤 Sending mock weather-update to ${socket.id}`);
            socket.emit('weather-update', mockData);
            console.log(`✅ mock weather-update sent successfully`);
        }
    });
    socket.on('unsubscribe-weather', () => {
        const location = connectedClients.get(socket.id);
        if (location) {
            socket.leave(`weather-${location}`);
            connectedClients.delete(socket.id);
            console.log(`📍 ${socket.id} unsubscribed from weather`);
        }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
        connectedClients.delete(socket.id);
        console.log(`📡 Client disconnected: ${socket.id}`);
    });
});

// ─── Live Update Broadcaster ─────────────────────────────────────────────────
// Periodically refresh weather for all subscribed locations
setInterval(async () => {
    const uniqueLocations = new Set(connectedClients.values());
    
    for (const location of uniqueLocations) {
        try {
            const weatherData = await fetchOpenMeteoWeather(location);
            weatherCache[location] = { data: weatherData, timestamp: Date.now() };
            console.log(`📡 Broadcasting weather update for ${location}`);
            
            // Broadcast to all clients subscribed to this location
            io.to(`weather-${location}`).emit('weather-update', weatherData);
        } catch (error) {
            console.warn(`⚠️ Weather API unavailable for ${location}, using cached/mock data`);
            const mockData = generateMockWeatherData(location);
            weatherCache[location] = { data: mockData, timestamp: Date.now() };
            io.to(`weather-${location}`).emit('weather-update', mockData);
        }
    }
}, 3600000); // Update every 1 hour (3600000 ms)
const cropProfiles = {
    Wheat: {
        moisture: { min: 40, max: 60, opt: 50 },
        temp: { min: 15, max: 25, opt: 20 },
        ph: { min: 6.0, max: 7.0, opt: 6.5 },
        n: { min: 60, max: 100, opt: 80 },
        p: { min: 30, max: 50, opt: 40 },
        k: { min: 100, max: 150, opt: 125 }
    },
    Rice: {
        moisture: { min: 70, max: 90, opt: 80 },
        temp: { min: 20, max: 35, opt: 28 },
        ph: { min: 5.5, max: 6.5, opt: 6.0 },
        n: { min: 80, max: 120, opt: 100 },
        p: { min: 40, max: 60, opt: 50 },
        k: { min: 150, max: 200, opt: 175 }
    },
    Corn: {
        moisture: { min: 50, max: 70, opt: 60 },
        temp: { min: 18, max: 30, opt: 25 },
        ph: { min: 5.8, max: 7.0, opt: 6.4 },
        n: { min: 100, max: 150, opt: 125 },
        p: { min: 40, max: 70, opt: 55 },
        k: { min: 100, max: 160, opt: 130 }
    },
    Cotton: {
        moisture: { min: 40, max: 55, opt: 45 },
        temp: { min: 25, max: 35, opt: 30 },
        ph: { min: 5.8, max: 8.0, opt: 6.5 },
        n: { min: 80, max: 130, opt: 100 },
        p: { min: 30, max: 60, opt: 45 },
        k: { min: 90, max: 150, opt: 120 }
    },
    Sugarcane: {
        moisture: { min: 60, max: 80, opt: 70 },
        temp: { min: 20, max: 35, opt: 30 },
        ph: { min: 6.0, max: 7.5, opt: 6.5 },
        n: { min: 120, max: 200, opt: 150 },
        p: { min: 50, max: 80, opt: 65 },
        k: { min: 150, max: 250, opt: 200 }
    }
};

let currentCrop = 'Wheat';

// ─── In-memory data store ────────────────────────────────────────────────────
const MAX_HISTORY = 24;
let sensorHistory = [];
let currentReading = generateReading();
sensorHistory.push({ ...currentReading, timestamp: new Date().toISOString() });

// ─── Helper: Generate a realistic sensor reading ──────────────────────────────
function generateReading(opts = {}) {
    const prof = cropProfiles[currentCrop] || cropProfiles['Wheat'];

    // Generate values close to crop's optimal with some realistic noise
    const varMoisture = rand(-15, 15);
    const varTemp = rand(-8, 8);
    const varPh = parseFloat((Math.random() * 1.5 - 0.75).toFixed(1));
    const varN = rand(-30, 30);
    const varP = rand(-15, 15);
    const varK = rand(-40, 40);

    const soilMoisture = opts.soilMoisture ?? Math.max(0, Math.min(100, prof.moisture.opt + varMoisture));
    const temperature = opts.temperature ?? Math.max(0, prof.temp.opt + varTemp);
    const ph = opts.ph ?? parseFloat(Math.max(0, prof.ph.opt + varPh).toFixed(1));
    const humidity = rand(30, 90);
    const n = opts.n ?? Math.max(0, prof.n.opt + varN);
    const p = opts.p ?? Math.max(0, prof.p.opt + varP);
    const k = opts.k ?? Math.max(0, prof.k.opt + varK);

    const { cropHealth, pestRisk, recommendation } = predict(soilMoisture, temperature, ph, humidity, n, p, k);

    return { soilMoisture, temperature, ph, humidity, n, p, k, cropHealth, pestRisk, recommendation };
}

function rand(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

// ─── Rule-based AI engine ─────────────────────────────────────────────────────
function predict(soilMoisture, temperature, ph, humidity = 60, n = 80, p = 40, k = 150) {
    const prof = cropProfiles[currentCrop] || cropProfiles['Wheat'];
    let cropHealth = 100;
    let pestRiskScore = 0;
    const recs = [];

    // Moisture rules
    if (soilMoisture < prof.moisture.min - 10) {
        cropHealth -= 40;
        pestRiskScore += 1;
        recs.push('Irrigate immediately — critical moisture deficit');
    } else if (soilMoisture < prof.moisture.min) {
        cropHealth -= 20;
        recs.push(`Increase irrigation lightly for ${currentCrop}`);
    } else if (soilMoisture > prof.moisture.max + 10) {
        cropHealth -= 20;
        recs.push(`Reduce irrigation — risk of root rot for ${currentCrop}`);
    }

    // Temperature rules
    if (temperature > prof.temp.max + 5) {
        cropHealth -= 30;
        pestRiskScore += 2;
        recs.push('Severe heat stress — consider shade nets');
    } else if (temperature > prof.temp.max) {
        cropHealth -= 15;
        pestRiskScore += 1;
        recs.push('High temperature — monitor for pest activity');
    } else if (temperature < prof.temp.min - 5) {
        cropHealth -= 20;
        recs.push('Cold stress detected — protect crops from frost');
    }

    // NPK rules
    if (n < prof.n.min) {
        cropHealth -= 15;
        recs.push(`Low Nitrogen for ${currentCrop} detected — apply appropriate fertilizers`);
    } else if (n > prof.n.max) {
        cropHealth -= 10;
        recs.push('High Nitrogen levels — risk of nutrient burn');
    }

    if (p < prof.p.min) {
        cropHealth -= 15;
        recs.push(`Low Phosphorus for ${currentCrop} detected — apply appropriate fertilizers`);
    } else if (p > prof.p.max) {
        cropHealth -= 10;
        recs.push('High Phosphorus levels — risk of nutrient block');
    }

    if (k < prof.k.min) {
        cropHealth -= 15;
        recs.push(`Low Potassium for ${currentCrop} detected — apply appropriate fertilizers`);
    } else if (k > prof.k.max) {
        cropHealth -= 10;
        recs.push('High Potassium levels — risk of nutrient burn');
    }

    // pH rules
    if (ph < prof.ph.min - 0.5 || ph > prof.ph.max + 0.5) {
        cropHealth -= 25;
        recs.push(`Soil pH is out of optimal range (${prof.ph.min}–${prof.ph.max}) — apply corrective nutrients`);
    } else if (ph < prof.ph.min || ph > prof.ph.max) {
        cropHealth -= 10;
        recs.push('Marginally suboptimal pH — consider lime/sulfur treatment');
    }

    // Humidity + temperature combo for pests
    if (humidity > 70 && temperature > 30) {
        pestRiskScore += 1;
        recs.push('High humidity + temperature — high chance of fungal/pest attack');
    }

    cropHealth = Math.max(0, Math.min(100, Math.round(cropHealth)));

    let pestRisk;
    if (pestRiskScore >= 3) pestRisk = 'High';
    else if (pestRiskScore >= 1) pestRisk = 'Medium';
    else pestRisk = 'Low';

    const uniqueRecs = [...new Set(recs)];
    const recommendation = uniqueRecs.length > 0 ? uniqueRecs.join('. ') + '.' : 'Crop conditions are optimal. Continue regular monitoring.';

    return { cropHealth, pestRisk, recommendation };
}

// ─── Alerts generator ─────────────────────────────────────────────────────────
function generateAlerts(reading) {
    const alerts = [];
    const prof = cropProfiles[currentCrop] || cropProfiles['Wheat'];
    const { soilMoisture, temperature, ph, pestRisk, humidity } = reading;

    if (soilMoisture < prof.moisture.min - 10)
        alerts.push({ id: 1, message: '🚨 Critical: Soil moisture dangerously low!', severity: 'critical', time: new Date().toISOString() });
    else if (soilMoisture < prof.moisture.min)
        alerts.push({ id: 2, message: '⚠️ Low Soil Moisture detected', severity: 'warning', time: new Date().toISOString() });

    if (temperature > prof.temp.max + 5)
        alerts.push({ id: 3, message: '🔥 Critical: Extreme temperature alert!', severity: 'critical', time: new Date().toISOString() });
    else if (temperature > prof.temp.max)
        alerts.push({ id: 4, message: '⚠️ High Temperature — heat stress risk', severity: 'warning', time: new Date().toISOString() });

    if (ph < prof.ph.min - 0.5 || ph > prof.ph.max + 0.5)
        alerts.push({ id: 5, message: '⚠️ Soil pH critically out of range', severity: 'critical', time: new Date().toISOString() });
    else if (ph < prof.ph.min || ph > prof.ph.max)
        alerts.push({ id: 6, message: '⚠️ Suboptimal Soil pH level', severity: 'warning', time: new Date().toISOString() });

    if (pestRisk === 'High')
        alerts.push({ id: 7, message: '🐛 High Pest Risk Detected — take action!', severity: 'critical', time: new Date().toISOString() });
    else if (pestRisk === 'Medium')
        alerts.push({ id: 8, message: '🐛 Medium Pest Risk — monitor closely', severity: 'warning', time: new Date().toISOString() });

    if (humidity > 85)
        alerts.push({ id: 9, message: '💧 Very high humidity — fungal risk elevated', severity: 'warning', time: new Date().toISOString() });

    if (alerts.length === 0)
        alerts.push({ id: 0, message: '✅ All systems normal — no alerts', severity: 'info', time: new Date().toISOString() });

    return alerts;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/sensor-data
app.get('/api/sensor-data', (req, res) => {
    res.json({
        currentCrop,
        current: currentReading,
        history: sensorHistory,
    });
});

// POST /api/crop
app.post('/api/crop', (req, res) => {
    const { crop } = req.body;
    if (cropProfiles[crop]) {
        currentCrop = crop;
        // Wipe historical data on switch!
        sensorHistory = [];
        currentReading = generateReading();
        sensorHistory.push({ ...currentReading, timestamp: new Date().toISOString() });
        res.json({ message: 'Crop switch successful', currentCrop, current: currentReading, history: sensorHistory });
    } else {
        res.status(400).json({ error: 'Unsupported crop type selected.' });
    }
});

// POST /api/simulate
app.post('/api/simulate', (req, res) => {
    currentReading = generateReading();
    const entry = { ...currentReading, timestamp: new Date().toISOString() };
    sensorHistory.push(entry);
    if (sensorHistory.length > MAX_HISTORY) sensorHistory.shift();

    res.json({
        message: 'Simulated data generated successfully',
        currentCrop,
        current: currentReading,
        history: sensorHistory,
    });
});

// POST /api/predict
app.post('/api/predict', (req, res) => {
    const { soilMoisture, temperature, ph, humidity, n, p, k } = req.body;

    if (soilMoisture == null || temperature == null || ph == null) {
        return res.status(400).json({ error: 'soilMoisture, temperature, and ph are required' });
    }

    const result = predict(
        Number(soilMoisture),
        Number(temperature),
        Number(ph),
        humidity != null ? Number(humidity) : 60,
        n != null ? Number(n) : 80,
        p != null ? Number(p) : 40,
        k != null ? Number(k) : 150
    );

    res.json(result);
});

// GET /api/alerts
app.get('/api/alerts', (req, res) => {
    const alerts = generateAlerts(currentReading);
    res.json({ alerts });
});

// GET /api/weather - Fetch weather data for user's location
app.get('/api/weather', async (req, res) => {
    try {
        const location = req.query.location || 'India';
        
        // Fetch from Open-Meteo (free, no API key)
        const weatherData = await fetchOpenMeteoWeather(location);
        res.json(weatherData);
    } catch (error) {
        console.warn('Weather fetch error:', error.message);
        // Fallback to mock data if API fails
        const fallbackLocation = req.query.location || 'India';
        res.json(generateMockWeatherData(fallbackLocation));
    }
});

// Fallback mock weather generator
function generateMockWeatherData(location) {
    // Mock location coordinates and weather patterns
    const locationData = {
        'maharashtra': { lat: 19.7515, lon: 75.7139, avgTemp: 28, region: 'West' },
        'bihar': { lat: 25.0961, lon: 85.3131, avgTemp: 26, region: 'East' },
        'punjab': { lat: 31.1471, lon: 77.1670, avgTemp: 24, region: 'North' },
        'karnataka': { lat: 15.3173, lon: 75.7139, avgTemp: 27, region: 'South' },
        'tamil nadu': { lat: 11.1271, lon: 78.6569, avgTemp: 28, region: 'South' },
        'uttar pradesh': { lat: 27.1767, lon: 78.0081, avgTemp: 26, region: 'North' },
    };
    
    const loc = locationData[location.toLowerCase()] || { lat: 20, lon: 78, avgTemp: 27, region: 'Central' };
    
    // Generate realistic weather conditions
    const now = new Date();
    const nextDays = [];
    const alerts = [];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() + i);
        
        // Simulate weather patterns
        const baseTemp = loc.avgTemp + Math.sin(i / 7 * Math.PI) * 8;
        const temp = baseTemp + (Math.random() - 0.5) * 6;
        const humidity = 50 + Math.random() * 40;
        const windSpeed = 5 + Math.random() * 20;
        
        // Random chance of rain
        const rainChance = Math.random() * 100;
        const precipitation = rainChance > 70 ? Math.random() * 50 : 0;
        
        // Determine conditions
        let condition = 'Clear';
        let severity = 'normal';
        
        if (precipitation > 30) {
            condition = 'Heavy Rain';
            severity = 'critical';
        } else if (precipitation > 10) {
            condition = 'Rainy';
            severity = 'warning';
        } else if (humidity > 80 && windSpeed > 15) {
            condition = 'Stormy';
            severity = 'critical';
        } else if (temp > 35) {
            condition = 'Very Hot';
            severity = 'warning';
        } else if (windSpeed > 25) {
            condition = 'Windy';
            severity = 'warning';
        }
        
        const dayData = {
            date: date.toISOString().split('T')[0],
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            temp: Math.round(temp),
            humidity: Math.round(humidity),
            windSpeed: Math.round(windSpeed),
            precipitation: Math.round(precipitation * 10) / 10,
            condition,
            severity,
        };
        
        nextDays.push(dayData);
        
        // Generate alerts for bad weather
        if (i > 0 && severity !== 'normal') {
            alerts.push({
                date: dayData.date,
                message: `${dayData.condition} predicted on ${dayData.day}`,
                severity,
                icon: condition === 'Heavy Rain' ? '🌧️' : condition === 'Stormy' ? '⛈️' : condition === 'Very Hot' ? '🔥' : '💨'
            });
        }
    }
    
    return {
        location: location.charAt(0).toUpperCase() + location.slice(1),
        coordinates: { lat: loc.lat, lon: loc.lon },
        current: {
            temp: Math.round(loc.avgTemp + (Math.random() - 0.5) * 8),
            condition: Math.random() > 0.7 ? 'Partly Cloudy' : 'Clear',
            humidity: Math.round(50 + Math.random() * 40),
            windSpeed: Math.round(5 + Math.random() * 15),
        },
        forecast: nextDays,
        alerts,
        lastUpdated: new Date().toISOString(),
    };
}

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email and password required' });

    const user = users[email];
    if (!user || user.password !== password)
        return res.status(401).json({ error: 'Invalid email or password' });

    res.json({
        token: 'demo-token-agrisense-' + Date.now(),
        user: { email: user.email, name: user.name, location: user.location },
        message: 'Login successful',
    });
});

// POST /api/auth/signup
app.post('/api/auth/signup', (req, res) => {
    const { name, email, password, location } = req.body;
    if (!name || !email || !password || !location)
        return res.status(400).json({ error: 'Name, email, password, and location required' });

    if (users[email])
        return res.status(400).json({ error: 'User already exists' });

    users[email] = { name, email, password, location };

    res.json({
        token: 'demo-token-agrisense-' + Date.now(),
        user: { email, name, location },
        message: 'Account created successfully',
    });
});

// POST /api/dataset
app.post('/api/dataset', (req, res) => {
    const dataset = req.body;
    if (!Array.isArray(dataset) || dataset.length === 0) {
        return res.status(400).json({ error: 'Dataset must be a non-empty array' });
    }

    const processedHistory = dataset.map((item, index) => {
        const { soilMoisture, temperature, ph, humidity, n, p, k } = item;
        if (soilMoisture == null || temperature == null || ph == null) {
            throw new Error(`Item at index ${index} missing required fields (soilMoisture, temperature, ph)`);
        }

        const metrics = predict(
            Number(soilMoisture),
            Number(temperature),
            Number(ph),
            humidity != null ? Number(humidity) : 60,
            n != null ? Number(n) : 80,
            p != null ? Number(p) : 40,
            k != null ? Number(k) : 150
        );

        return {
            ...item,
            ...metrics,
            timestamp: item.timestamp || new Date(Date.now() - (dataset.length - 1 - index) * 3600000).toISOString(),
        };
    });

    sensorHistory = processedHistory.slice(-MAX_HISTORY);
    currentReading = processedHistory[processedHistory.length - 1];

    res.json({
        message: 'Dataset uploaded and processed successfully',
        current: currentReading,
        history: sensorHistory,
    });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Root endpoint
app.get('/', (req, res) => {
    res.send('<h1>🌱 AgriSense AI Backend is running!</h1><p>Use /api/... endpoints to interact with the API.</p>');
});

// ─── Automated Cron / Jobs ───────────────────────────────────────────────────
setInterval(() => {
    currentReading = generateReading();
    const entry = { ...currentReading, timestamp: new Date().toISOString() };
    sensorHistory.push(entry);
    if (sensorHistory.length > MAX_HISTORY) sensorHistory.shift();
    console.log(`[Auto-Cron] New sensor reading taken at ${entry.timestamp} for ${currentCrop}`);
}, 30 * 60 * 1000);

// ─── Start server ──────────────────────────────────────────────────────────────
server.listen(PORT, () => {
    console.log(`🌱 AgriSense AI Backend running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server ready for live updates`);
});
