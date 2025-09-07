<p align="center">
  <img src="https://img.shields.io/badge/Firefox-Developer%20Edition-orange?logo=firefox-browser" alt="Firefox Developer Edition" />
  <img src="https://img.shields.io/badge/WebExtensions-API-blue?logo=mozilla" alt="WebExtensions API" />
  <img src="https://img.shields.io/badge/JavaScript-ES6-yellow?logo=javascript" alt="JavaScript ES6" />
  <img src="https://img.shields.io/badge/HTML5-%23E34F26?logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-%231572B6?logo=css3&logoColor=white" alt="CSS3" />
</p>

<h1 align="center">🧹 Clear Cache</h1>
<p align="center">Add-on to clear browser cache with a single click or via the F9 key.</p>

<p align="center">
  <img src="https://img.shields.io/github/license/TenSoja/clear-cache" alt="License" />
  <img src="https://img.shields.io/github/stars/TenSoja/clear-cache" alt="Stars" />
  <img src="https://img.shields.io/github/forks/TenSoja/clear-cache" alt="Forks" />
  <img src="https://img.shields.io/github/issues/TenSoja/clear-cache" alt="Issues" />
  <img src="https://img.shields.io/github/last-commit/TenSoja/clear-cache" alt="Last Commit" />
  <img src="https://img.shields.io/badge/Firefox-58k%20users-orange?logo=firefox-browser" alt="Firefox Users" />
  <img src="https://img.shields.io/badge/Rating-4.4%2F5-green?logo=mozilla" alt="Rating" />
  <img src="https://img.shields.io/badge/Mozilla-Recommended-ff6c37?logo=firefox-browser" alt="Mozilla Recommended" />
</p>

## 🔒 Security & Privacy First

✅ **Zero Data Collection** - No personal data collected or transmitted  
✅ **Minimal Permissions** - Only requests necessary permissions  
✅ **Local Storage Only** - All preferences stored locally on your device  
✅ **Open Source** - Fully transparent code for security review  
✅ **Mozilla Verified** - Follows Mozilla's strict security guidelines

## ✨ Features

- 🚀 **One-click cache clearing** - Clear cache instantly with toolbar button
- ⌨️ **Keyboard shortcut** - Default F9 key (customizable)
- 🎯 **Selective clearing** - Choose what to clear (cache, cookies, history, etc.)
- ⏰ **Time-based clearing** - Clear data from last 15min, 1hour, 24hours, 1week, or all time
- 🎯 **Current tab only** - Option to clear data only for active tab
- 🔄 **Auto-reload** - Automatically reload page after clearing (configurable)
- 🔔 **Notifications** - Optional confirmation notifications
- 🌍 **Multi-language** - Support for 8 languages
- 🎨 **Context menu** - Right-click extension icon for quick actions

## 🚀 Quick Start

1. **Install** the extension from Firefox Add-ons store
2. **Click** the broom icon in your toolbar
3. **Customize** settings via right-click → Options
4. **Use F9** for quick cache clearing

> **Tip:** Right-click the extension icon for context menu options!


## What?
Clear Cache is a Firefox extension that solves a common developer pain point: the tedious process of clearing browser cache. Instead of navigating through multiple menus, you get instant cache clearing with a single click or F9 key press.

## How?
The addon allows you to quickly clear your browser cache with a single command.

### Customize!
You can customize what you clear and what happens after clearing the cache: reload the current tab and/or display a notification. You can also select the time period to clear data from (e.g., last 15 minutes, last hour, or all time).

## Development

### Prerequisites
- [Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/developer/) (recommended for testing)
- Basic knowledge of [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

### Installation for Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TenSoja/clear-cache.git
   cd clear-cache
   ```

2. **Load the extension in Firefox:**
   - Open Firefox Developer Edition
   - Navigate to `about:debugging`
   - Click "This Firefox" 
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from the cloned repository

3. **Test the extension:**
   - Click the Clear Cache icon in the toolbar
   - Or press F9 (default keyboard shortcut)
   - Access options via `about:addons` > Clear Cache > Preferences
   - Try different time period options (All time, Last 15 minutes, Last hour, etc.)

### Testing in Firefox Developer Edition

Before submitting any changes, always test in [Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/developer/):

1. Load the extension using the steps above
2. Test basic functionality (click to clear cache)
3. Test keyboard shortcut (F9)
4. Test options page (customize settings)
5. Test different time period selections (15 minutes, 1 hour, etc.)
6. Check browser console for any errors
7. Verify permissions are working correctly

### Project Structure

```
clear-cache/
├── manifest.json          # Extension configuration
├── background.js          # Background script handling cache clearing
├── options/              # Settings page
│   ├── options.html      # Options page HTML
│   ├── options.js        # Options page logic
│   └── options.css       # Options page styling
├── _locales/             # Internationalization files
│   ├── en/               # English translations
│   └── .../              # Other language translations
├── icons/                # Extension icons
└── README.md             # This file
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Test your changes in Firefox Developer Edition
4. Ensure your changes follow [Mozilla's WebExtension guidelines](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
5. Submit a pull request with a clear description of changes

### Permissions Explained

- **`browsingData`**: Required to clear browser cache and other browsing data
- **`notifications`**: Used to show confirmation when cache is cleared  
- **`storage`**: Used to save user preferences locally
- **`contextMenus`**: Enables right-click menu options

## 🤝 Contributors

Thanks to all contributors who helped improve this project!

**Project Creator & Lead Developer:**
- **Michel de Almeida Silva** ([@TenSoja](https://github.com/TenSoja)) - Creator & Primary Maintainer

**Special Thanks to Contributors:**
- **Heimen Stoffels** - Added Dutch translation
- **zer0-x** - Added Arabic localization  
- **Tomáš Beránek** - Added Czech language support
- **medwuu** - Added Russian localization
- **Ariel Xinyue Wang** - File contributions & improvements

<a href="https://github.com/TenSoja/clear-cache/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=TenSoja/clear-cache" />
</a>

## 🛣️ Roadmap

### 🎯 #1 Priority: Site-Specific Cleaning (Goal: $30 on Buy Me a Coffee)
- [ ] **Site-specific cleaning** - Target specific websites for cache clearing
  - [ ] Domain-based filtering (e.g., clear only github.com data)
  - [ ] Selective data types per site (cache, cookies, localStorage)
  - [ ] Favorite sites list for quick access
  - [ ] Advanced site management interface

*Always working on the #1 priority item first! Help us reach the $30 funding goal to unlock this game-changing feature.*

### 🔮 Future Features
- [ ] **Site-specific cleaning** - Target specific websites for cache clearing ([📋 Issue #24 - $30 funding goal](https://github.com/TenSoja/clear-cache/issues/24))
- [ ] Chrome/Edge support
- [ ] Scheduled automatic clearing
- [ ] Integration with dev tools
- [ ] Custom keyboard shortcuts
- [ ] Dark theme for options page
- [ ] Export/Import settings
- [ ] Bulk site operations
- [ ] Developer tools integration

## 📈 Usage Impact

This extension has helped thousands of developers save time by:
- ⚡ Reducing cache clearing time from 5+ clicks to 1 click
- 🔄 Automating the reload process
- 🎯 Providing granular control over what gets cleared
- ⏰ Offering time-based clearing options

## Buy me a coffee

**🎯 Support Site-Specific Cleaning!**  
Help me reach the $30 goal to unlock **targeted data cleaning** - clear cache, cookies, and storage for specific websites only! Perfect for developers who need granular control.

![Funding Progress](https://img.shields.io/badge/funding-$0%2F$30-red?style=for-the-badge&logo=buymeacoffee)
[📈 Track Progress on GitHub Issue](https://github.com/TenSoja/clear-cache/issues/24)

I also ask for the support of those of you who follow the project, your contribution is very important.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/tensoja)