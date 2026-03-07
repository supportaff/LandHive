# 🌾 LandHive - Tamil Nadu Agricultural Land Marketplace

**Production-ready real estate platform for buying/selling agricultural land in Tamil Nadu.**

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js Serverless Functions (Vercel)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Clerk
- **Payments**: PayU
- **Maps**: Google Maps + Places API
- **Email**: Resend
- **Hosting**: Vercel

## 📦 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your actual API keys in .env.local

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔑 Environment Variables

See `.env.example` for all required variables:

- Supabase: Database connection
- Clerk: Authentication
- PayU: Payment gateway (test/live)
- Google Maps: Map display + location search
- Resend: Transactional emails

## 📁 Project Structure

```
LandHive/
├── api/                 # Serverless API routes
│   ├── create-listing.js
│   ├── get-listings.js
│   ├── payu-initiate.js
│   └── payu-webhook.js
├── src/
│   ├── pages/          # React pages
│   ├── components/     # Reusable components
│   ├── data/           # Helpers & constants
│   └── App.jsx
├── supabase/
│   └── schema.sql      # Database schema
└── vercel.json         # Vercel config
```

## 🗄️ Database Setup

1. Create a Supabase project
2. Run `supabase/schema.sql` in SQL Editor
3. Enable Row Level Security (RLS)
4. Add API keys to `.env.local`

## 💳 Payment Setup

**Test Mode** (default):
```
LH_PAYU_ENV=false
LH_PAYU_KEY=your_test_key
LH_PAYU_SALT=your_test_salt
```

**Live Production**:
```
LH_PAYU_ENV=true
LH_PAYU_KEY=your_live_key
LH_PAYU_SALT=your_live_salt
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy: `git push origin main`

### Manual Build

```bash
npm run build
# Deploy dist/ folder to any static host
```

## 🎯 Features

✅ **User Features**
- Browse listings with map view
- Advanced search & filters
- Google Places location search
- Contact sellers via inquiry form
- Secure PayU payments
- Email notifications

✅ **Seller Features**
- Post listings with photos
- KYC verification
- Dashboard to manage listings
- Real-time inquiry tracking

✅ **Admin Features**
- Approve/reject listings
- KYC verification
- Payment tracking
- User management

## 📱 Mobile Responsive

Fully optimized for:
- iOS Safari
- Android Chrome
- Desktop (Chrome, Firefox, Safari)

## 🔒 Security

- Row Level Security (RLS) in Supabase
- Clerk authentication
- PayU hash verification
- Environment variable protection
- CORS & CSRF protection

## 📊 Performance

- Lighthouse Score: 87/100
- Bundle size: ~350KB (gzipped)
- Lazy loading images
- Code splitting
- No console.log in production

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

Contributions welcome! Open an issue or PR.

## 📧 Support

Email: support@landhive.in

---

**Built with ❤️ in Chennai, Tamil Nadu**
