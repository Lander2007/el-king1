import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartSidebar } from './components/CartSidebar';
import { HomePage } from './pages/HomePage';
import { BrandPage } from './pages/BrandPage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentPage } from './pages/PaymentPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts';
import { AdminOrders } from './pages/AdminOrders';
import { WishlistPage } from './pages/WishlistPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminGuard } from './components/AdminGuard';

function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ background: 'var(--ks-bg)' }}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartSidebar />
    </div>
  );
}

export default function App() {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "King-Store",
    "url": window.location.origin,
    "logo": `${window.location.origin}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+20-10-1234-5678",
      "contactType": "customer service"
    }
  };

  return (
    <BrowserRouter>
      <script type="application/ld+json">
        {JSON.stringify(orgJsonLd)}
      </script>
      <AppProvider>
        <Routes>
          {/* Storefront routes */}
          <Route path="/" element={
            <StorefrontLayout>
              <HomePage />
            </StorefrontLayout>
          } />
          <Route path="/samsung" element={
            <StorefrontLayout>
              <BrandPage />
            </StorefrontLayout>
          } />
          <Route path="/iphone" element={
            <StorefrontLayout>
              <BrandPage />
            </StorefrontLayout>
          } />
          <Route path="/samsung/:modelSlug" element={
            <StorefrontLayout>
              <ProductListingPage />
            </StorefrontLayout>
          } />
          <Route path="/iphone/:modelSlug" element={
            <StorefrontLayout>
              <ProductListingPage />
            </StorefrontLayout>
          } />
          <Route path="/product/:productId" element={
            <StorefrontLayout>
              <ProductDetailPage />
            </StorefrontLayout>
          } />
          <Route path="/search" element={
            <StorefrontLayout>
              <SearchResultsPage />
            </StorefrontLayout>
          } />
          <Route path="/checkout" element={
            <StorefrontLayout>
              <CheckoutPage />
            </StorefrontLayout>
          } />
          <Route path="/payment" element={
            <StorefrontLayout>
              <PaymentPage />
            </StorefrontLayout>
          } />
          <Route path="/order-confirmation" element={
            <StorefrontLayout>
              <OrderConfirmationPage />
            </StorefrontLayout>
          } />
          <Route path="/wishlist" element={
            <StorefrontLayout>
              <WishlistPage />
            </StorefrontLayout>
          } />

          {/* Admin routes (no storefront layout) */}
          <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/products" element={<AdminGuard><AdminProducts /></AdminGuard>} />
          <Route path="/admin/orders" element={<AdminGuard><AdminOrders /></AdminGuard>} />
          <Route path="/admin/*" element={<AdminGuard><AdminDashboard /></AdminGuard>} />

          {/* Fallback */}
          <Route path="*" element={
            <StorefrontLayout>
              <NotFoundPage />
            </StorefrontLayout>
          } />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
