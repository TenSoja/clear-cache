<!-- Firefox extension, cache cleaner, WebExtension, privacy, open source, browser, performance -->

<p align="center">
  <img src="icons/broom-128.png" alt="Clear Cache Icon" width="128" height="128">
</p>

<h1 align="center">Clear Cache</h1>
<p align="center">Clear browser cache with a single click or F9 key.</p>

<p align="center">
  <img src="https://img.shields.io/badge/Firefox-v4.8-orange?logo=firefox-browser" alt="Firefox v4.8" />
  <img src="https://img.shields.io/github/license/TenSoja/clear-cache" alt="License" />
  <img src="https://img.shields.io/badge/Firefox-58k%20users-orange?logo=firefox-browser" alt="Firefox Users" />
  <img src="https://img.shields.io/badge/Rating-4.4%2F5-green?logo=mozilla" alt="Rating" />
  <img src="https://img.shields.io/badge/Mozilla-Recommended-ff6c37?logo=firefox-browser" alt="Mozilla Recommended" />
</p>

<p align="center">
  <strong>📱 Available on Firefox Desktop & Android</strong>
</p>

---

## 🆕 What's New in v4.8

### 🐛 Critical Bug Fixes
- **Fixed options i18n** - Correctly loads localized labels in the options page
- **Fixed empty settings race** - Default settings are now applied on first click

### ⚠️ Important API Limitations (Now Documented)
Due to Firefox API restrictions, when using "Site data only (cookies/storage)":
- ✅ **Works correctly**: Cookies, Local Storage, IndexedDB, Service Workers
- ❌ **Not supported per-site (skipped)**: Cache, History, Downloads, Form Data, Passwords
  - Reference: MDN [`browsingData.RemovalOptions`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browsingData/RemovalOptions) and [`browsingData.removeCache`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browsingData/removeCache).

### 🎨 UX Improvements
- **Site data only label** - Clarified option text to avoid cache confusion
- **Warning messages in Options** - Clear visual indicators when "Site data only" is enabled
- **Blocked action badge** - Shows a `!` badge when the action can't run (e.g., site-only with incompatible types)
- **Debug mode** - Optional console logs to help investigate issues

### 🔄 Changed
- **Default behavior**: "Site data only" is now OFF by default (global cache clearing)

---

<details>
<summary>📜 Previous Releases</summary>

### v4.5 Highlights
- Fixed "Current Tab Only" API usage
- Context menu now respects time period settings
- Better error handling for special URLs
- Improved CSS and i18n

</details>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🚀 **One-click clearing** | Click toolbar icon or press F9 |
| 🎯 **Site data only** | Clear site data only for active site (cookies/storage/etc.) |
| ⏰ **Time periods** | 15min, 1hour, 24hours, 1week, or all time |
| 🎨 **Selective clearing** | Cache, cookies, history, localStorage, etc. |
| 🔄 **Auto-reload** | Reload page after clearing (configurable) |
| 🔔 **Notifications** | Confirmation of what was cleared |
| 🌍 **8 languages** | EN, PT-BR, RU, AR, CS, NL, ZH-CN, ZH-TW |

---

## 🚀 Quick Start

1. **Install** from [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/clearcache/)
2. **Click** the broom icon → clears cache globally (default)
3. **Customize** via right-click → Options

> **Tip:** Press F9 for quick cache clearing!

---

## 🔒 Privacy First

- **Zero data collection** - Nothing is sent anywhere
- **Local storage only** - Preferences stay on your device
- **Open source** - Full code transparency
- **Mozilla verified** - Follows strict security guidelines

---

## ⚙️ Default Behavior

When you install and click without configuring:

| Setting | Default | Effect |
|---------|---------|--------|
| Data types | Cache only | Doesn't touch cookies/history |
| Scope | All sites | Clears cache globally |
| Time period | All time | Clears entire cache globally |
| Auto-reload | Yes | Refreshes page after clearing |
| Notification | Yes | Shows confirmation |

---

## 💻 Development

### Load for Testing

```bash
git clone https://github.com/TenSoja/clear-cache.git
```

1. Open `about:debugging` in Firefox
2. Click "This Firefox" → "Load Temporary Add-on"
3. Select `manifest.json`

### Project Structure

```
clear-cache/
├── manifest.json      # Extension config
├── background.js      # Cache clearing logic
├── options/           # Settings page
├── _locales/          # Translations (8 languages)
└── icons/             # Extension icons
```

### Permissions

| Permission | Why |
|------------|-----|
| `browsingData` | Clear cache and browsing data |
| `tabs` | Detect current tab for site-specific clearing |
| `storage` | Save user preferences |
| `notifications` | Show clearing confirmation |
| `contextMenus` | Right-click menu options |

---

## 🤝 Contributors

**Creator:** [Michel de Almeida Silva](https://github.com/TenSoja)

**Translators:** Heimen Stoffels (NL), zer0-x (AR), Tomáš Beránek (CS), medwuu (RU), Ariel Xinyue Wang (ZH)

<a href="https://github.com/TenSoja/clear-cache/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=TenSoja/clear-cache" />
</a>

---

## ☕ Support

Use the **❤️ Sponsor** button to support development via Buy Me a Coffee!

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/TenSoja">TenSoja</a><br>
  <sub>🇧🇷 Amazon | 🧹 Cleaning the web, one cache at a time</sub>
</p>
