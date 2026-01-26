/**
 * World Map with Visitor Tracking
 * Displays a world map with visitor location pinpoint and visitor counter
 */

// Simplified world map data (simplified coastlines as paths)
const worldMapData = {
  // Major continents and countries as simple path segments
  paths: [
    // North America
    'M100,100 L150,80 L180,90 L170,140 L150,150 L100,130 Z',
    // South America
    'M180,180 L210,170 L220,250 L190,270 Z',
    // Europe
    'M450,80 L520,70 L530,110 L480,120 Z',
    // Africa
    'M480,140 L560,130 L580,250 L520,280 Z',
    // Asia
    'M550,80 L700,90 L750,140 L800,120 L820,160 L700,200 L600,180 Z',
    // Australia
    'M800,300 L840,310 L830,350 L790,340 Z',
  ]
};

class WorldMapTracker {
  constructor() {
    this.visitorCount = this.getVisitorCount();
    this.userLocation = null;
    this.init();
  }

  async init() {
    this.renderMap();
    this.updateVisitorCount();
    await this.getUserLocation();
    this.displayUserLocation();
  }

  // Get or initialize visitor count from localStorage
  getVisitorCount() {
    const stored = localStorage.getItem('visitorCount');
    const count = stored ? parseInt(stored) + 1 : 1;
    localStorage.setItem('visitorCount', count);
    localStorage.setItem('lastVisit', new Date().toISOString());
    return count;
  }

  // Render the SVG map
  renderMap() {
    const mapSvg = document.querySelector('.world-map svg');
    if (!mapSvg) return;

    // Clear existing content
    mapSvg.innerHTML = '';

    // Add background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '960');
    bg.setAttribute('height', '600');
    bg.setAttribute('fill', 'rgba(255,255,255,0.02)');
    mapSvg.appendChild(bg);

    // Add grid lines
    for (let i = 0; i <= 960; i += 120) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', i);
      line.setAttribute('y1', '0');
      line.setAttribute('x2', i);
      line.setAttribute('y2', '600');
      line.setAttribute('stroke', 'rgba(255,255,255,0.02)');
      line.setAttribute('stroke-width', '0.5');
      mapSvg.appendChild(line);
    }

    for (let i = 0; i <= 600; i += 100) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', i);
      line.setAttribute('x2', '960');
      line.setAttribute('y2', i);
      line.setAttribute('stroke', 'rgba(255,255,255,0.02)');
      line.setAttribute('stroke-width', '0.5');
      mapSvg.appendChild(line);
    }

    // Add continents as simplified shapes
    worldMapData.paths.forEach(pathData => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', 'rgba(214,255,0,0.08)');
      path.setAttribute('stroke', 'rgba(214,255,0,0.2)');
      path.setAttribute('stroke-width', '1');
      mapSvg.appendChild(path);
    });

    // Add equator and prime meridian
    const equator = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    equator.setAttribute('x1', '0');
    equator.setAttribute('y1', '300');
    equator.setAttribute('x2', '960');
    equator.setAttribute('y2', '300');
    equator.setAttribute('stroke', 'rgba(255,255,255,0.03)');
    equator.setAttribute('stroke-width', '0.5');
    equator.setAttribute('stroke-dasharray', '5,5');
    mapSvg.appendChild(equator);

    const meridian = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    meridian.setAttribute('x1', '480');
    meridian.setAttribute('y1', '0');
    meridian.setAttribute('x2', '480');
    meridian.setAttribute('y2', '600');
    meridian.setAttribute('stroke', 'rgba(255,255,255,0.03)');
    meridian.setAttribute('stroke-width', '0.5');
    meridian.setAttribute('stroke-dasharray', '5,5');
    mapSvg.appendChild(meridian);
  }

  // Convert latitude/longitude to map coordinates
  latLngToMapCoords(lat, lng) {
    // Mercator projection (simplified)
    const mapWidth = 960;
    const mapHeight = 600;

    // Normalize coordinates
    const x = ((lng + 180) / 360) * mapWidth;
    const y = ((90 - lat) / 180) * mapHeight;

    return { x, y };
  }

  // Get user's geolocation
  async getUserLocation() {
    return new Promise((resolve) => {
      // Try to get location from geolocation API
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            };
            this.getLocationName();
            resolve();
          },
          (error) => {
            // Fallback: get from IP geolocation API
            this.getUserLocationFromIP();
            resolve();
          },
          { timeout: 5000 }
        );
      } else {
        // Fallback: use IP-based geolocation
        this.getUserLocationFromIP();
        resolve();
      }
    });
  }

  // Get location from IP address using free API
  async getUserLocationFromIP() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      this.userLocation = {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude),
        city: data.city,
        country: data.country_name
      };
    } catch (error) {
      console.log('Unable to determine location:', error);
      this.userLocation = {
        lat: 0,
        lng: 0,
        city: 'Unknown',
        country: 'Unknown'
      };
    }
  }

  // Display user location on map
  displayUserLocation() {
    if (!this.userLocation) return;

    const coords = this.latLngToMapCoords(
      this.userLocation.lat,
      this.userLocation.lng
    );

    const mapContainer = document.querySelector('.world-map');
    const pinpoint = document.getElementById('map-pinpoint');

    if (pinpoint && mapContainer) {
      const mapRect = mapContainer.getBoundingClientRect();
      const mapWidth = mapContainer.offsetWidth;
      const mapHeight = mapContainer.offsetHeight;

      // Calculate position as percentage
      const x = (coords.x / 960) * 100;
      const y = (coords.y / 600) * 100;

      pinpoint.style.left = x + '%';
      pinpoint.style.top = y + '%';
      pinpoint.style.display = 'block';
    }

    // Update location text
    const locationEl = document.getElementById('visitor-location');
    if (locationEl) {
      const city = this.userLocation.city || 'Unknown';
      const country = this.userLocation.country || 'Unknown';
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new WorldMapTracker();
  });
} else {
  new WorldMapTracker();
}
