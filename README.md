# Expense Tracker

A personal finance web app for tracking income and expenses, managing category budgets with automatic threshold alerts, visualizing spending, and exporting reports — built with React and Firebase.

**Live app:** [expense-tracker-navy-omega.vercel.app](https://expense-tracker-navy-omega.vercel.app)

## Features

- Email/password and Google sign-in
- Add, edit, delete, search, filter, and sort transactions
- Category-wise spending breakdown
- Budgets per category (Weekly/Monthly/Yearly) with automatic alerts when a budget is close to or over its limit
- Dashboard with current-month income/expense/balance and all-time personal savings
- Analytics charts filterable by week, month, or year
- Reports with income/expense/balance summary and CSV, PDF, and Excel export
- In-app notifications (unread/read/deleted), with a date filter on read messages
- Dark/light theme, currency selector (INR/USD/EUR), and a notifications on/off toggle — all synced to your account, not just the device
- Data backup export, clear-all-data, and delete-account options

## Tech Stack

- **Frontend:** React 19, React Router v7, Context API, custom hooks, recharts, framer-motion, react-toastify
- **Backend:** Firebase Authentication + Cloud Firestore (no custom server)
- **Exports:** jsPDF, react-csv, xlsx (SheetJS)
- **Hosting:** Vercel

## Data Model

All data lives under a single Firestore document per user:

```
users/{uid}                    → profile fields + preferences (theme, currency, notifications)
 ├─ transactions/{id}
 ├─ budgets/{id}
 └─ notifications/{id}
```

## Getting Started

```bash
npm install
```

Create a `.env` file in the project root (see `.env.example`) with your own Firebase project config:

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

Then run:

```bash
npm start
```

Opens the app at [http://localhost:3000](http://localhost:3000).

```bash
npm run build
```

Builds a production bundle to `/build`.

## Deployment

Deployed on Vercel, built from the `main` branch. Since Create React App inlines `REACT_APP_*` environment variables at build time, they must be set in Vercel's Environment Variables panel (Production), and a fresh deploy with the build cache disabled is required after changing them.
