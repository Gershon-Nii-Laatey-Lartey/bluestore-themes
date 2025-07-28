
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { VendorProtectedRoute } from "@/components/VendorProtectedRoute";
import { CSWorkerProtectedRoute } from "@/components/CSWorkerProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import MyAds from "./pages/MyAds";
import PublishAd from "./pages/PublishAd";
import ProductDetail from "./pages/ProductDetail";
import Search from "./pages/Search";
import CategoryPage from "./pages/CategoryPage";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import UserManagement from "./pages/UserManagement";
import VendorRequired from "./pages/VendorRequired";
import CreateVendorProfile from "./pages/CreateVendorProfile";
import MyVendorProfile from "./pages/MyVendorProfile";
import VendorProfile from "./pages/VendorProfile";
import StorefrontManager from "./pages/StorefrontManager";
import Storefront from "./pages/Storefront";
import StorefrontSearch from "./pages/StorefrontSearch";
import StorefrontProductDetail from "./pages/StorefrontProductDetail";
import StorefrontChat from "./pages/StorefrontChat";
import Favorites from "./pages/Favorites";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import PackageSelection from "./pages/PackageSelection";
import ActivePackages from "./pages/ActivePackages";
import Analytics from "./pages/Analytics";
import ChatRooms from "./pages/ChatRooms";
import Chat from "./pages/Chat";
import Support from "./pages/Support";
import FAQ from "./pages/FAQ";

import Terms from "./pages/Terms";
import KYC from "./pages/KYC";
import CSWorkerDashboard from "./pages/CSWorkerDashboard";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/electronics" element={<CategoryPage />} />
            <Route path="/smartphones" element={<CategoryPage />} />
            <Route path="/laptops" element={<CategoryPage />} />
            <Route path="/headphones" element={<CategoryPage />} />
            <Route path="/gaming" element={<CategoryPage />} />
            <Route path="/fashion" element={<CategoryPage />} />
            <Route path="/home-garden" element={<CategoryPage />} />
            <Route path="/sports" element={<CategoryPage />} />
            <Route path="/automotive" element={<CategoryPage />} />
            <Route path="/clearance" element={<CategoryPage />} />
            <Route path="/storefront/:url" element={<Storefront />} />
            <Route path="/storefront/:url/search" element={<StorefrontSearch />} />
            <Route path="/storefront/:url/product/:id" element={<StorefrontProductDetail />} />
            <Route path="/storefront/:url/chat" element={<StorefrontChat />} />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/my-ads" element={
              <ProtectedRoute>
                <MyAds />
              </ProtectedRoute>
            } />
            <Route path="/publish-ad" element={
              <ProtectedRoute>
                <PublishAd />
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/package-selection" element={
              <ProtectedRoute>
                <PackageSelection />
              </ProtectedRoute>
            } />
            <Route path="/active-packages" element={
              <ProtectedRoute>
                <ActivePackages />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <ChatRooms />
              </ProtectedRoute>
            } />
            <Route path="/chat/:sellerId" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/support" element={<Support />} />
            <Route path="/faq" element={<FAQ />} />

            <Route path="/terms" element={<Terms />} />
            
            <Route path="/kyc" element={
              <VendorProtectedRoute>
                <KYC />
              </VendorProtectedRoute>
            } />
            <Route path="/vendor-required" element={<VendorRequired />} />
            <Route path="/create-vendor-profile" element={<CreateVendorProfile />} />
            <Route path="/my-vendor-profile" element={
              <VendorProtectedRoute>
                <MyVendorProfile />
              </VendorProtectedRoute>
            } />
            <Route path="/vendor/:id" element={<VendorProfile />} />
            <Route path="/storefront-manager" element={
              <VendorProtectedRoute>
                <StorefrontManager />
              </VendorProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <Admin />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <AdminProtectedRoute>
                <AdminUsers />
              </AdminProtectedRoute>
            } />
            <Route path="/user-management" element={
              <AdminProtectedRoute>
                <UserManagement />
              </AdminProtectedRoute>
            } />

            <Route path="/cs-dashboard" element={
              <CSWorkerProtectedRoute>
                <CSWorkerDashboard />
              </CSWorkerProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
