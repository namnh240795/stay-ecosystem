import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AuthProvider from "./auth/provider";
import Home from "./pages/Home";
import PropertyDetail from "./pages/PropertyDetail";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import MyBookings from "./pages/MyBookings";
import ApplyPartner from "./pages/ApplyPartner";

function NavBar() {
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.navLink}>
        Home
      </Link>
      <Link to="/my-bookings" style={styles.navLink}>
        My Bookings
      </Link>
      <Link to="/apply-partner" style={styles.navLink}>
        Become a Partner
      </Link>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/booking/:propertyId" element={<Booking />} />
          <Route path="/payment/:bookingId" element={<Payment />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/apply-partner" element={<ApplyPartner />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    gap: "1.5rem",
    padding: "0.75rem 2rem",
    background: "#1a1a2e",
  },
  navLink: {
    color: "#e5e7eb",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
};
