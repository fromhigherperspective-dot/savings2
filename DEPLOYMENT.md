# Monthly Budgeting App

A centralized budgeting application for Nuone and Kate to track income, savings, and withdrawals with a shared savings goal.

## Features

- **User Management**: Toggle between Nuone and Kate
- **Income/Savings Tracking**: Add income and savings contributions
- **Withdrawal Management**: Record withdrawals with reasons
- **Savings Goal**: Track progress toward 150,000 AED goal (editable by Nuone only)
- **Centralized Data**: Server-side storage using Vercel KV
- **Real-time Sync**: All users see the same data

## Deployment Options

### Option 1: Direct Vercel Upload
1. Go to [vercel.com](https://vercel.com)
2. Drag and drop this entire folder
3. Add Vercel KV database in dashboard
4. Deploy

### Option 2: GitHub + Vercel
1. Push this folder to GitHub repository
2. Connect GitHub repo to Vercel
3. Add Vercel KV database in dashboard
4. Auto-deploys on commits

## Setup Vercel KV Database

1. In Vercel dashboard, go to your project
2. Click "Storage" tab
3. Click "Create Database" → "KV"
4. Name it "budget-data"
5. Environment variables will be auto-configured

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Data Structure

```json
{
  "users": {
    "Nuone": {
      "total": 0,
      "transactions": []
    },
    "Kate": {
      "total": 0,
      "transactions": []
    }
  },
  "grandTotal": 0,
  "goal": 150000,
  "transactions": []
}
```