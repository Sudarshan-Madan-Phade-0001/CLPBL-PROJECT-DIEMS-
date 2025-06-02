const blockedSites = [
  "*://*.facebook.com/*",
  "*://*.youtube.com/*",
  "*://*.instagram.com/*"
];

const rules = blockedSites.map((url, index) => ({
  id: index + 1,
  priority: 1,
  action: { type: "block" },
  condition: {
    urlFilter: url,
    resourceTypes: ["main_frame"]
  }
}));

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: rules,
    removeRuleIds: rules.map(rule => rule.id)
  });
});
