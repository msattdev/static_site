/**
 * World Map with Visitor Location Tracking using Leaflet
 * Displays an interactive world map with visitor location marker
 */

class WorldMapTracker {
  constructor() {
    this.map = null;
    this.userMarker = null;
    this.userLocation = null;
    this.init();
  }

  async init() {
    console.log('WorldMapTracker init started');
    this.initializeMap();
    console.log('Awaiting user location...');
    await this.getUserLocation();
    console.log('User location obtained, displaying...');
    this.displayUserLocation();
    console.log('Initialization complete');
  }

  // Initialize Leaflet map
  initializeMap() {
    console.log('Initializing Leaflet map');
    const mapContainer = document.getElementById('world-map');
    if (!mapContainer) {
      console.log('Map container not found!');
      return;
    }

    console.log('Map container found, creating map instance');
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

    console.log('Map instance created');

    // Use OpenStreetMap tiles with dark styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      minZoom: 1,
      attribution: false,
      opacity: 0.8
    }).addTo(this.map);

    console.log('Tile layer added');

    // Add subtle grid overlay
    this.addGridOverlay();
    console.log('Map initialization complete');
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

  // Get user's geolocation
  async getUserLocation() {
    return new Promise((resolve) => {
      // Try browser geolocation first
      if (navigator.geolocation) {
        const timeout = setTimeout(() => {
          console.log('Browser geolocation timeout, trying IP-based detection');
          this.getUserLocationFromIP();
          resolve();
        }, 8000);

        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeout);
            console.log('Browser geolocation successful:', position.coords);
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
            console.log('Geolocation error:', error.code, error.message);
            this.getUserLocationFromIP();
            resolve();
          },
          {
            timeout: 8000,
            enableHighAccuracy: false,
            maximumAge: 0
          }
        );
      } else {
        console.log('Geolocation not supported, using IP-based detection');
        this.getUserLocationFromIP();
        resolve();
      }
    });
  }

  // Get location from IP address using free API
  async getUserLocationFromIP() {
    try {
      console.log('Attempting IP geolocation via ipapi.co');
      const response = await fetch('https://ipapi.co/json/', {
        mode: 'cors',
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.log('ipapi.co response not ok:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('ipapi.co response:', data);

      this.userLocation = {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude),
        city: data.city || data.region_code || 'Unknown',
        country: data.country_name || 'Unknown',
        source: 'ip'
      };

      console.log('Location set from IP:', this.userLocation);
      this.displayUserLocation();
    } catch (error) {
      console.log('ipapi.co failed:', error.message);
      // Try alternative API
      this.getUserLocationFromAlternativeAPI();
    }
  }

  // Try alternative geolocation API
  async getUserLocationFromAlternativeAPI() {
    try {
      console.log('Attempting IP geolocation via geolocation-db.com');
      const response = await fetch('https://geolocation-db.com/json/geoip.php', {
        mode: 'cors',
        method: 'GET'
      });

      if (!response.ok) {
        console.log('geolocation-db response not ok:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('geolocation-db response:', data);

      this.userLocation = {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude),
        city: data.city || 'Unknown',
        country: data.country_name || 'Unknown',
        source: 'alt-ip'
      };

      console.log('Location set from alternative API:', this.userLocation);
      this.displayUserLocation();
    } catch (error) {
      console.log('Alternative API failed:', error.message);
      console.log('Using default location (0, 0)');
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
    console.log('Location name ready, displaying location');
    this.displayUserLocation();
  }

  // Display user location on map
  displayUserLocation() {
    console.log('displayUserLocation called, map:', this.map, 'location:', this.userLocation);
    
    if (!this.userLocation) {
      console.log('No user location, cannot display');
      return;
    }

    if (!this.map) {
      console.log('Map not initialized yet, retrying in 500ms');
      setTimeout(() => this.displayUserLocation(), 500);
      return;
    }

    // Remove old marker if exists
    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
    }

    const { lat, lng, city, country } = this.userLocation;
    console.log('Creating marker at:', lat, lng, 'for', city, country);

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
