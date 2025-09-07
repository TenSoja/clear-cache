---
name: 🎯 Site-Specific Cleaning Feature
about: Track development of targeted website data cleaning
title: '[FEATURE] Site-Specific Cleaning Implementation'
labels: ['enhancement', 'feature', 'funding-goal']
assignees: ['TenSoja']
---

## 🎯 Feature Overview
Implement site-specific data cleaning to allow users to clear cache, cookies, and storage for specific websites only.

## 💰 Funding Goal
**Target:** $30 on Buy Me a Coffee  
**Current Progress:** [Link to Buy Me a Coffee page](https://www.buymeacoffee.com/tensoja)

## 📋 Implementation Tasks

### Phase 1: Core Infrastructure
- [ ] Add site management UI to options page
- [ ] Implement domain validation and parsing
- [ ] Create site storage system (favorites/recents)
- [ ] Add new permissions if needed (`tabs`, `activeTab`)

### Phase 2: Site-Specific Clearing
- [ ] Implement domain-based filtering for `browsingData.remove()`
- [ ] Add origin-specific data clearing
- [ ] Support for wildcard domains (*.example.com)
- [ ] Selective data types per site

### Phase 3: Enhanced UX
- [ ] Quick site selector in popup/context menu
- [ ] Recently visited sites auto-suggestion
- [ ] Favorite sites management
- [ ] Site-specific clearing history

### Phase 4: Advanced Features
- [ ] Bulk site operations
- [ ] Site grouping (dev, prod, test environments)
- [ ] Export/import site lists
- [ ] Statistics per site

## 🎨 UI Mockup Ideas

### Options Page Addition:
```
┌─────────────────────────────────────┐
│ Site-Specific Cleaning              │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Add Site: [example.com        ] │ │
│ │          [+ Add]                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Favorite Sites:                     │
│ • github.com        [Clear] [Edit]  │
│ • localhost:3000    [Clear] [Edit]  │
│ • stackoverflow.com [Clear] [Edit]  │
│                                     │
│ ☑ Show recent sites automatically   │
│ ☑ Enable wildcard domains          │
└─────────────────────────────────────┘
```

### Context Menu Addition:
```
Clear Cache
├─ Clear cache and reload page
├─ ────────────────────────────
├─ Clear for this site only
└─ Site-specific options...
```

## 🔧 Technical Implementation

### New Files:
- `js/site-manager.js` - Site management logic
- `js/domain-utils.js` - Domain parsing utilities
- `css/site-options.css` - Site-specific UI styling

### Modified Files:
- `background.js` - Add site-specific clearing functions
- `options/options.html` - Add site management UI
- `options/options.js` - Site management interactions
- `manifest.json` - Add required permissions
- `_locales/*/messages.json` - Add new i18n strings

### API Usage:
```javascript
// Clear data for specific origin
browser.browsingData.remove({
  origins: ["https://example.com"]
}, {
  cache: true,
  cookies: true,
  localStorage: true
});
```

## 🧪 Testing Checklist
- [ ] Domain validation works correctly
- [ ] Wildcard domains function properly
- [ ] Data clearing is truly site-specific
- [ ] UI is intuitive and responsive
- [ ] i18n works for all supported languages
- [ ] No data loss for non-targeted sites
- [ ] Performance impact is minimal

## 📖 Documentation Updates
- [ ] Update README with new feature
- [ ] Add screenshots to options page
- [ ] Update permissions explanation
- [ ] Add troubleshooting section

## 🎯 Acceptance Criteria
- [ ] Users can add/remove favorite sites
- [ ] Site-specific clearing works for cache, cookies, localStorage
- [ ] UI is integrated seamlessly with existing options
- [ ] Feature is fully internationalized
- [ ] Zero impact on existing functionality
- [ ] Performance remains optimal

---

**Note:** This feature will be implemented once the funding goal of $30 is reached on Buy Me a Coffee. Thank you for your support! 🙏
