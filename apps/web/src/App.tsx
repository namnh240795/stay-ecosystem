import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Branch, SearchQuery, Apartment, UserSim } from './types';
import { MOCK_USERS } from './mockUsers';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import { BRANCHES, APARTMENTS } from './data';

// Lazy load heavy page components
const HomePage = lazy(() => import('./pages/HomePage'));
const MemberPage = lazy(() => import('./pages/MemberPage'));
const BookingModal = lazy(() => import('./components/BookingModal'));
const LoginPortal = lazy(() => import('./components/LoginPortal'));
const AuthCallback = lazy(() => import('./components/AuthCallback'));

export default function App() {
  // Set default dates based on metadata: current time is 2026-07-01
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    location: 'All Locations',
    brand: 'All Brands',
    checkIn: '2026-07-01',
    checkOut: '2026-07-04',
    adults: 2,
    children: 0,
    rooms: 1,
    activeTab: 'stay',
    amenities: []
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Setup view based on routing pathname dynamically
  const currentView = location.pathname === '/member' ? 'member' : 'home';

  const handleSetCurrentView = (view: 'home' | 'member') => {
    if (view === 'member') {
      navigate('/member');
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    const hash = location.hash || window.location.hash;
    
    if (hash === '#long-term') {
      setSearchQuery(prev => ({ ...prev, activeTab: 'longTerm' }));
    } else if (hash === '#member' || hash === '#benefits') {
      setSearchQuery(prev => ({ ...prev, activeTab: 'stay' }));
      setTimeout(() => {
        const el = document.getElementById('benefits');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (hash === '#about') {
      setSearchQuery(prev => ({ ...prev, activeTab: 'stay' }));
      setTimeout(() => {
        const el = document.getElementById('about');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (hash && hash !== '#' && !hash.startsWith('#/admin') && !hash.startsWith('#admin') && !hash.startsWith('#/member') && !hash.startsWith('#member')) {
      setSearchQuery(prev => ({ ...prev, activeTab: 'stay' }));
    }
  }, [location]);

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [bookedList, setBookedList] = useState<Branch[]>(() => {
    const saved = localStorage.getItem('gs_op_booked_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('gs_op_booked_list', JSON.stringify(bookedList));
  }, [bookedList]);

  const [usersList, setUsersList] = useState<UserSim[]>(() => {
    const saved = localStorage.getItem('gs_custom_users_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return MOCK_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserSim>(() => {
    const savedActive = localStorage.getItem('gs_active_user');
    if (savedActive) {
      try {
        return JSON.parse(savedActive);
      } catch (e) {
        // Fallback
      }
    }
    return MOCK_USERS[0];
  });

  const [showLoginModal, setShowLoginModal] = useState(false);

  // Keep usersList persisted
  useEffect(() => {
    localStorage.setItem('gs_custom_users_list', JSON.stringify(usersList));
  }, [usersList]);

  // Keep active logged-in user persisted
  useEffect(() => {
    localStorage.setItem('gs_active_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Handle updates to user info/points
  const handleUpdateUser = (updatedUser: UserSim) => {
    setUsersList(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };



  // Dynamic state loaded from localStorage for real-time CRUD sync with user flow
  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem('gs_branches_data');
    if (saved) return JSON.parse(saved);
    return BRANCHES;
  });

  const [apartments, setApartments] = useState<Apartment[]>(() => {
    const saved = localStorage.getItem('gs_apartments_data');
    if (saved) return JSON.parse(saved);
    return APARTMENTS;
  });

  useEffect(() => {
    localStorage.setItem('gs_branches_data', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('gs_apartments_data', JSON.stringify(apartments));
  }, [apartments]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedBranches = localStorage.getItem('gs_branches_data');
      if (savedBranches) {
        setBranches(JSON.parse(savedBranches));
      }
      const savedApartments = localStorage.getItem('gs_apartments_data');
      if (savedApartments) {
        setApartments(JSON.parse(savedApartments));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle search box submit or dynamic change
  const handleSearch = (newQuery: SearchQuery) => {
    setSearchQuery(newQuery);
  };

  // Triggered when clicking "Đặt Phòng Ngay" on a card
  const handleOpenBooking = (branch: Branch) => {
    if (!branch.id) {
      setSearchQuery({
        location: 'All Locations',
        brand: 'All Brands',
        checkIn: '2026-07-01',
        checkOut: '2026-07-04',
        adults: 2,
        children: 0,
        rooms: 1,
        activeTab: 'stay',
        amenities: []
      });
      return;
    }
    setSelectedBranch(branch);
  };

  // Close booking modal
  const handleCloseBooking = () => {
    setSelectedBranch(null);
  };

  const handleReviewAdded = (branchId: string, newReview: any) => {
    setBranches(prev => prev.map(b => {
      if (b.id === branchId) {
        const currentReviewsCount = b.reviews || 0;
        const currentRating = b.rating || 5.0;
        const newReviewsCount = currentReviewsCount + 1;
        const newRating = Number(((currentRating * currentReviewsCount + newReview.rating) / newReviewsCount).toFixed(1));
        
        // Also update selectedBranch if it is currently open
        if (selectedBranch && selectedBranch.id === branchId) {
          setSelectedBranch(prevSelected => prevSelected ? {
            ...prevSelected,
            reviews: newReviewsCount,
            rating: newRating
          } : null);
        }
        
        return {
          ...b,
          reviews: newReviewsCount,
          rating: newRating
        };
      }
      return b;
    }));
  };

  // Helper to sync new dynamic reservation into admin operations database
  const addReservationToAdmin = (bookingItem: Branch) => {
    try {
      const saved = localStorage.getItem('gs_op_reservations');
      let currentReservations = [];
      if (saved) {
        currentReservations = JSON.parse(saved);
      } else {
        currentReservations = [
          { id: 'BK-001', guestName: 'Nguyễn Lâm Anh', phone: '0981 123 456', email: 'lamanh.ng@gmail.com', branchId: 'thai-nguyen', branchName: 'GrandStay Premier Thai Nguyen', roomName: 'Phòng 102 (Deluxe Twin)', checkIn: '2026-06-26', checkOut: '2026-06-29', status: 'CheckedIn', totalPrice: 9000000, rooms: 1, specialRequest: 'Yêu cầu phòng tầng cao, yên tĩnh.' },
          { id: 'BK-002', guestName: 'Phạm Quốc Bảo', phone: '0912 334 455', email: 'baopq@yahoo.com', branchId: 'phu-quoc', branchName: 'GrandStay Beachfront Resort Phu Quoc', roomName: 'Villa 101 (Ocean Pool Beachfront)', checkIn: '2026-06-25', checkOut: '2026-06-28', status: 'CheckedIn', totalPrice: 13500000, rooms: 1, specialRequest: 'Chuẩn bị nến lãng mạn kỷ niệm ngày cưới.' },
          { id: 'BK-003', guestName: 'Trần Hoàng Long', phone: '0911 223 344', email: 'long.th@gmail.com', branchId: 'da-nang', branchName: 'GrandStay Lux Waterfront Da Nang', roomName: 'Phòng 501 (Grand Lux Skyline)', checkIn: '2026-06-26', checkOut: '2026-06-29', status: 'CheckedIn', totalPrice: 11250000, rooms: 1, specialRequest: '' },
          { id: 'BK-004', guestName: 'Đỗ Thị Minh', phone: '0933 445 566', email: 'minhdt@outlook.com', branchId: 'thai-nguyen', branchName: 'GrandStay Premier Thai Nguyen', roomName: 'Phòng 101 (Deluxe Double)', checkIn: '2026-06-27', checkOut: '2026-06-30', status: 'Reserved', totalPrice: 6000000, rooms: 1, specialRequest: 'Check-in sớm lúc 11:00 nếu có thể.' },
          { id: 'BK-005', guestName: 'Lương Thế Vinh', phone: '0945 667 788', email: 'vinhlt@gmail.com', branchId: 'sapa', branchName: 'GrandStay Cloud Retreat Sapa', roomName: 'Biệt thự trên mây 302', checkIn: '2026-06-28', checkOut: '2026-07-02', status: 'Reserved', totalPrice: 16500000, rooms: 1, specialRequest: 'Đưa đón ga Sapa bằng xe Limousine.' },
          { id: 'BK-006', guestName: 'Lê Thuỳ Trang', phone: '0988 776 655', email: 'trang.lt@yahoo.com', branchId: 'phu-quoc', branchName: 'GrandStay Beachfront Resort Phu Quoc', roomName: 'Villa 102 (Two-Bedroom Villa)', checkIn: '2026-06-24', checkOut: '2026-06-27', status: 'CheckedOut', totalPrice: 13500000, rooms: 1, specialRequest: 'Thanh toán bằng thẻ Visa doanh nghiệp.' }
        ];
      }
      
      const newRes = {
        id: bookingItem.bookingCode || `CONF-${1000 + Math.floor(Math.random() * 1000)}`,
        guestName: bookingItem.guestName,
        phone: bookingItem.guestPhone,
        email: bookingItem.guestEmail,
        branchId: bookingItem.id,
        branchName: bookingItem.name,
        roomName: bookingItem.rooms === 1 ? 'Phòng Premium 101' : `Đoàn ${bookingItem.rooms} Phòng`,
        checkIn: bookingItem.checkIn,
        checkOut: bookingItem.checkOut,
        status: 'Reserved',
        totalPrice: bookingItem.totalPrice,
        rooms: bookingItem.rooms,
        specialRequest: bookingItem.description || 'Đặt phòng trực tuyến qua Customer Portal.',
        paymentMethod: bookingItem.paymentMethod
      };

      const filtered = currentReservations.filter((r: any) => r.id !== newRes.id);
      filtered.push(newRes);
      localStorage.setItem('gs_op_reservations', JSON.stringify(filtered));
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookingSuccess = (bookedItem: Branch, totalPrice: number) => {
    setBookedList((prev) => [...prev, bookedItem]);
    addReservationToAdmin(bookedItem);

    // Award loyalty points based on booking value (10,000 VND = 1 point)
    const earned = Math.floor(totalPrice / 10000);
    handleUpdateUser({
      ...currentUser,
      loyaltyPoints: (currentUser.loyaltyPoints || 0) + earned
    });
  };

  // Scroll smoothly to search box
  const scrollToSearch = () => {
    const el = document.getElementById('search-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <ErrorBoundary>
    <div className="min-h-screen flex flex-col justify-between bg-[#fdfdfd] text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      <ScrollToTop />

      {/* Premium Header - Persistent and displays profile state */}
      <Header 
        onSearchClick={scrollToSearch} 
        activeBranchCount={bookedList.length} 
        currentView={currentView}
        setCurrentView={handleSetCurrentView}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        usersList={usersList}
        onOpenLogin={() => setShowLoginModal(true)}
      />

      {/* Main Content Page Views with React Router Routes */}
      <main className="flex-grow">
        <ErrorBoundary>
          <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <Routes>
              <Route path="/" element={
                <HomePage
                  searchQuery={searchQuery}
                  onSearch={handleSearch}
                  onBook={handleOpenBooking}
                  branches={branches}
                  apartments={apartments}
                  currentUser={currentUser}
                  onUpdateUser={handleUpdateUser}
                  onSearchClick={scrollToSearch}
                />
              } />
              <Route path="/member" element={
                <MemberPage
                  bookedList={bookedList}
                  onBackToHome={() => handleSetCurrentView('home')}
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
              onUpdateBookedList={setBookedList}
            />
          } />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Premium Footer */}
      <Footer />

      {/* Login Portal Auth Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <LoginPortal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            usersList={usersList}
            setUsersList={setUsersList}
          />
        )}
      </AnimatePresence>

      {/* Booking Confirmation Dialog Modal */}
      <AnimatePresence>
        {selectedBranch && (
          <BookingModal
            selectedBranch={selectedBranch}
            onClose={handleCloseBooking}
            searchQuery={searchQuery}
            currentUser={currentUser}
            onReviewAdded={handleReviewAdded}
            onBookingSuccess={handleBookingSuccess}
          />
        )}
      </AnimatePresence>

    </div>
    </ErrorBoundary>
  );
}
