import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import DesktopNavbar from './components/DesktopNavbar';
import SplashScreen from './components/SplashScreen';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import QuranPlanner from './pages/QuranPlanner';
import IslamicTools from './pages/IslamicTools';
import Statistics from './pages/Statistics';
import Istighfar from './pages/Istighfar';
import NotificationToast from './components/NotificationToast';

function ScrollToTop() {
    const { pathname } = useLocation();
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

export default function App() {
    const { needsSplash, state, dispatch } = useApp();
    const [showSplash, setShowSplash] = useState(needsSplash);

    const handleSplashClose = React.useCallback(() => {
        setShowSplash(false);
        dispatch({ type: 'SPLASH_SEEN' });
    }, [dispatch]);

    // Splash auto-advance delay
    React.useEffect(() => {
        if (showSplash) {
            const timer = setTimeout(() => {
                handleSplashClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSplash, handleSplashClose]);

    // Show login page if user has not set their profile name
    if (!state.isLoggedIn) {
        return <LoginPage />;
    }

    return (
        <>
            {showSplash && <SplashScreen onClose={handleSplashClose} />}
            <NotificationToast />
            <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
                <ScrollToTop />
                {/* Desktop Top Navigation (min-width: 768px) */}
                <DesktopNavbar />

                {/* Main Application Pages */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/quran" element={<QuranPlanner />} />
                        <Route path="/tools" element={<IslamicTools />} />
                        <Route path="/tasks" element={<IslamicTools />} />
                        <Route path="/istighfar" element={<Istighfar />} />
                        <Route path="/stats" element={<Statistics />} />
                        {/* Fallback to Home */}
                        <Route path="*" element={<Home />} />
                    </Routes>
                </main>

                {/* Mobile Bottom Navigation (max-width: 767px) */}
                <BottomNav />
            </div>
        </>
    );
}
