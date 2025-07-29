# BlueStore - Ghana's Premier Marketplace

BlueStore is a modern, full-featured marketplace application built for Ghana, enabling users to buy, sell, and discover products with ease. Built with React, TypeScript, and Supabase, it provides a seamless e-commerce experience with real-time features.

## 🚀 Features

### For Users
- **Product Discovery**: Browse products by category, search, or explore featured items
- **Real-time Chat**: Communicate with sellers through integrated chat system
- **Favorites System**: Save and manage favorite products
- **Location-based Search**: Find products near you with location services
- **Mobile-First Design**: Optimized for mobile devices with responsive UI
- **Push Notifications**: Stay updated with real-time notifications
- **Vendor Profiles**: Create and manage your storefront
- **KYC Verification**: Secure identity verification for trusted transactions

### For Sellers
- **Easy Product Listing**: Simple multi-step form for creating listings
- **Image Optimization**: Automatic image processing and optimization
- **Ad Management**: Track, edit, and manage your product listings
- **Analytics Dashboard**: Monitor views, clicks, and engagement
- **Boost Features**: Promote your ads with boost and 2x boost options
- **Storefront Management**: Customize your vendor profile and store

### For Admins
- **Comprehensive Dashboard**: Monitor platform activity and user engagement
- **User Management**: Manage users, vendors, and customer support
- **Content Moderation**: Review and approve product submissions
- **Analytics & Reports**: Detailed insights into platform usage
- **Support System**: Handle customer inquiries and support tickets
- **KYC Management**: Verify user identities and manage verification process

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Real-time, Auth, Storage)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Real-time**: Supabase Realtime
- **Payments**: Paystack integration
- **Deployment**: Firebase Hosting

## 📱 Key Pages & Features

### Core Pages
- **Home**: Featured products, categories, clearance sales
- **Search**: Advanced filtering and sorting
- **Product Details**: Rich product information with chat integration
- **Chat**: Real-time messaging between buyers and sellers
- **My Ads**: Manage your product listings
- **Profile**: User account management
- **Vendor Profile**: Storefront and business information

### Admin Features
- **Dashboard**: Platform overview and analytics
- **User Management**: Comprehensive user administration
- **Product Moderation**: Review and approve submissions
- **Support System**: Handle customer inquiries
- **KYC Management**: Identity verification workflow

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Firebase account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gershon-Nii-Laatey-Lartey/bluestore-themes.git
   cd bluestore-themes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_PAYSTACK_PUBLIC_KEY=your_paystack_key
   ```

4. **Database Setup**
   ```bash
   # Apply Supabase migrations
   npx supabase db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Core Tables
- `product_submissions`: Product listings and metadata
- `users`: User accounts and profiles
- `vendor_profiles`: Seller storefront information
- `chat_rooms`: Real-time messaging
- `notifications`: User notifications
- `kyc_submissions`: Identity verification data
- `ad_analytics`: Product performance metrics

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat functionality
│   ├── home/           # Homepage components
│   ├── product/        # Product-related components
│   ├── publish-ad/     # Ad creation forms
│   └── ui/             # Base UI components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API and business logic
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Key Features Implementation
- **Real-time Chat**: Supabase Realtime with polling fallback
- **Image Optimization**: Client-side processing with blur placeholders
- **Location Services**: Cached location data with context
- **Mobile Navigation**: Floating action button and responsive design
- **Error Handling**: Comprehensive error management and user feedback

## 🚀 Deployment

### Firebase Deployment
```bash
npm run build
firebase deploy
```

### Environment Variables
Ensure all required environment variables are set in your deployment platform:
- Supabase configuration
- Paystack API keys
- Analytics tracking IDs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🎯 Roadmap

- [ ] Advanced search filters
- [ ] Mobile app (React Native)
- [ ] AI-powered product recommendations
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Social media integration
- [ ] Escrow payment system

---

**Built with ❤️ for Ghana's digital marketplace**
