import { Routes, Route, Navigate } from "react-router-dom";
import { useState, Suspense, lazy } from "react";
import AuthProvider from "./auth/provider";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import { MOCK_BRANCHES, MOCK_APARTMENTS } from "./data/mockData";
import { MOCK_USERS } from "./mockUsers";
import { Branch, Apartment, UserSim } from "./types";

// Lazy load the admin portal (large component)
const AdminPortal = lazy(() => import("./components/AdminPortal"));

const defaultUser: UserSim = {
  id: 'admin-1',
  name: 'Nguyễn Văn Quyết',
  email: 'quyet.nv@grandstay.com',
  phone: '0912345678',
  role: 'admin',
  roleName: 'Giám Đốc Vận Hành',
  avatarInitials: 'VQ',
  tier: 'Root Admin',
  loyaltyPoints: 0,
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Đang tải...</p>
      </div>
    </div>
  );
}

function AdminView() {
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
  const [apartments, setApartments] = useState<Apartment[]>(MOCK_APARTMENTS);
  const [currentUser] = useState<UserSim>(defaultUser);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <AdminPortal
          branches={branches}
          setBranches={setBranches}
          apartments={apartments}
          setApartments={setApartments}
          currentUser={currentUser}
          onBackToHome={() => {}}
        />
      </Suspense>
    </ErrorBoundary>
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
    <ErrorBoundary>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </ErrorBoundary>
  );
}
