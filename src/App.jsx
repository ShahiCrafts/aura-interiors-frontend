import { Routes, Route } from "react-router-dom";
import "./styles/index.css";
import Navbar from "./layouts/Navbar";
import Hero from "./components/sections/Hero";
import FeaturedPieces from "./components/sections/FeaturedPieces";
import Philosophy from "./components/sections/Philosophy";
import Testimonials from "./components/sections/Testimonials";
import Footer from "./layouts/Footer";
import AuthCallback from "./components/AuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";

function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Hero />
        <FeaturedPieces />
        <Philosophy />
        <Testimonials />
        <Footer />
      </main>
    </>
  );
}

function App() {
  return (
    <>
      <AuthCallback />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
