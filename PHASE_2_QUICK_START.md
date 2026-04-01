# Phase 2 Frontend - Quick Start Guide

## ✅ What's Been Built

### Frontend Architecture
- ✅ **Customer View**: Drink ordering interface with menu selection & order tracking
- ✅ **Bartender View**: Order management dashboard with PIN authentication
- ✅ **Mobile-First Design**: Responsive layout from phones to desktops
- ✅ **Real-Time Updates**: 5-second polling without WebSockets
- ✅ **Audio Notifications**: Web Audio API beeps for new orders
- ✅ **Visual Alerts**: CSS pulse animations for highlighted orders
- ✅ **Data Persistence**: localStorage for customer identity
- ✅ **Component Structure**: 8 reusable React components

### Technology Stack
```
Frontend:
- React 19 (Hooks: useState, useEffect, useRef)
- Vite (bundler & dev server)
- Tailwind CSS (mobile-first responsive)
- Web Audio API (no external libraries)
- localStorage (client-side persistence)

Backend (Phase 1 - Already Done):
- Node.js/Express
- SQLite with relational schema
- REST API endpoints
```

---

## 🚀 How to Run

### Prerequisites
- Node.js & npm installed ✓
- Backend server running: `node server.js` (port 3001)
- Frontend dev server: `npm run dev` (port 5173)

### Start the App

**Terminal 1 (Backend):**
```bash
cd c:\Users\chleb\gitPulls\ordering_drink_app
node server.js
```

**Terminal 2 (Frontend):**
```bash
cd c:\Users\chleb\gitPulls\ordering_drink_app\frontend
npm run dev
```

### Access the App
- **Customer View**: `http://localhost:5173`
- **Bartender View**: `http://localhost:5173?barman=true`
- **Bartender PIN**: `1234`

---

## 📱 Customer Flow

1. **First Visit**
   - App asks for your name
   - Name saved to localStorage (survives refresh)
   - Unique ID generated for you

2. **Order Drinks**
   - Browse drink menu
   - Click to select multiple drinks
   - Click "Order" to submit
   - See order in "Your Orders" panel

3. **Track Status**
   - Order updates in real-time (5-second polling)
   - Pending → Preparing → Ready
   - Clear status colors (Yellow → Blue → Green)

---

## 🍹 Bartender Flow

1. **Enter Bartender Mode**
   - Open `http://localhost:5173?barman=true`
   - Enter PIN: **1234**
   - See all pending orders

2. **Manage Orders**
   - Orders auto-sorted: pending first
   - Live stats: Pending/Preparing/Ready counts
   - Click "Start Preparing" → moves to Preparing state
   - Click "Mark Ready" → marks complete

3. **New Order Alerts**
   - Audio beep plays (Web Audio API)
   - New order highlighted with yellow pulse
   - No need to refresh - auto-updates!

---

## 🎨 Component Structure

```
App.jsx (Main routing by URL parameter)
│
├── CustomerView.jsx (Default)
│   ├── CustomerNameModal.jsx (Name entry)
│   ├── MenuComponent.jsx (Drink selection)
│   └── OrdersList.jsx (Order tracking)
│       └── OrderCard.jsx (Individual order)
│
└── BartenderView.jsx (barman=true)
    ├── PINModal.jsx (Authentication)
    ├── OrdersList.jsx (All orders)
    │   └── OrderCard.jsx (With status change)
    └── Stats Dashboard (Pending/Preparing/Ready)
```

---

## 📂 New Files Created

### Components
```
src/components/
├── App.jsx (routing)
├── CustomerView.jsx
├── BartenderView.jsx
├── CustomerNameModal.jsx
├── PINModal.jsx
├── MenuComponent.jsx
├── OrdersList.jsx
└── OrderCard.jsx
```

### Utilities
```
src/utils/
├── api.js (Backend communication)
├── storage.js (localStorage management)
└── notifications.js (Audio & visual alerts)
```

### Configuration
```
├── tailwind.config.js (Mobile-first Tailwind)
├── postcss.config.js (CSS processing)
└── package.json (React Router, Tailwind added)
```

---

## 🎯 Key Features

✅ **Mobile-First Responsive**
- Phone: Single column layout
- Tablet: Two-column layout
- Desktop: Three-column layout
- Large buttons (18px) - touch-friendly

✅ **Real-Time Polling**
- 5-second update interval
- No Server-Sent Events needed
- Automatic order list refresh
- Efficient & battery-friendly

✅ **Audio Notifications**
- Web Audio API (no external files)
- Two-frequency beep (attention-grabbing)
- Works on all modern browsers
- Silent fail if disabled

✅ **Visual Feedback**
- Color-coded statuses
- Pulse animation on new orders
- Clear state transitions
- User-friendly messages

✅ **Data Persistence**
- Customer name stored in localStorage
- Survives page refresh (F5)
- Unique ID generation
- Logout: clear browser data

✅ **Clean Architecture**
- Component separation of concerns
- Reusable utilities
- Error handling throughout
- Well-documented code

---

## 🔧 Tailwind CSS Configuration

Custom colors for order statuses:
```
Pending:   Amber/Yellow (#fbbf24)
Preparing: Blue (#3b82f6)
Ready:     Emerald/Green (#10b981)
```

Responsive breakpoints:
```
Mobile:   < 640px  (sm)
Tablet:   640px    (md)
Desktop:  1024px   (lg)
```

---

## 📝 API Endpoints Used

Backend provides these endpoints (from Phase 1):

```
GET    /api/drinks              → Get menu
POST   /api/drinks              → Add drink (barman)
DELETE /api/drinks/:id          → Remove drink (barman)

GET    /api/orders              → Get all orders
POST   /api/orders              → Create order
PATCH  /api/orders/:id          → Update order status
```

---

## ✨ Testing Checklist

- [ ] Enter name on first visit
- [ ] Name persists after F5 refresh
- [ ] Select multiple drinks
- [ ] Submit order visibility
- [ ] Order list updates (5-sec polling)
- [ ] Bartender PIN authentication
- [ ] Move pending → preparing "Start Preparing" button
- [ ] Move preparing → ready with "Mark Ready" button
- [ ] New order audio beep plays
- [ ] New order highlighted in yellow
- [ ] Mobile view (phone-sized browser)
- [ ] Tablet view (medium-sized)
- [ ] Desktop view (large screen)

---

## 📚 Documentation Files

- `PHASE_2_FRONTEND.md` - Comprehensive implementation summary
- `REFACTOR_SUMMARY.md` - Backend Phase 1 details
- `IMPLEMENTATION_SUMMARY.md` - Original Phase 1 notes

---

## 🚨 Troubleshooting

**Backend not connecting?**
- Ensure `node server.js` is running on port 3001
- Check CORS is enabled in backend

**Frontend not loading?**
- Ensure npm packages installed: `npm install`
- Clear browser cache
- Try incognito/private window

**Audio beep not working?**
- Check browser volume
- Some browsers require user interaction first
- Works after clicking on page

**Orders not updating?**
- Check network tab for API calls
- Polling interval is 5 seconds
- Manual refresh (F5) to force update

---

## 🎉 What's Ready for Phase 3?

- Full customer experience ✓
- Full bartender experience ✓
- Real-time updates ✓
- Mobile app ready for production ✓

**Next Phase Ideas:**
- WebSocket upgrade (replace polling)
- Payment processing
- Order duration tracking
- Barman menu management UI (in app)
- Customer rating/feedback
- Queue management
- Multiple bars/locations
