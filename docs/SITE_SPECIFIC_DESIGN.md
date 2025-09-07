# Site-Specific Cleaning - Technical Design Document

## 📋 Overview
Implementar limpeza direcionada por site/domínio, permitindo aos usuários limpar cache, cookies e dados apenas de sites específicos.

## 🎯 Core Features

### 1. Site Management System
```javascript
// Estrutura de dados para sites favoritos
const siteData = {
  favoriteSites: [
    {
      id: 'github-com',
      domain: 'github.com',
      displayName: 'GitHub',
      dataTypes: ['cache', 'cookies', 'localStorage'],
      addedDate: 1694097600000,
      lastUsed: 1694097600000,
      useCount: 15
    }
  ],
  recentSites: [
    { domain: 'stackoverflow.com', lastVisit: 1694097600000 },
    { domain: 'developer.mozilla.org', lastVisit: 1694097500000 }
  ],
  settings: {
    showRecentSites: true,
    enableWildcards: true,
    maxRecentSites: 10
  }
};
```

### 2. Domain Utilities
```javascript
// js/domain-utils.js
class DomainUtils {
  static validateDomain(domain) {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
  }

  static normalizeUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.origin;
    } catch (e) {
      return null;
    }
  }

  static matchesWildcard(domain, pattern) {
    if (!pattern.includes('*')) return domain === pattern;
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(domain);
  }

  static getCurrentTabDomain() {
    return browser.tabs.query({active: true, currentWindow: true})
      .then(tabs => {
        if (tabs.length > 0) {
          try {
            return new URL(tabs[0].url).hostname;
          } catch (e) {
            return null;
          }
        }
        return null;
      });
  }
}
```

### 3. Site-Specific Clearing Logic
```javascript
// Adição ao background.js
async function clearSiteSpecific(domain, dataTypes = ['cache']) {
  try {
    // Normalizar domínio para origin
    const origins = [`https://${domain}`, `http://${domain}`];
    
    // Converter tipos de dados
    const removeOptions = {};
    dataTypes.forEach(type => {
      removeOptions[type] = true;
    });

    // Limpar dados específicos do site
    await browser.browsingData.remove({
      origins: origins,
      since: 0
    }, removeOptions);

    // Notificar sucesso
    if (storedSettings.notification) {
      browser.notifications.create({
        type: "basic",
        title: browser.i18n.getMessage("extensionName"),
        message: browser.i18n.getMessage("siteSpecificCleared", [domain, dataTypes.join(", ")]),
        iconUrl: browser.runtime.getURL('/icons/broom.svg')
      });
    }

    return true;
  } catch (error) {
    console.error('Site-specific clearing failed:', error);
    return false;
  }
}

// Função para limpar site atual
async function clearCurrentSite() {
  const domain = await DomainUtils.getCurrentTabDomain();
  if (domain) {
    const settings = await browser.storage.local.get();
    return clearSiteSpecific(domain, settings.dataTypes || ['cache']);
  }
  return false;
}
```

### 4. UI Components

#### Options Page Addition:
```html
<!-- Adição ao options.html -->
<fieldset class="site-specific-options">
  <legend data-i18n="__MSG_siteSpecificTitle__">Site-Specific Cleaning</legend>
  
  <div class="add-site-section">
    <label for="siteInput" data-i18n="__MSG_addSiteLabel__">Add Site:</label>
    <div class="input-group">
      <input type="text" id="siteInput" placeholder="example.com" />
      <button id="addSiteBtn" data-i18n="__MSG_addSiteButton__">Add</button>
    </div>
  </div>

  <div class="current-site-section">
    <button id="addCurrentSiteBtn" data-i18n="__MSG_addCurrentSite__">
      Add Current Site
    </button>
    <span id="currentSiteDisplay"></span>
  </div>

  <div class="favorite-sites-section">
    <h4 data-i18n="__MSG_favoriteSites__">Favorite Sites:</h4>
    <div id="favoriteSitesList" class="sites-list">
      <!-- Dinamicamente populado -->
    </div>
  </div>

  <div class="recent-sites-section">
    <label for="showRecentSites">
      <input type="checkbox" id="showRecentSites" />
      <span data-i18n="__MSG_showRecentSites__">Show recent sites</span>
    </label>
  </div>
</fieldset>
```

#### Site Item Template:
```html
<div class="site-item" data-domain="{domain}">
  <div class="site-info">
    <span class="site-name">{displayName}</span>
    <span class="site-domain">{domain}</span>
  </div>
  <div class="site-actions">
    <button class="clear-site-btn" data-i18n="__MSG_clearSite__">Clear</button>
    <button class="edit-site-btn" data-i18n="__MSG_editSite__">Edit</button>
    <button class="remove-site-btn" data-i18n="__MSG_removeSite__">Remove</button>
  </div>
</div>
```

### 5. Context Menu Integration
```javascript
// Adição ao background.js para context menu
browser.contextMenus.create({
  id: "clear-current-site",
  title: browser.i18n.getMessage("clearCurrentSite"),
  contexts: ["browser_action"]
});

browser.contextMenus.create({
  id: "site-specific-options",
  title: browser.i18n.getMessage("siteSpecificOptions"),
  contexts: ["browser_action"]
});

// Handler para context menu
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "clear-current-site") {
    clearCurrentSite();
  } else if (info.menuItemId === "site-specific-options") {
    browser.runtime.openOptionsPage();
  }
});
```

### 6. Internationalization Additions
```json
// _locales/en/messages.json additions
{
  "siteSpecificTitle": {
    "message": "Site-Specific Cleaning",
    "description": "Title for site-specific cleaning section"
  },
  "addSiteLabel": {
    "message": "Add Site:",
    "description": "Label for add site input"
  },
  "addSiteButton": {
    "message": "Add",
    "description": "Button to add a site"
  },
  "addCurrentSite": {
    "message": "Add Current Site",
    "description": "Button to add current tab's site"
  },
  "favoriteSites": {
    "message": "Favorite Sites:",
    "description": "Header for favorite sites list"
  },
  "clearSite": {
    "message": "Clear",
    "description": "Button to clear site data"
  },
  "editSite": {
    "message": "Edit",
    "description": "Button to edit site settings"
  },
  "removeSite": {
    "message": "Remove",
    "description": "Button to remove site from favorites"
  },
  "clearCurrentSite": {
    "message": "Clear current site only",
    "description": "Context menu item to clear current site"
  },
  "siteSpecificOptions": {
    "message": "Site-specific options...",
    "description": "Context menu item to open site options"
  },
  "siteSpecificCleared": {
    "message": "Cleared $1 data for $2",
    "description": "Notification when site data is cleared"
  },
  "showRecentSites": {
    "message": "Show recent sites automatically",
    "description": "Option to show recent sites"
  }
}
```

### 7. Storage Schema
```javascript
// Estrutura de armazenamento expandida
const defaultSettings = {
  // Configurações existentes
  reload: true,
  notification: true,
  dataTypes: ["cache"],
  timePeriod: "all",
  currentTabOnly: false,
  
  // Novas configurações site-specific
  siteSpecific: {
    favoriteSites: [],
    recentSites: [],
    showRecentSites: true,
    enableWildcards: true,
    maxRecentSites: 10
  }
};
```

## 🔧 Implementation Steps

1. **Setup base structure** - Create utility files and extend storage
2. **Add UI components** - Integrate site management into options page
3. **Implement core logic** - Site-specific clearing functionality
4. **Add context menu items** - Quick access from browser action
5. **Internationalization** - Add all required i18n strings
6. **Testing & Polish** - Ensure everything works seamlessly

## 📊 Performance Considerations

- **Lazy loading** - Only load site data when needed
- **Efficient storage** - Use compression for large site lists
- **Background limits** - Limit recent sites list size
- **Memory management** - Clean up unused data regularly

## 🔐 Security & Permissions

**Required new permissions:**
- `tabs` - Para obter informação do site atual
- Possibly `activeTab` - Para interação com aba ativa

**Privacy considerations:**
- Sites são armazenados localmente apenas
- Nenhum dado é transmitido externamente
- Usuário tem controle total sobre lista de sites

---

*Este documento será usado como base para implementação após atingir a meta de $30 no Buy Me a Coffee.*
