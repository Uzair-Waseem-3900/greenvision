import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import ScanPage from "./pages/ScanPage";
import DashboardPage from "./pages/DashboardPage";
import ParksPage from "./pages/ParksPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function PageFade({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageFade><LandingPage /></PageFade>} />
            <Route path="/login" element={<PageFade><LoginPage /></PageFade>} />
            <Route path="/register" element={<PageFade><RegisterPage /></PageFade>} />
            <Route
              path="/parks"
              element={
                <PageFade>
                  <ProtectedRoute>
                    <ParksPage />
                  </ProtectedRoute>
                </PageFade>
              }
            />
            <Route
              path="/scan"
              element={
                <PageFade>
                  <ProtectedRoute>
                    <ScanPage />
                  </ProtectedRoute>
                </PageFade>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PageFade>
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                </PageFade>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
