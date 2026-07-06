import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import AuthProvider from "./auth/provider";
import AdminPortal from "./components/AdminPortal";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { MOCK_BRANCHES, MOCK_APARTMENTS } from "./data/mockData";
import { MOCK_USERS } from "./mockUsers";
import { Branch, Apartment, UserSim } from "./types";

const defaultUser: UserSim = {
  id: 'admin-1',
  name: 'Nguyễn Văn Quyết',
  email: 'quyet.nv@grandstay.com',
  phone: '0912345678',
  role: 'role-1',
  roleName: 'Giám Đốc Vận Hành',
  avatarInitials: 'VQ',
  tier: 'Root Admin',
  loyaltyPoints: 0,
};

function AdminView() {
  // Mock data as fallback - in production these come from the API via React Query
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
  const [apartments, setApartments] = useState<Apartment[]>(MOCK_APARTMENTS);
  const [currentUser] = useState<UserSim>(defaultUser);

  return (
    <AdminPortal
      branches={branches}
      setBranches={setBranches}
      apartments={apartments}
      setApartments={setApartments}
      currentUser={currentUser}
      onBackToHome={() => {}}
    />
  );
}

function Layout() {
  const [currentUser, setCurrentUser] = useState<UserSim>(defaultUser);
  const [usersList] = useState<UserSim[]>(MOCK_USERS);
  const [bookedList] = useState<Branch[]>([]);

  const handleSetCurrentView = (view: 'home' | 'member' | 'admin') => {};

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fdfdfd] text-slate-800 antialiased">
      <ScrollToTop />
      <Header
        onSearchClick={() => {}}
        activeBranchCount={bookedList.length}
        currentView="admin"
        setCurrentView={handleSetCurrentView}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        usersList={usersList}
        onOpenLogin={() => {}}
      />

      <main className="flex-grow">
        <Routes>
          <Route path="/admin/*" element={<AdminView />} />
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}
