# WarInfo Mobile - Global Conflict Monitor (PWA)

A Progressive Web App version of the WarInfo global conflict heatmap, optimized for mobile devices.

## 📱 Features

- **Mobile-optimized heatmap**: Touch-friendly interface with pinch-to-zoom
- **Real-time conflict alerts**: Push notifications for high-risk areas
- **Offline support**: Cache recent data for offline access
- **Installable**: Add to home screen like a native app
- **Fast loading**: Optimized for mobile networks
- **Background sync**: Automatically updates when online

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/sunrichard888/warinfo-mobile.git
cd warinfo-mobile

# Serve locally (requires Python 3)
python3 -m http.server 8080

# Open in browser: http://localhost:8080
```

## 📁 Project Structure

```
warinfo-mobile/
├── index.html              # Main PWA entry point
├── manifest.json          # PWA manifest
├── service-worker.js      # Offline caching and push notifications
├── css/
│   └── mobile.css         # Mobile-optimized styles
├── js/
│   ├── mobile-heatmap.js  # Mobile-specific heatmap logic
│   └── push-notifications.js # Push notification handling
├── data/
│   └── conflict_data.json # Latest conflict data (synced from main project)
└── README.md
```

## 🔧 Development

### Data Sync
The mobile app automatically syncs data from the main WarInfo project:
- Conflict data: `https://sunrichard888.github.io/warinfo/conflict_data.json`
- Heatmap updates: Daily via GitHub Actions

### Building for Production
```bash
# The PWA is static files only - no build step required
# Just deploy the entire directory to any static hosting service
```

## 📲 Installation

1. Open [https://sunrichard888.github.io/warinfo-mobile/](https://sunrichard888.github.io/warinfo-mobile/) in Chrome/Safari
2. Click "Add to Home Screen" 
3. Launch like a native app!

## 💰 Monetization Ready

- Free tier: Basic heatmap and recent events
- Pro tier ($4.99/month): Historical data, custom alerts, offline reports
- Enterprise tier: API access, team features

## 📜 License

MIT License - See [LICENSE](LICENSE) for details.