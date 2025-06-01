// Script to export website usage data from localStorage to a JSON file
// This would be used in a real environment where you have access to the file system
// For browser environments, you would need to use a different approach

function exportWebsiteData() {
  try {
    // Get data from localStorage
    const websiteData = localStorage.getItem('digital_detox_website_limits');
    
    if (!websiteData) {
      console.error('No website data found in localStorage');
      return;
    }
    
    // Parse the data
    const websites = JSON.parse(websiteData);
    
    // Format the data for the Python script
    const formattedData = websites.map(site => ({
      url: site.url,
      timeUsed: site.timeUsed,
      timeLimit: site.timeLimit,
      lastReset: site.lastReset
    }));
    
    // In a real environment, you would save this to a file
    // For demonstration, we'll just log it
    console.log('Website data to export:', JSON.stringify(formattedData, null, 2));
    
    // In a Node.js environment, you could use fs.writeFileSync
    // const fs = require('fs');
    // fs.writeFileSync('website_data.json', JSON.stringify(formattedData, null, 2));
    
    // For browser environments, you can create a downloadable file
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formattedData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "website_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  } catch (error) {
    console.error('Error exporting website data:', error);
  }
}

// Add a button to the website-blocker.html page to trigger the export
function addExportButton() {
  const container = document.querySelector('.website-list');
  if (!container) return;
  
  const exportButton = document.createElement('button');
  exportButton.textContent = 'Export Usage Data for Analysis';
  exportButton.style.marginTop = '20px';
  exportButton.style.backgroundColor = '#077b32';
  exportButton.style.color = 'white';
  exportButton.style.border = 'none';
  exportButton.style.padding = '10px 15px';
  exportButton.style.borderRadius = '5px';
  exportButton.style.cursor = 'pointer';
  
  exportButton.addEventListener('click', exportWebsiteData);
  
  container.appendChild(exportButton);
}

// Run when the page loads
document.addEventListener('DOMContentLoaded', addExportButton);