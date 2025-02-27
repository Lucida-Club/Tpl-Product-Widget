import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductSearch from './components/ProductSearch';
import CheckoutForm from './components/CheckoutForm';
import OrderConfirmation from './components/OrderConfirmation';
import OrderReview from './components/OrderReview';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* <Navbar /> */}
      <main className="flex-grow">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<ProductSearch />} />
          <Route path="/checkout/:id" element={<CheckoutForm />} />
          <Route path="/review" element={<OrderReview />} />
          <Route path="/confirmation" element={<OrderConfirmation />} />
        </Routes>
      </main>
      <footer className="bg-white py-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            {import.meta.env.VITE_PROJECT_NAME} v{import.meta.env.VITE_VERSION} © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;