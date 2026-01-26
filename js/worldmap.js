/**
 * World Map with Visitor Tracking using Leaflet
 * Displays an interactive world map with visitor location marker and visitor counter
 */

class WorldMapTracker {
  constructor() {
    this.map = null;
    this.userMarker = null;
    this.visitorCount = this.getVisitorCount();
    this.userLocation = null;
    this.init();
  }

  async init() {
    this.initializeMap();
    this.updateVisitorCount();
    await this.getUserLocation();
    this.displayUserLocation();
  }

  // Initialize Leaflet map
  initializeMap() {
    const mapContainer = document.getElementById('world-map');
    if (!mapContainer) return;

    // Create map with custom styling to match site theme
    this.map = L.map('world-map', {
      zoom: 2,
      center: [20, 0],
      zoomControl: true,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: true,
      boxZoom: false,
      keyboard: false
    });

    // Use OpenStreetMap tiles with dark styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      minZoom: 1,
      attribution: false,
      opacity: 0.8
    }).addTo(this.map);

    // Add subtle grid overlay
    this.addGridOverlay();
  }

  // Add subtle grid overlay to map
  addGridOverlay() {
    if (!this.map) return;

    const gridLines = L.tileLayer.canvas({
      async: true
    });

    gridLines.drawTile = (canvas, tilePoint, zoom) => {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;

      // Draw grid lines
      for (let i = 0; i < 256; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 256);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(256, i);
        ctx.stroke();
      }
    };

    gridLines.addTo(this.map);
  }

  // Get or initialize visitor count from localStorage
  getVisitorCount() {
    const stored = localStorage.getItem('visitorCount');
    const count = stored ? parseInt(stored) + 1 : 1;
    localStorage.setItem('visitorCount', count);
    localStorage.setItem('lastVisit', new Date().toISOString());
    return count;
  }

  // Get user's geolocation
  async getUserLocation() {
    return new Promise((resolve) => {
      // Try browser geolocation first
      if (navigator.geolocation) {
        const timeout = setTimeout(() => {
          this.getUserLocationFromIP();
          resolve();
        }, 6000);

        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeout);
            this.userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              source: 'browser'
            };
            this.getLocationName();
            resolve();
          },
          (error) => {
            clearTimeout(timeout);
            console.log('Geolocation error, trying IP-based detection:', error.message);
            this.getUserLocationFromIP();
            resolve();
          }
        );
      } else {
        this.getUserLocationFromIP();
        resolve();
      }
    });
  }

  // Get location from IP address using free API
  async getUserLocationFromIP() {
    try {
      const response = await fetch('https://ipapi.co/json/', {
        mode: 'cors',
        method: 'GET'
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      this.userLocation = {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude),
        city: data.city || data.region_code || 'Unknown',
        country: data.country_name || 'Unknown',
        source: 'ip'
      };

      this.getLocationName();
    } catch (error) {
      console.log('IP geolocation failed:', error);
      // Try alternative API
      this.getUserLocationFromAlternativeAPI();
    }
  }

  // Try alternative geolocation API
  async getUserLocationFromAlternativeAPI() {
    try {
      const response = await fetch('https://geolocation-db.com/json/geoip.php', {
        mode: 'cors',
        method: 'GET'
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      this.userLocation = {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude),
        city: data.city || 'Unknown',
        country: data.country_name || 'Unknown',
        source: 'alt-ip'
      };

      this.getLocationName();
    } catch (error) {
      console.log('Alternative API failed, using defaults:', error);
      this.userLocation = {
        lat: 0,
        lng: 0,
        city: 'Unable to detect',
        country: 'location',
        source: 'default'
      };
      this.displayUserLocation();
    }
  }

  // Get friendly location name (already done by IP APIs)
  async getLocationName() {
    // IP APIs already provide city and country
    // No need for reverse geocoding
    this.displayUserLocation();
  }

  // Display user location on map
  displayUserLocation() {
    if (!this.userLocation || !this.map) return;

    // Remove old marker if exists
    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
    }

    const { lat, lng, city, country } = this.userLocation;

    // Create custom marker with neon styling
    const customIcon = L.divIcon({
      className: 'custom-visitor-marker',
      html: `
        <div class="visitor-marker-inner">
          <div class="visitor-marker-pulse"></div>
          <div class="visitor-marker-dot"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });

    this.userMarker = L.marker([lat, lng], { icon: customIcon })
      .addTo(this.map)
      .bindPopup(`<div style="color: #d6ff00; font-family: 'PT Mono', monospace; text-align: center;">
        <strong>${city}</strong><br/>
        <small>${country}</small>
      </div>`, {
        className: 'visitor-popup',
        closeButton: false
      });

    // Pan to user location
    this.map.setView([lat, lng], 3);

    // Update location display
    this.updateLocationDisplay(city, country);
  }

  // Update visitor location display
  updateLocationDisplay(city, country) {
    const locationEl = document.getElementById('visitor-location');
    if (locationEl) {
      locationEl.textContent = `${city}, ${country}`;
    }
  }

  // Update visitor count display
  updateVisitorCount() {
    const countEl = document.getElementById('visitor-count');
    if (countEl) {
      countEl.textContent = this.formatNumber(this.visitorCount);
    }
  }

  // Format large numbers with commas
  formatNumber(num) {
    return num.toLocaleString();
  }
}

// Initialize when Leaflet is loaded and DOM is ready
function initializeWhenReady() {
  if (typeof L !== 'undefined' && document.readyState !== 'loading') {
    new WorldMapTracker();
  } else if (typeof L !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      new WorldMapTracker();
    });
  } else {
    // Wait for Leaflet to load
    setTimeout(initializeWhenReady, 100);
  }
}

initializeWhenReady();
