# Changelog

All notable changes to this project will be documented in this file.

## [4.9] - 2026-02-06

### 🐛 Fixed
- **Options i18n**: Fixed localization of options labels
- **Empty settings race**: Default settings are now applied on first click

### 🔄 Changed
- **Default behavior**: "Site data only" is now OFF by default (global cache clearing)
- **Options label**: Renamed to "Site data only (cookies/storage)" to reflect API limits
- **Icons**: Switched toolbar and notification icons to PNG variants for stability
- **Minimum Firefox versions**: Desktop 140+ and Android 142+ (AMO requirement for data_collection_permissions)

### ✨ Added
- **Blocked action badge**: Shows `!` on the toolbar icon when action can't run
- **Debug mode**: Optional console logs for troubleshooting
- **Options guard**: Prevents invalid site-only selections by enforcing compatible types

---

## [4.7] - 2026-01-25

### 🐛 Fixed
- **Current tab only**: Prevented clearing all data globally when site-only is enabled

### ✨ Added
- **Options warning**: Clarified which data types are supported for site-only mode

### ⚠️ Known Issues
- **Firefox Beta freeze (148.0b6+)**: Reported UI hang when clicking the toolbar icon or saving Options in Firefox Beta (Windows 11). Still under investigation.

---

## [4.5] - 2025-12-19

### 🐛 Fixed
- **Critical Bug**: "Current tab only" option now works correctly. Was using Chrome's `origins` API parameter instead of Firefox's `hostnames`
- **Context Menu timePeriod**: Context menu now respects the saved time period instead of always clearing "all time"
- **Undefined URL Handling**: Fixed potential exception when `currentTab.url` is undefined
- **CSS Selector**: Fixed `section.clear-options` to `fieldset.clear-options` to match HTML
- **Notification Spacing**: Fixed double spaces in notification messages when not using current tab mode

### 🔄 Changed
- **Default Behavior**: `currentTabOnly` is now `true` by default. New installs will clear cache only for the active site, not globally

### ✨ Added
- **Unsupported URL Error**: Clear error message when trying to clear cache for special pages (`about:`, `file://`, `moz-extension://`, etc.) instead of silently falling back to global clearing
- **Missing Translations**: Added `unsupportedUrlMessage` and other missing keys to pt_BR locale

### 🛠️ Improved
- **Settings Validation**: Robust type checking for all stored settings with automatic correction of invalid values
- **Empty DataTypes Handling**: Early return when no data types are selected, avoiding unnecessary API calls
- **Context Menu**: Now respects `currentTabOnly` setting instead of always clearing globally
- **Internationalization**: "(aba atual)" label is now properly internationalized as `currentTabLabel`

---

## [4.4.0] - 2025-09-07

### 🆕 Added
- **Time Period Selection**: Choose what timeframe to clear (15min, 1hour, 24hours, 1week, all time)
- **Current Tab Only**: Option to clear data only for the active tab using origin-based filtering
- **Enhanced Context Menu**: Right-click extension icon for "Clear Cache & Reload" action
- **Smart Notifications**: Time period information included in notifications
- **Firefox Android Compatibility**: Full compatibility with Firefox for Android (requires Firefox 113+)

### 🛠️ Improved
- **Background Script**: Optimized event handling and memory usage
- **Options Page**: Enhanced UI with new time period and current tab controls
- **Notifications**: More informative messages showing cleared data types and time periods
- **Internationalization**: Updated all 8 language files with new strings

### 🔧 Technical
- **Manifest**: Added `browser_specific_settings` for version compatibility
- **API Usage**: Enhanced `browsingData.remove()` with origin filtering and timestamps
- **Code Structure**: Improved error handling and function organization

### 📋 Issues Resolved
- **Issue #12**: Time-based cache clearing
- **Issue #15**: Current tab only functionality  
- **Issue #16**: Context menu enhancements

## [4.3.0] - Previous Release
- Base functionality with selective data type clearing
- Multi-language support
- Basic options page
- Keyboard shortcuts (F9)

---

**Note**: This extension maintains backward compatibility. All existing settings and preferences are preserved when updating to v4.4.
