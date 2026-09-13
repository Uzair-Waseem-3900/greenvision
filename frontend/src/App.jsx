import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import ScanPage from "./pages/ScanPage";
import DashboardPage from "./pages/DashboardPage";
import ParksPage from "./pages/ParksPage";
import ParkTreesReportPage from "./pages/ParkTreesReportPage";
import TreeReportsPage from "./pages/TreeReportsPage";
import ReportsPage from "./pages/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
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

function Protected({ children }) {
  return (
    <PageFade>
      <ProtectedRoute>{children}</ProtectedRoute>
    </PageFade>
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

            <Route path="/parks" element={<Protected><ParksPage /></Protected>} />
            <Route path="/parks/:parkId/reports" element={<Protected><ParkTreesReportPage /></Protected>} />
            <Route path="/trees/:treeId/reports" element={<Protected><TreeReportsPage /></Protected>} />
            <Route path="/scan" element={<Protected><ScanPage /></Protected>} />
            <Route path="/reports" element={<Protected><ReportsPage /></Protected>} />
            <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
            <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
