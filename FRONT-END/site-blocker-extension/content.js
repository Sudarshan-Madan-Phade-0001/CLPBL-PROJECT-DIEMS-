chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === "showTimeUpNotification") {
    showTimeUpNotification(message.website);
    sendResponse({success: true});
    return true;
  }
});

function showTimeUpNotification(website) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    text-align: center;
    font-family: Arial, sans-serif;
  `;
  
  overlay.innerHTML = `
    <h1 style="color: #077b32; font-size: 2.5rem; margin-bottom: 1rem;">Time's Up!</h1>
    <p style="font-size: 1.5rem; margin: 1rem 0;">Your time limit for ${website} has been reached.</p>
    <p style="font-size: 1.2rem; margin-bottom: 2rem;">Return to Screen Time Tracker to start your focus session.</p>
    <button style="background: #077b32; color: white; border: none; padding: 1rem 2rem; font-size: 1.2rem; cursor: pointer; border-radius: 5px;">Return to App</button>
  `;
  
  document.body.appendChild(overlay);
  
  overlay.querySelector('button').addEventListener('click', function() {
    window.close();
  });
}