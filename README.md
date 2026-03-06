# FLOW – Real-Time Bus Tracking System

FLOW is a lightweight smart transport solution designed for tier-2 cities and villages to provide real-time bus tracking and improve public transportation reliability.

---

## Problem

• No real-time bus tracking in tier-2 cities and villages
• Passengers wait long without knowing bus arrival time
• Language barriers for travelers inside Tamil Nadu
• No alert system when buses approach a stop
• Passengers cannot see crowd levels before boarding
• Bus routes and stops are not clearly mapped digitally

---

## Solution

FLOW is a real-time bus tracking platform that:

• FLOW is a minimal real-time bus tracking platform
• Shows live bus location and ETA
• Provides AI voice assistant for multilingual navigation
• Sends notifications when buses approach a stop
• Uses crowd reporting to show bus occupancy status
• Detects nearby bus stops and suggests alternate options

---

## Impact

• Reduces waiting time at bus stops
• Helps passengers plan travel better
• Improves accessibility for non-local travelers
• Prevents passengers from missing buses
• Makes public transport easier and more reliable

---

## System Architecture

Full architecture diagram available here:

👉 https://www.figma.com/make/U1bmaFxVDzR5sZBlsXQuEq/Real-Time-Bus-Tracking-Flowchart?fullscreen=1&t=BwQUHTgWaIBGEqi4-1

---

Project Overview
A complete real-time public bus monitoring ecosystem consisting of:

Passenger Mobile App (React Native + Expo)
Admin Web Dashboard (Next.js 14 + Material-UI)
Real-time Backend API (Node.js + Express + Socket.io)
PostgreSQL Database (Optimized schema with indexing)

---

## Features

• Real-time bus tracking with live map
• Estimated Time of Arrival (ETA) display
• Voice assistant for navigation support
• Bus arrival notification system
• One-tap crowd reporting:

Overcrowded

Crowded

Normal

• AI verification for reliable crowd data
• Automatic nearby bus stop detection

---

## Future Improvements

• AI-based bus delay prediction
• Smart recommendation of alternate bus stops
• Passenger travel analytics for transport authorities
• Expanded multilingual voice support
• Integration with smart city transport systems

---

Architecture

smart-bus-system/
│
├── 📁 backend/                    ← Node.js + Express + Socket.io
│   ├── src/
│   │   ├── controllers/          ← API request handlers
│   │   ├── routes/               ← REST API routes
│   │   ├── services/             ← Business logic & simulation
│   │   ├── database/             ← PostgreSQL schema & seeds
│   │   ├── utils/                ← ETA calculator, geo utils
│   │   └── server.js             ← Main entry point
│   └── package.json
│
├── 📱 passenger-app/              ← React Native (Expo)
│   ├── src/
│   │   ├── screens/              ← App screens
│   │   ├── navigation/           ← React Navigation setup
│   │   ├── context/              ← Auth & Bus context
│   │   └── services/             ← API & Socket.io clients
│   ├── App.js
│   └── app.json
│
├── 💻 admin-dashboard/            ← Next.js 14
│   ├── app/
│   │   ├── page.js               ← Dashboard overview
│   │   ├── fleet/                ← Fleet monitoring
│   │   ├── routes/               ← Routes management
│   │   ├── analytics/            ← Analytics page
│   │   └── layout.js             ← Root layout
│   └── lib/
│       ├── api.js                ← API client
│       └── socket.js             ← Socket.io client
│
└── 📊 data/                       ← Sample CSV datasets
    ├── buses.csv
    ├── routes.csv
    ├── bus_stops.csv
    └── ...

---
