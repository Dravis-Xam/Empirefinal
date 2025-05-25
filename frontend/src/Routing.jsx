import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Profile from './pages/Profile';
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/authPages/LoginPage";
import SignUpPage from './pages/authPages/SignUpPage';
import PasswordRecovery from "./pages/authPages/Recovery/PasswordRecovery";
import Cart from "./pages/components/modals/Cart";
import SearchPage from "./pages/SearchPage";
import DetailPage from "./pages/DetailPage";
import Payment from "./pages/components/modals/Payment";
import PageNotFound from "./pages/404page";
import AboutPage from "./pages/aboutPage/AboutPage";
import ContactUs from "./pages/ContactUs";
import TrackDeliveryPage from "./pages/TrackPage";
import ProtectedRoute from "./modules/ProtectedRoute";
import MaintenancePage from "./pages/maintenancePages/Maintenance";
import InventoryPage from "./pages/inventoryPages/InventoryPage";
import CustomerCarePage from "./pages/customercarePages/CustomerCarePage";
import GlobalErrorBoundary from './modules/globalErrorBoundary.jsx'

function App() {
  return (
    <Router>
      <GlobalErrorBoundary>
        <Routes>
          <Route path="/" element={<HomePage />}/>
          <Route path="/profile" element={ 
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/passwordRecovery" element ={<PasswordRecovery />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/details" element={<DetailPage />} /> 
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          } />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/track-delivery" element={<TrackDeliveryPage />} />
          <Route path="/maintenance" element={
            <ProtectedRoute>
              <MaintenancePage />
            </ProtectedRoute>
          } />
          <Route path="/customer-care" element={
            <ProtectedRoute>
              <CustomerCarePage />
            </ProtectedRoute>
          } />
          <Route path="/inventory" element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          } />


          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </GlobalErrorBoundary>
    </Router>
  );
}

export default App;
