import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import AuthProvider from "./auth/provider";
import Users from "./pages/Users";
import Applications from "./pages/Applications";
import Properties from "./pages/Properties";
import Bookings from "./pages/Bookings";
import Reports from "./pages/Reports";

function NavBar() {
  return (
    <nav style={styles.nav}>
      <Link to="/users" style={styles.navLink}>
        Users
      </Link>
      <Link to="/applications" style={styles.navLink}>
        Applications
      </Link>
      <Link to="/properties" style={styles.navLink}>
        Properties
      </Link>
      <Link to="/bookings" style={styles.navLink}>
        Bookings
      </Link>
      <Link to="/reports" style={styles.navLink}>
        Reports
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
          <Route path="/" element={<Navigate to="/users" replace />} />
          <Route path="/users" element={<Users />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/reports" element={<Reports />} />
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
    background: "#7f1d1d",
  },
  navLink: {
    color: "#fecaca",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
};
