// Constants
const STORAGE_KEY = 'digital_detox_website_limits';
const DEFAULT_DAILY_LIMIT = 20; // minutes

// Website data structure
class WebsiteLimit {
  constructor(url, timeLimit) {
    this.url = url;
    this.timeLimit = timeLimit;
    this.timeUsed = 0;
    this.lastReset = new Date().toISOString().split('T')[0]; // Today's date
    this.sessions = []; // Track individual usage sessions
  }
}

// Website time tracker
class WebsiteTimeTracker {
  constructor() {
    this.websites = this.loadWebsiteData();
    this.activeSession = null;
    this.checkAndResetDailyLimits();
  }

  // Load website data from localStorage
  loadWebsiteData() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : [];
  }

  // Save website data to localStorage
  saveWebsiteData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.websites));
  }

  // Add a new website to track
  addWebsite(url, timeLimit) {
    // Normalize URL for display and comparison
    let displayUrl;
    try {
      displayUrl = new URL(url).hostname;
    } catch (e) {
      displayUrl = url;
    }

    // Check if website already exists
    const existingIndex = this.websites.findIndex(w => 
      w.url.toLowerCase() === displayUrl.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Website already exists, don't modify the time limit
      // This prevents users from changing the limit after it's set
      return displayUrl;
    } else {
      this.websites.push(new WebsiteLimit(displayUrl, timeLimit));
    }

    this.saveWebsiteData();
    return displayUrl;
  }

  // Remove a website
  removeWebsite(index) {
    if (index >= 0 && index < this.websites.length) {
      // Check if the website has been used today
      if (this.websites[index].timeUsed > 0) {
        return false; // Cannot remove websites that have been used today
      }
      
      this.websites.splice(index, 1);
      this.saveWebsiteData();
      return true;
    }
    return false;
  }

  // Calculate time remaining for a website
  getTimeRemaining(websiteUrl) {
    const website = this.findWebsiteByUrl(websiteUrl);
    if (!website) return 0;
    
    return Math.max(0, website.timeLimit - website.timeUsed);
  }

  // Find website by URL
  findWebsiteByUrl(url) {
    let hostname;
    try {
      hostname = new URL(url).hostname;
    } catch (e) {
      hostname = url;
    }
    
    return this.websites.find(w => w.url.toLowerCase() === hostname.toLowerCase());
  }

  // Start using a website
  startWebsiteSession(url, requestedMinutes) {
    let hostname;
    try {
      hostname = new URL(url).hostname;
    } catch (e) {
      hostname = url;
    }
    
    const website = this.findWebsiteByUrl(hostname);
    if (!website) return { success: false, message: 'Website not found' };

    const timeRemaining = this.getTimeRemaining(hostname);
    if (timeRemaining <= 0) {
      return { 
        success: false, 
        message: `You've reached your daily limit for ${website.url}. Try again tomorrow!` 
      };
    }

    const minutes = parseInt(requestedMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      return { success: false, message: 'Please enter a valid number of minutes.' };
    }

    if (minutes > timeRemaining) {
      return { 
        success: false, 
        message: `You only have ${timeRemaining} minutes remaining today.` 
      };
    }

    // Create a new session
    const session = {
      startTime: new Date().getTime(),
      requestedMinutes: minutes,
      actualMinutes: 0,
      completed: false
    };

    website.sessions.push(session);
    this.activeSession = {
      websiteUrl: hostname,
      sessionIndex: website.sessions.length - 1
    };

    this.saveWebsiteData();
    
    return { 
      success: true, 
      message: `Session started for ${website.url}. You have ${timeRemaining - minutes} minutes remaining after this session.`,
      url: `https://${website.url}`
    };
  }

  // End the current website session
  endWebsiteSession(actualMinutes = null) {
    if (!this.activeSession) return false;

    const { websiteUrl, sessionIndex } = this.activeSession;
    const website = this.findWebsiteByUrl(websiteUrl);
    
    if (!website || !website.sessions[sessionIndex]) return false;

    const session = website.sessions[sessionIndex];
    
    // If actualMinutes is provided, use that, otherwise calculate based on time elapsed
    if (actualMinutes !== null) {
      session.actualMinutes = actualMinutes;
    } else {
      const elapsedMs = new Date().getTime() - session.startTime;
      session.actualMinutes = Math.min(
        session.requestedMinutes,
        Math.ceil(elapsedMs / (1000 * 60))
      );
    }

    session.completed = true;
    website.timeUsed += session.actualMinutes;
    this.activeSession = null;
    
    this.saveWebsiteData();
    return true;
  }

  // Check and reset daily limits if needed
  checkAndResetDailyLimits() {
    const today = new Date().toISOString().split('T')[0]; // Today's date
    let updated = false;
    
    this.websites.forEach(website => {
      if (website.lastReset !== today) {
        website.timeUsed = 0;
        website.lastReset = today;
        // Keep the sessions history but mark that a reset occurred
        website.sessions.push({
          type: 'reset',
          date: today
        });
        updated = true;
      }
    });
    
    if (updated) {
      this.saveWebsiteData();
    }
  }

  // Get all websites data
  getAllWebsites() {
    return this.websites;
  }
}

// Initialize the tracker when the script loads
const websiteTracker = new WebsiteTimeTracker();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WebsiteTimeTracker, websiteTracker };
}