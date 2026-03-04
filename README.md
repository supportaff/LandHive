# 🌿 LandHive — India's Land Marketplace

A full-featured land listing marketplace built with **Vite + React + Tailwind CSS**.

## ✨ Features

- 🏞️ **Homepage** — Hero, search bar, featured listings, how it works, CTA
- 🗺️ **Map Search** — Listing filters + Google Maps with price marker pins
- 📋 **Listing Detail** — Photo carousel, maps, seller contact (login-gated), document verification
- 📝 **Post Listing** — 4-step form: Basic Info → Location → Media → Pay (₹999 via PayU)
- 👤 **Seller Dashboard** — Listings table, inquiries, alerts, settings
- 🏠 **Buyer Dashboard** — Saved listings, inquiry history
- 🛡️ **Admin Panel** — Approve/reject listings, verified badge, analytics, user management
- 🔐 **Auth Pages** — Sign In, Sign Up, Role Selection (Buyer/Seller)

## 🚀 Quick Start

### 1. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Set up environment variables
\`\`\`bash
cp .env.example .env
# Fill in your API keys
\`\`\`

### 3. Start development server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:5173`

### 4. Build for production
\`\`\`bash
npm run build
\`\`\`

## 🔑 Demo Login

Use the demo bar at the top of the page to log in as:
- **Buyer** — Browse and save listings
- **Seller** — Post listings, manage dashboard  
- **Admin** — Approve/reject listings, verify badges

## 🧩 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vite + React 18 |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM 6 |
| Icons | Lucide React |
| Maps | Google Maps JS API (plug your key) |
| Auth | Clerk (configured via env) |
| Payments | PayU SHA512 hash flow |
| Storage | Cloudinary (photos + docs) |
| Database | MongoDB Atlas + Mongoose (backend) |
| Deploy | Vercel |

## 📁 Project Structure

\`\`\`
src/
├── components/         # Shared UI components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── ListingCard.jsx
│   └── MapPlaceholder.jsx
├── data/
│   └── listings.js     # Mock data + constants
├── hooks/
│   └── useAuth.js      # Auth context
└── pages/
    ├── Home.jsx
    ├── Search.jsx
    ├── ListingDetail.jsx
    ├── PostListing.jsx
    ├── SellerDashboard.jsx
    ├── BuyerDashboard.jsx
    ├── AdminPanel.jsx
    ├── SignIn.jsx
    ├── SignUp.jsx
    └── RoleSelect.jsx
\`\`\`

## 🗺️ Google Maps Integration

Replace `MapPlaceholder` component with real Google Maps:

\`\`\`bash
npm install @googlemaps/js-api-loader
\`\`\`

Add to `.env`:
\`\`\`
VITE_GOOGLE_MAPS_API_KEY=AIza...
\`\`\`

## 💳 PayU Payment Flow

1. Seller fills Step 4 form
2. Frontend calls `/api/payments/payu/hash` with txnid, amount, details
3. Server generates SHA512 hash: `key|txnid|amount|productinfo|firstname|email|||||||||||salt`
4. Auto-submit hidden HTML form to `https://secure.payu.in/_payment`
5. PayU redirects to `surl` (success) or `furl` (failure)
6. Backend verifies response hash → activates listing

## 🎨 Color Theme

| Token | Value |
|---|---|
| Primary Green | `#16a34a` |
| Light Green | `#dcfce7` |
| Dark Green | `#15803d` |
| Background | `#f8fafc` |
| Text | `#1e293b` |

## 📦 Deployment (Vercel)

\`\`\`bash
npm run build
vercel deploy
\`\`\`

---

Built with ❤️ for India's land buyers and sellers.
