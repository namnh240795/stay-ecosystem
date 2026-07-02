import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AuthProvider from "./auth/provider";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Bookings from "./pages/Bookings";
import Earnings from "./pages/Earnings";

function NavBar() {
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.navLink}>
        Dashboard
      </Link>
      <Link to="/properties" style={styles.navLink}>
        Properties
      </Link>
      <Link to="/bookings" style={styles.navLink}>
        Bookings
      </Link>
      <Link to="/earnings" style={styles.navLink}>
        Earnings
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/earnings" element={<Earnings />} />
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
    background: "#065f46",
  },
  navLink: {
    color: "#d1fae5",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
};
