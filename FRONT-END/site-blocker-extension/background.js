// Background script for Site Blocker extension

// Store website time limits and usage data
let websiteLimits = {};

// Load website limits from storage
chrome.storage.local.get(['websiteLimits'], function(result) {
  if (result.websiteLimits) {
    websiteLimits = result.websiteLimits;
  }
});

// Check if a website should be blocked when navigating to it
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  // Only check main frame navigation (not iframes, etc.)
  if (details.frameId !== 0) return;
  
  try {
    const url = new URL(details.url);
    const hostname = url.hostname;
    
    // Check if this website has a time limit
    if (websiteLimits[hostname]) {
      const website = websiteLimits[hostname];
      
      // Check if time limit is reached
      if (website.timeUsed >= website.timeLimit) {
        console.log(`Blocking ${hostname} - time limit reached`);
        
        // Redirect to blocked page
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL("blocked.html") + "?site=" + encodeURIComponent(hostname)
        });
      }
    }
  } catch (e) {
    console.error("Error checking website:", e);
  }
});

// Listen for messages from web app
chrome.runtime.onMessageExternal.addListener(function(message, sender, sendResponse) {
  if (message.action === "updateLimits") {
    // Update website limits
    websiteLimits = message.limits;
    chrome.storage.local.set({websiteLimits: websiteLimits});
    console.log("Updated website limits:", websiteLimits);
    sendResponse({success: true});
    return true;
  }
  
  if (message.action === "timeUp") {
    // Find tab with the website and send a message to show notification
    const hostname = message.website;
    
    chrome.tabs.query({}, function(tabs) {
      for (const tab of tabs) {
        try {
          if (tab.url && tab.url.includes(hostname)) {
            chrome.tabs.sendMessage(tab.id, {
              action: "showTimeUpNotification",
              website: hostname
            });
          }
        } catch (e) {
          console.error("Error sending message to tab:", e);
        }
      }
    });
    
    sendResponse({success: true});
    return true;
  }
});