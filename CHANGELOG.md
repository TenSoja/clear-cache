# Changelog

All notable changes to this project will be documented in this file.

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
