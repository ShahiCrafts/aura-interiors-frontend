import "./styles/index.css";
import Navbar from "./layouts/Navbar";
import Hero from "./components/sections/Hero";
import FeaturedPieces from "./components/sections/FeaturedPieces";
import Philosophy from "./components/sections/Philosophy";
import Testimonials from "./components/sections/Testimonials";
import Footer from "./layouts/Footer";
import AuthCallback from "./components/AuthCallback";

function App() {
  return (
    <>
      <AuthCallback />
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

export default App;
