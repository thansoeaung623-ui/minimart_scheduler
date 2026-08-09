# Mini Mart Scheduler

## Overview
Mini Mart Scheduler is a lightweight React + Vite single-page app for managing staff shifts at a small retail store. It is designed for a Japanese mini-mart environment and includes scheduling rules, employee types, and local persistence for easy shift planning.

## Key Features
- Add and manage employees with three staff types: 学生 (Student), フリーランス (Free Lance), and 学生許可 (Student Allow).
- Track employee availability and assign shifts on a monthly calendar.
- Use a custom time picker for safe shift entry with no free-text input.
- Persist employee and schedule data locally using `localStorage`.
- Enforce shift rules:
  - Day shift (06:00–17:00): up to 2 staff per hour.
  - Night shift (22:00–02:00): up to 1 staff.
  - Owner-only window (02:00–06:30): requires confirmation and stricter handling.
- Show weekly hour totals and warn when employee weekly hour limits are exceeded.
- Includes light/dark theme support.
- Provides a quick shop location link using Google Maps.

## Technology Stack
- React 19
- Vite
- JavaScript / JSX
- Browser `localStorage`

## Project Structure
- `index.html` — app entry HTML
- `mini_mart_scheduler.jsx` — main scheduler component and app logic
- `src/App.jsx` — app export wrapper
- `src/main.jsx` — app bootstrap file
- `package.json` — dependencies and scripts
- `vite.config.js` — Vite configuration

## Usage
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the app in the browser using the URL provided by Vite.

## Notes
- The app is currently implemented as a single-page scheduling tool.
- There are no test scripts configured yet.
- Employee and schedule data remain saved across browser refreshes via `localStorage`.
