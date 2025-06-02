const STORAGE_KEY = 'digital_detox_website_limits';
const DEFAULT_DAILY_LIMIT = 20;

class WebsiteLimit {
  constructor(url, timeLimit) {
    this.url = url;
    this.timeLimit = timeLimit;
    this.timeUsed = 0;
    this.lastReset = new Date().toISOString().split('T')[0];
    this.sessions = [];
  }
}

class WebsiteTimeTracker {
  constructor() {
    this.websites = this.loadWebsiteData();
    this.activeSession = null;
    this.checkAndResetDailyLimits();
  }

  loadWebsiteData() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : [];
  }

  saveWebsiteData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.websites));
  }

  addWebsite(url, timeLimit) {
    let displayUrl;
    try {
      displayUrl = new URL(url).hostname;
    } catch (e) {
      displayUrl = url;
    }

    const existingIndex = this.websites.findIndex(w => 
      w.url.toLowerCase() === displayUrl.toLowerCase()
    );

    if (existingIndex >= 0) {
      return displayUrl;
    } else {
      this.websites.push(new WebsiteLimit(displayUrl, timeLimit));
    }

    this.saveWebsiteData();
    return displayUrl;
  }

  removeWebsite(index) {
    if (index >= 0 && index < this.websites.length) {
      if (this.websites[index].timeUsed > 0) {
        return false;
      }
      
      this.websites.splice(index, 1);
      this.saveWebsiteData();
      return true;
    }
    return false;
  }

  getTimeRemaining(websiteUrl) {
    const website = this.findWebsiteByUrl(websiteUrl);
    if (!website) return 0;
    
    return Math.max(0, website.timeLimit - website.timeUsed);
  }

  findWebsiteByUrl(url) {
    let hostname;
    try {
      hostname = new URL(url).hostname;
    } catch (e) {
      hostname = url;
    }
    
    return this.websites.find(w => w.url.toLowerCase() === hostname.toLowerCase());
  }

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

  endWebsiteSession(actualMinutes = null) {
    if (!this.activeSession) return false;

    const { websiteUrl, sessionIndex } = this.activeSession;
    const website = this.findWebsiteByUrl(websiteUrl);
    
    if (!website || !website.sessions[sessionIndex]) return false;

    const session = website.sessions[sessionIndex];
    
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

  checkAndResetDailyLimits() {
    const today = new Date().toISOString().split('T')[0];
    let updated = false;
    
    this.websites.forEach(website => {
      if (website.lastReset !== today) {
        website.timeUsed = 0;
        website.lastReset = today;
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

  getAllWebsites() {
    return this.websites;
  }
}

const websiteTracker = new WebsiteTimeTracker();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WebsiteTimeTracker, websiteTracker };
}