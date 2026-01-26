/**
 * Visitor Information Tracker
 * Tracks visitor count and displays IP address
 */

class VisitorInfo {
  constructor() {
    this.visitorCount = this.getVisitorCount();
    this.visitorIP = null;
    this.init();
  }

  async init() {
    console.log('VisitorInfo init started');
    this.updateVisitorCountDisplay();
    await this.getVisitorIP();
    this.displayVisitorIP();
    console.log('VisitorInfo initialization complete');
  }

  // Get or initialize visitor count from localStorage
  getVisitorCount() {
    const stored = localStorage.getItem('visitorCount');
    const count = stored ? parseInt(stored) + 1 : 1;
    localStorage.setItem('visitorCount', count);
    localStorage.setItem('lastVisit', new Date().toISOString());
    console.log('Visitor count:', count);
    return count;
  }

  // Get visitor's IP address
  async getVisitorIP() {
    try {
      console.log('Fetching IP address via ipapi.co');
      const response = await fetch('https://ipapi.co/json/', {
        mode: 'cors',
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.log('IP API response not ok:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('IP API response:', data);

      this.visitorIP = data.ip;
      console.log('Visitor IP set:', this.visitorIP);
    } catch (error) {
      console.log('IP API failed:', error.message);
      // Try alternative API
      this.getVisitorIPAlternative();
    }
  }

  // Try alternative API for IP address
  async getVisitorIPAlternative() {
    try {
      console.log('Trying alternative IP API');
      const response = await fetch('https://api.ipify.org?format=json', {
        mode: 'cors',
        method: 'GET'
      });

      if (!response.ok) {
        console.log('Alternative IP API response not ok:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Alternative IP API response:', data);

      this.visitorIP = data.ip;
      console.log('Visitor IP set from alternative API:', this.visitorIP);
    } catch (error) {
      console.log('Alternative IP API failed:', error.message);
      this.visitorIP = 'Unable to detect';
    }
  }

  // Display visitor IP
  displayVisitorIP() {
    console.log('Displaying visitor IP:', this.visitorIP);
    const ipEl = document.getElementById('visitor-ip');
    if (ipEl) {
      ipEl.textContent = this.visitorIP || 'Unable to detect';
    }
  }

  // Update visitor count display
  updateVisitorCountDisplay() {
    console.log('Updating visitor count display:', this.visitorCount);
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
    new VisitorInfo();
  });
} else {
  new VisitorInfo();
}
