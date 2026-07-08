import { Routes, Route, Navigate } from "react-router-dom";
import { useState, Suspense, lazy } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import AuthProvider from "./auth/provider";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import { MOCK_BRANCHES, MOCK_APARTMENTS } from "./data/mockData";
import { MOCK_USERS } from "./mockUsers";
import { Branch, Apartment, UserSim } from "./types";

const AdminPortal = lazy(() => import("./components/AdminPortal"));

// Mock user for when Auth0 is not configured
const mockUser: UserSim = {
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
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [branches] = useState<Branch[]>(MOCK_BRANCHES);
  const [apartments, setApartments] = useState<Apartment[]>(MOCK_APARTMENTS);

  // Map Auth0 user to UserSim or use mock
  const currentUser: UserSim = isAuthenticated && user ? {
    id: user.sub || 'admin-1',
    name: user.name || user.nickname || 'Admin',
    email: user.email || '',
    phone: '',
    role: 'admin',
    roleName: 'Quản Trị Viên',
    avatarInitials: (user.name || 'A').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
    tier: 'Root Admin',
    loyaltyPoints: 0,
  } : mockUser;

  if (isLoading) return <LoadingFallback />;

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <AdminPortal
          branches={branches}
          setBranches={() => {}}
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
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const [usersList] = useState<UserSim[]>(MOCK_USERS);
  const [bookedList] = useState<Branch[]>([]);

  const currentUser: UserSim = isAuthenticated && user ? {
    id: user.sub || 'admin-1',
    name: user.name || user.nickname || 'Admin',
    email: user.email || '',
    phone: '',
    role: 'admin',
    roleName: 'Quản Trị Viên',
    avatarInitials: (user.name || 'A').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
    tier: 'Root Admin',
    loyaltyPoints: 0,
  } : mockUser;

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
        setCurrentUser={() => {}}
        usersList={usersList}
        onOpenLogin={() => {
          if (!isAuthenticated) {
            loginWithRedirect();
          }
        }}
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
