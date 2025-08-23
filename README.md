# Clear Cache
Add-on to clear browser cache with a single click or via the F9 key.

## What?
Clear Cache is a browser extension. They can extend and modify the capability of a browser.

## Why?
Often the work of a web developer can be hampered by the browser's cache, clearing the cache becomes routine work.

## How?
The addon allows you to quickly clear your browser cache with a single command.

### Customize!
You can customize what you clear and what happens after clearing the cache: reload the current tab and/or display a notification.

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

### Testing in Firefox Developer Edition

Before submitting any changes, always test in [Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/developer/):

1. Load the extension using the steps above
2. Test basic functionality (click to clear cache)
3. Test keyboard shortcut (F9)
4. Test options page (customize settings)
5. Check browser console for any errors
6. Verify permissions are working correctly

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

### Security and Privacy

This extension:
- Only requests necessary permissions (`browsingData`, `notifications`, `storage`)
- Stores preferences locally using the WebExtensions storage API
- Does not collect or transmit any personal data
- Follows Mozilla's security best practices

### Permissions Explained

- `browsingData`: Required to clear browser cache and other browsing data
- `notifications`: Used to show confirmation when cache is cleared
- `storage`: Used to save user preferences locally

## Buy me a coffee
I also ask for the support of those of you who follow the project, your contribution is very important.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/tensoja)

