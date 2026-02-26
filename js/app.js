// WarInfo Mobile PWA - Main JavaScript
class WarInfoMobileApp {
    constructor() {
        this.init();
    }

    init() {
        // Initialize PWA features
        this.registerServiceWorker();
        this.setupPushNotifications();
        this.setupGeolocation();
        this.setupOfflineMode();
        
        // Load conflict data
        this.loadConflictData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('WarInfo Mobile PWA initialized');
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }

    setupPushNotifications() {
        // Request notification permission
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted');
                    this.setupConflictAlerts();
                }
            });
        }
    }

    setupGeolocation() {
        // Check if user wants location-based alerts
        const locationAlerts = localStorage.getItem('locationAlerts') || 'false';
        if (locationAlerts === 'true') {
            this.enableLocationBasedAlerts();
        }
    }

    enableLocationBasedAlerts() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('User location:', this.userLocation);
                },
                (error) => {
                    console.log('Geolocation error:', error);
                }
            );
        }
    }

    setupOfflineMode() {
        // Check if we're online or offline
        window.addEventListener('online', () => {
            console.log('Back online');
            this.syncData();
        });
        
        window.addEventListener('offline', () => {
            console.log('Going offline');
            this.showOfflineMessage();
        });
    }

    async loadConflictData() {
        try {
            // Try to load from cache first (offline support)
            const cachedData = await this.getCachedData();
            if (cachedData) {
                this.renderConflictData(cachedData);
                return;
            }
            
            // Load from server
            const response = await fetch('/conflict_data.json');
            if (response.ok) {
                const data = await response.json();
                this.cacheData(data);
                this.renderConflictData(data);
            }
        } catch (error) {
            console.error('Error loading conflict data:', error);
            this.showErrorMessage('Failed to load conflict data');
        }
    }

    async getCachedData() {
        if ('caches' in window) {
            const cache = await caches.open('warinfo-cache-v1');
            const response = await cache.match('/conflict_data.json');
            if (response) {
                return await response.json();
            }
        }
        return null;
    }

    async cacheData(data) {
        if ('caches' in window) {
            const cache = await caches.open('warinfo-cache-v1');
            const response = new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
            });
            await cache.put('/conflict_data.json', response);
        }
    }

    renderConflictData(data) {
        // Render heatmap and events list
        this.renderHeatmap(data.conflict_data);
        this.renderEventsList(data.recent_events);
    }

    renderHeatmap(conflictData) {
        // Create mobile-optimized heatmap
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;
        
        // Initialize Leaflet map for mobile
        const map = L.map('map', {
            zoomControl: false, // Custom zoom controls for mobile
            attributionControl: false
        }).setView([20, 0], 2);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add heatmap layer
        const heatPoints = [];
        for (const [country, info] of Object.entries(conflictData)) {
            const coords = this.getCountryCoordinates(country);
            if (coords) {
                // Intensity affects point weight
                const weight = info.intensity / 100;
                heatPoints.push([coords.lat, coords.lng, weight]);
            }
        }
        
        if (heatPoints.length > 0) {
            L.heatLayer(heatPoints, {
                radius: 25,
                blur: 15,
                maxZoom: 1,
                minOpacity: 0.5
            }).addTo(map);
        }
        
        // Store map reference for later use
        this.map = map;
    }

    getCountryCoordinates(country) {
        // Simplified country coordinates for mobile
        const coordinates = {
            "Ukraine": {lat: 48.3794, lng: 31.1656},
            "Israel": {lat: 31.0461, lng: 34.8516},
            "Gaza": {lat: 31.3547, lng: 34.3088},
            "Sudan": {lat: 12.8628, lng: 30.2176},
            "Myanmar": {lat: 21.9162, lng: 95.9560},
            "Syria": {lat: 34.8021, lng: 38.9968},
            "Yemen": {lat: 15.5527, lng: 48.5164},
            "Afghanistan": {lat: 33.9391, lng: 67.7100},
            "Somalia": {lat: 5.1521, lng: 46.1996},
            "Nigeria": {lat: 9.0820, lng: 8.6753},
            "Colombia": {lat: 4.5709, lng: -74.2973},
            "Mexico": {lat: 23.6345, lng: -102.5528},
            "Haiti": {lat: 18.9712, lng: -72.2852},
            "Pakistan": {lat: 30.3753, lng: 69.3451},
            "India": {lat: 20.5937, lng: 78.9629},
            "Philippines": {lat: 12.8797, lng: 121.7740},
            "Russia": {lat: 61.5240, lng: 105.3188},
            "Turkey": {lat: 38.9637, lng: 35.2433}
        };
        return coordinates[country] || null;
    }

    renderEventsList(events) {
        const eventsContainer = document.getElementById('events-list');
        if (!eventsContainer) return;
        
        eventsContainer.innerHTML = '';
        
        events.slice(0, 10).forEach(event => {
            const [date, country, description, killed, wounded] = event;
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            eventElement.innerHTML = `
                <div class="event-date">${date}</div>
                <div class="event-country" onclick="app.jumpToCountry('${country}')">
                    ${country} 📍
                </div>
                <div class="event-description">${description}</div>
                <div class="event-casualties">
                    ${killed > 0 ? `💀 ${killed} killed` : ''} 
                    ${wounded > 0 ? `🩹 ${wounded} wounded` : ''}
                </div>
                <div class="event-source">
                    <a href="#" onclick="app.openNewsSource('${country}')">📰 Source: News</a>
                </div>
            `;
            eventsContainer.appendChild(eventElement);
        });
    }

    jumpToCountry(country) {
        const coords = this.getCountryCoordinates(country);
        if (coords && this.map) {
            this.map.flyTo([coords.lat, coords.lng], 6, {
                animate: true,
                duration: 1.5
            });
        }
    }

    openNewsSource(country) {
        // Open news source in new tab
        const newsUrls = {
            "Ukraine": "https://www.reuters.com/world/europe/",
            "Israel": "https://www.aljazeera.com/tag/israel/",
            "Gaza": "https://www.bbc.com/news/world-middle-east",
            "Sudan": "https://www.cnn.com/africa",
            "Myanmar": "https://www.theguardian.com/world/myanmar",
            "Syria": "https://www.nytimes.com/section/world/middleeast",
            "Yemen": "https://apnews.com/hub/yemen",
            "Afghanistan": "https://www.washingtonpost.com/world/afghanistan/",
            "Somalia": "https://www.voanews.com/africa/somalia",
            "Nigeria": "https://www.premiumtimesng.com/",
            "Colombia": "https://colombiareports.com/",
            "Mexico": "https://mexiconewsdaily.com/",
            "Haiti": "https://haitiantimes.com/",
            "Pakistan": "https://www.dawn.com/",
            "India": "https://timesofindia.indiatimes.com/",
            "Philippines": "https://www.philstar.com/",
            "Russia": "https://www.themoscowtimes.com/",
            "Turkey": "https://www.hurriyetdailynews.com/"
        };
        
        const url = newsUrls[country] || "https://www.google.com/search?q=" + encodeURIComponent(country + " conflict news");
        window.open(url, '_blank');
    }

    setupConflictAlerts() {
        // Set up periodic conflict data checks
        setInterval(() => {
            this.checkForNewConflicts();
        }, 300000); // Check every 5 minutes
    }

    async checkForNewConflicts() {
        if (!navigator.onLine) return;
        
        try {
            const response = await fetch('/conflict_data.json');
            if (response.ok) {
                const newData = await response.json();
                const lastUpdated = new Date(newData.last_updated);
                const currentData = JSON.parse(localStorage.getItem('currentConflictData') || '{}');
                
                if (!currentData.last_updated || new Date(currentData.last_updated) < lastUpdated) {
                    // New conflicts detected
                    this.showConflictAlert();
                    localStorage.setItem('currentConflictData', JSON.stringify(newData));
                }
            }
        } catch (error) {
            console.error('Error checking for new conflicts:', error);
        }
    }

    showConflictAlert() {
        if (Notification.permission === 'granted') {
            new Notification('🚨 New Conflicts Detected', {
                body: 'Check the latest global conflict updates',
                icon: '/icons/icon-192x192.png'
            });
        }
    }

    showOfflineMessage() {
        const offlineMsg = document.getElementById('offline-message');
        if (offlineMsg) {
            offlineMsg.style.display = 'block';
        }
    }

    showErrorMessage(message) {
        const errorMsg = document.getElementById('error-message');
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
        }
    }

    syncData() {
        // Sync data when back online
        this.loadConflictData();
        const offlineMsg = document.getElementById('offline-message');
        if (offlineMsg) {
            offlineMsg.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadConflictData();
            });
        }
        
        // Location alerts toggle
        const locationToggle = document.getElementById('location-alerts-toggle');
        if (locationToggle) {
            locationToggle.addEventListener('change', (e) => {
                localStorage.setItem('locationAlerts', e.target.checked.toString());
                if (e.target.checked) {
                    this.enableLocationBasedAlerts();
                }
            });
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new WarInfoMobileApp();
});

// Handle install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Update UI to notify the user they can install the PWA
    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.style.display = 'block';
        installButton.addEventListener('click', () => {
            // Hide the install button
            installButton.style.display = 'none';
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
            });
        });
    }
});