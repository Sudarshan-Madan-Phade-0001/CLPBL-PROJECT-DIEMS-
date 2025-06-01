# Site Blocker Extension

This Chrome extension works with the Screen Time Tracker web app to block websites when time limits are reached and show notifications.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked" and select this folder
4. The extension should now be installed

## Features

- Automatically blocks websites when time limits are reached
- Shows a notification when time is up
- Redirects to a blocked page when trying to access limited websites
- Integrates with the Screen Time Tracker web app

## Getting Your Extension ID

After installing the extension:

1. Go to `chrome://extensions/`
2. Find "Site Blocker" in the list
3. Copy the ID shown under the extension name
4. Update the `EXTENSION_ID` in the website-blocker.html file

## How It Works

1. The web app sends website limits to the extension
2. The extension monitors website navigation
3. When a time limit is reached, the extension blocks the website
4. Users are redirected to a blocked page or shown a notification

## Files

- `manifest.json`: Extension configuration
- `background.js`: Background script that monitors navigation
- `content.js`: Content script that shows notifications
- `blocked.html`: Page shown when a website is blocked