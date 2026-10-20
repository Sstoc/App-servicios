# Graph Report - App-React-Pro  (2026-10-07)

## Corpus Check
- 29 files · ~20,074 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 103 nodes · 252 edges · 13 communities (8 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7ab90977`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- utils.jsx
- AppContext.jsx
- App.jsx
- generate-vapid.mjs
- HistoryView.jsx
- pushNotifications.js
- useDarkMode.js
- DashboardView.jsx
- Notificaciones con la PWA cerrada
- CLAUDE.md
- .claude/CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `App()` - 19 edges
2. `Card` - 16 edges
3. `DashboardView()` - 13 edges
4. `formatMoney()` - 13 edges
5. `Button` - 11 edges
6. `getCategoryLabel()` - 11 edges
7. `HistoryView()` - 10 edges
8. `PendingView()` - 10 edges
9. `getIcon()` - 8 edges
10. `PayConfirmModal()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `DashboardView()`  [EXTRACTED]
  src/App.jsx → src/components/views/DashboardView.jsx
- `App()` --calls--> `HistoryView()`  [EXTRACTED]
  src/App.jsx → src/components/views/HistoryView.jsx
- `App()` --calls--> `PendingView()`  [EXTRACTED]
  src/App.jsx → src/components/views/PendingView.jsx
- `App()` --calls--> `useDarkMode()`  [EXTRACTED]
  src/App.jsx → src/hooks/useDarkMode.js
- `App()` --calls--> `enablePushNotifications()`  [EXTRACTED]
  src/App.jsx → src/lib/pushNotifications.js

## Import Cycles
- None detected.

## Communities (13 total, 5 thin omitted)

### Community 0 - "utils.jsx"
Cohesion: 0.46
Nodes (6): Badge, PendingView(), cachedCategories, getCustomCategoriesCached(), getIcon(), isOverdue()

### Community 1 - "AppContext.jsx"
Cohesion: 0.16
Nodes (8): AppContext, AppProvider(), sanitizeBillFromStorage(), captureError(), initSentry(), setSentryUser(), setCustomCategoriesCache(), RootErrorBoundary

### Community 2 - "App.jsx"
Cohesion: 0.25
Nodes (14): App(), Auth(), BillModal(), DEFAULT_CATEGORIES, DeleteConfirmModal(), HeaderMobile, InstallPromptModal(), PayConfirmModal() (+6 more)

### Community 3 - "generate-vapid.mjs"
Cohesion: 0.29
Nodes (4): privateJwk, publicJwk, { publicKey, privateKey }, publicVapidKey

### Community 4 - "HistoryView.jsx"
Cohesion: 0.35
Nodes (5): HistoryView(), exportToCSV(), exportToPDF(), fmt(), getCategoryLabel()

### Community 5 - "pushNotifications.js"
Cohesion: 0.43
Nodes (4): base64UrlToUint8Array(), enablePushNotifications(), ensurePushIsSupported(), supabase

### Community 7 - "useDarkMode.js"
Cohesion: 0.50
Nodes (4): applyThemeToDOM(), THEME_COLOR_DARK, THEME_COLOR_LIGHT, useDarkMode()

### Community 8 - "DashboardView.jsx"
Cohesion: 0.46
Nodes (5): BudgetCard(), DashboardView(), SwipeableBillCard(), formatMoney(), formatMoneyProtected()

## Knowledge Gaps
- **12 isolated node(s):** `{ publicKey, privateKey }`, `publicJwk`, `privateJwk`, `publicVapidKey`, `DEFAULT_CATEGORIES` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 37 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `App()` connect `App.jsx` to `utils.jsx`, `AppContext.jsx`, `HistoryView.jsx`, `pushNotifications.js`, `useDarkMode.js`, `DashboardView.jsx`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **What connects `{ publicKey, privateKey }`, `publicJwk`, `privateJwk` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._