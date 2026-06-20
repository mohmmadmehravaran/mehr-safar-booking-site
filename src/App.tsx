import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { SiteEditsProvider } from './context/SiteEditsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import HotelDetail from './pages/HotelDetail';
import AdminPanel from './pages/AdminPanel';
import MasterVisualEditor from './components/admin/MasterVisualEditor';
import CustomWidgetsLayer from './components/admin/CustomWidgetsLayer';
import EditModeFab from './components/admin/EditModeFab';
import AuthPage from './pages/AuthPage';
import UserPanel from './pages/UserPanel';
import TrackBooking from './pages/TrackBooking';
import SupportPage from './pages/SupportPage';
import CustomPage from './pages/CustomPage';

export default function App() {
  return (
    <ThemeProvider>
      <SiteEditsProvider>
        <AppProvider>
          <HashRouter>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col font-sans" dir="rtl">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/hotel/:id" element={<HotelDetail />} />
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/register" element={<AuthPage />} />
                  <Route path="/account" element={<UserPanel />} />
                  <Route path="/track" element={<TrackBooking />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/page/:slug" element={<CustomPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <MobileBottomNav />
            <CustomWidgetsLayer />
            <MasterVisualEditor />
            <EditModeFab />
          </HashRouter>
        </AppProvider>
      </SiteEditsProvider>
    </ThemeProvider>
  );
}
