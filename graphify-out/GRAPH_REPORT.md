# Graph Report - App-React-Pro  (2026-10-20)

## Corpus Check
- 30 files · ~20,873 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 116 nodes · 302 edges · 19 communities (11 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `da4e6de3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PendingView.jsx
- AppContext.jsx
- App
- generate-vapid.mjs
- HistoryView.jsx
- Auth.jsx
- useDarkMode.js
- DashboardView.jsx
- Notificaciones con la PWA cerrada
- CLAUDE.md
- .claude/CLAUDE.md
- ref_react
- fluentMotion.js
- App.jsx
- BillModal.jsx
- utils.jsx
- HeaderMobile.jsx

## God Nodes (most connected - your core abstractions)
1. `App()` - 19 edges
2. `DashboardView()` - 13 edges
3. `formatMoney()` - 13 edges
4. `Card` - 11 edges
5. `Button` - 11 edges
6. `getCategoryLabel()` - 11 edges
7. `HistoryView()` - 10 edges
8. `PendingView()` - 10 edges
9. `getIcon()` - 8 edges
10. `Badge` - 7 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `Auth()`  [EXTRACTED]
  src/App.jsx → src/components/layout/Auth.jsx
- `App()` --calls--> `BillModal()`  [EXTRACTED]
  src/App.jsx → src/components/layout/BillModal.jsx
- `App()` --calls--> `HeaderMobile`  [EXTRACTED]
  src/App.jsx → src/components/layout/HeaderMobile.jsx
- `App()` --calls--> `InstallPromptModal()`  [EXTRACTED]
  src/App.jsx → src/components/layout/InstallPromptModal.jsx
- `App()` --calls--> `Sidebar`  [EXTRACTED]
  src/App.jsx → src/components/layout/Sidebar.jsx

## Import Cycles
- None detected.

## Communities (19 total, 8 thin omitted)

### Community 0 - "PendingView.jsx"
Cohesion: 0.47
Nodes (5): Badge, PendingView(), isOverdue(), staggerContainerVariants, staggerItemVariants

### Community 1 - "AppContext.jsx"
Cohesion: 0.16
Nodes (8): AppContext, AppProvider(), sanitizeBillFromStorage(), captureError(), initSentry(), setSentryUser(), setCustomCategoriesCache(), RootErrorBoundary

### Community 2 - "App"
Cohesion: 0.67
Nodes (5): App(), DeleteConfirmModal(), PayConfirmModal(), Button, getDiffDays()

### Community 3 - "generate-vapid.mjs"
Cohesion: 0.29
Nodes (4): privateJwk, publicJwk, { publicKey, privateKey }, publicVapidKey

### Community 4 - "HistoryView.jsx"
Cohesion: 0.35
Nodes (5): HistoryView(), exportToCSV(), exportToPDF(), fmt(), getCategoryLabel()

### Community 5 - "Auth.jsx"
Cohesion: 0.29
Nodes (6): Auth(), base64UrlToUint8Array(), disablePushNotifications(), enablePushNotifications(), ensurePushIsSupported(), supabase

### Community 7 - "useDarkMode.js"
Cohesion: 0.50
Nodes (4): applyThemeToDOM(), THEME_COLOR_DARK, THEME_COLOR_LIGHT, useDarkMode()

### Community 8 - "DashboardView.jsx"
Cohesion: 0.44
Nodes (6): Card, BudgetCard(), DashboardView(), SwipeableBillCard(), formatMoney(), formatMoneyProtected()

### Community 14 - "fluentMotion.js"
Cohesion: 0.29
Nodes (6): buttonInteractiveMotion, cardInteractiveMotion, fabInteractiveMotion, FLUENT_ACCELERATE_EASE, FLUENT_DECELERATE_EASE, pageEntranceVariants

### Community 16 - "BillModal.jsx"
Cohesion: 0.67
Nodes (3): BillModal(), DEFAULT_CATEGORIES, useApp()

### Community 17 - "utils.jsx"
Cohesion: 0.67
Nodes (3): cachedCategories, getCustomCategoriesCached(), getIcon()

## Knowledge Gaps
- **15 isolated node(s):** `DEFAULT_CATEGORIES`, `FLUENT_DECELERATE_EASE`, `FLUENT_ACCELERATE_EASE`, `cardInteractiveMotion`, `cachedCategories` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 40 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `App()` connect `App` to `PendingView.jsx`, `AppContext.jsx`, `HistoryView.jsx`, `Auth.jsx`, `useDarkMode.js`, `DashboardView.jsx`, `ref_react`, `App.jsx`, `BillModal.jsx`, `HeaderMobile.jsx`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `DEFAULT_CATEGORIES`, `FLUENT_DECELERATE_EASE`, `FLUENT_ACCELERATE_EASE` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._