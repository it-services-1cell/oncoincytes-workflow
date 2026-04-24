# Oncoincytes Workflow

A React + Vite workflow application for managing batches, test orders, and reports in a laboratory or clinical operations context.

## Features

- React 19 app built with Vite
- Client-side routing using `react-router-dom`
- Global state management with `zustand`
- Toast notifications via `react-hot-toast`
- Tailwind CSS-ready setup with PostCSS
- Workflow pages for batches, test orders, reports, and batch details

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm (included with Node.js)

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

Open the local URL shown in the terminal (usually `http://localhost:5173`).

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint the project

```bash
npm run lint
```

## Project Structure

```text
src/
  App.jsx           # root app component
  main.jsx          # app entry point
  index.css         # global styles
  assets/           # static images and assets
  components/       # reusable UI components
    Header.jsx
    Sidebar.jsx
  layouts/          # layout components
    MainLayout.jsx
  pages/            # routed page components
    BatchDetail.jsx
    Batches.jsx
    CPCWorkflow.jsx
    CreateBatch.jsx
    NewTestOrder.jsx
    Reports.jsx
    TestOrderDetail.jsx
    TestOrders.jsx
  store/
    useStore.js    # Zustand global store
vite.config.js     # Vite configuration
eslint.config.js   # ESLint setup
README.md          # project documentation
package.json       # npm package metadata
```

## Notes

- This repository is configured as a private project
- The app is ready for extension with backend integration and API data sources
