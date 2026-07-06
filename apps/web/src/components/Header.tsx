import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ShoppingBag, Menu, X, ChevronDown, User, Sparkles, Shield, Home, RefreshCw, Award, LogOut } from 'lucide-react';
import { UserSim } from '../types';
import { MOCK_USERS } from '../mockUsers';
import { getTierInfo } from '../utils/loyalty';

interface HeaderProps {
  onSearchClick: () => void;
  activeBranchCount: number;
  currentView: 'home' | 'member' | 'admin';
  setCurrentView: (view: 'home' | 'member' | 'admin') => void;
  currentUser: UserSim;
  setCurrentUser: (user: UserSim) => void;
  usersList: UserSim[];
  onOpenLogin: () => void;
}

export default function Header({ 
  onSearchClick, 
  activeBranchCount, 
  currentView, 
  setCurrentView,
  currentUser,
  setCurrentUser,
  usersList,
  onOpenLogin
}: HeaderProps) {
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('VI');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const languages = [
    { code: 'VI', label: 'Tiếng Việt' },
    { code: 'EN', label: 'English' },
    { code: 'JA', label: '日本語' },
  ];

  const isAdmin = currentUser.role !== 'member';

  return (
    <header id="main-header" className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          onClick={() => setCurrentView('home')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-brand-blue transition-colors duration-300">
            G
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight">
            Grand<span className="text-brand-blue">Stay</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => setCurrentView('member')}
            className={`font-sans text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 cursor-pointer border-none bg-transparent ${currentView === 'member' ? 'text-brand-blue' : 'text-slate-600 hover:text-brand-blue'}`}
          >
            <Sparkles className="w-4 h-4 text-brand-gold animate-pulse" />
            X Member
          </button>
          <a href="#long-term" onClick={() => setCurrentView('home')} className="font-sans text-sm font-medium text-slate-600 hover:text-brand-blue transition-colors duration-200">
            Long-term Rooms
          </a>
          <a href="#about" onClick={() => setCurrentView('home')} className="font-sans text-sm font-medium text-slate-600 hover:text-brand-blue transition-colors duration-200">
            About GrandStay
          </a>
        </nav>

        {/* Right Controls */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 h-10 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200/60 text-slate-700 text-sm font-medium transition-all duration-200"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>{currentLang}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-250 ${langOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-40 rounded-xl bg-white border border-slate-100 shadow-xl py-1.5 z-20 overflow-hidden"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLang(lang.code);
                          setLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                          currentLang === lang.code
                            ? 'bg-blue-50/50 text-brand-blue font-semibold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Core Search Action (redirects to search view) */}
          <button
            onClick={() => {
              setCurrentView('home');
              setTimeout(onSearchClick, 50);
            }}
            className="bg-brand-blue hover:bg-brand-blue-hover text-white px-5 h-11 rounded-lg text-sm font-semibold shadow-md shadow-blue-500/15 hover:shadow-blue-500/25 transition-all duration-300 transform active:scale-98 cursor-pointer"
          >
            Search Rooms
          </button>

          {/* Cart Icon / Booking History Indicator */}
          <button 
            onClick={() => setCurrentView('member')}
            className="relative cursor-pointer p-2.5 rounded-lg hover:bg-slate-50 transition-colors duration-200 border-none bg-transparent"
          >
            <ShoppingBag className="w-5 h-5 text-slate-700" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
              {activeBranchCount}
            </span>
          </button>

          {/* Unified Profile Dropdown Button or Login Button */}
          {currentUser.id === 'guest' ? (
            <button
              onClick={onOpenLogin}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 h-11 rounded-xl text-sm font-bold shadow-sm transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Đăng nhập</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200/80 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100/60 shadow-sm transition-all duration-200 cursor-pointer text-left h-11"
              >
                {/* Initials Circle */}
                <div className={`w-7.5 h-7.5 rounded-full font-bold text-xs flex items-center justify-center shadow-inner text-white ${
                  currentUser.role === 'member' ? 'bg-gradient-to-tr from-amber-500 to-amber-600' : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                }`}>
                  {currentUser.avatarInitials}
                </div>
                <div className="flex flex-col pr-1">
                  <span className="text-xs font-extrabold text-slate-900 leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium leading-none">
                    {currentUser.roleName}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-250 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

            <AnimatePresence>
              {profileDropdownOpen && (
                <>
                  {/* Backdrop click outside */}
                  <div className="fixed inset-0 z-30 cursor-default" onClick={() => setProfileDropdownOpen(false)} />
                  
                  {/* Dropdown Menu Panel */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-100 shadow-2xl py-3 z-40 overflow-hidden text-left"
                  >
                    {/* User header profile detail */}
                    <div className="px-4 py-3 bg-slate-900 text-white flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center border border-white/10 text-white ${
                        currentUser.role === 'member' ? 'bg-amber-500' : 'bg-blue-600'
                      }`}>
                        {currentUser.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs truncate text-white">{currentUser.name}</h4>
                        <p className="text-[10px] text-slate-400 truncate font-light">{currentUser.email}</p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <span className={`inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none ${
                            currentUser.role === 'member' 
                              ? 'bg-amber-400/20 text-brand-gold border border-brand-gold/10' 
                              : 'bg-blue-500/20 text-blue-400 border border-blue-400/10'
                          }`}>
                            {currentUser.role === 'member' ? getTierInfo(currentUser.loyaltyPoints || 0).current : (currentUser.tier || 'ADMIN')}
                          </span>
                          {currentUser.role === 'member' && (
                            <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-0.5">
                              <Award className="w-3 h-3 shrink-0" />
                              {(currentUser.loyaltyPoints || 0).toLocaleString()} PTS
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Simulation Switcher widget inside dropdown */}
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100/80">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Mô phỏng tài khoản</label>
                        <RefreshCw className="w-3 h-3 text-slate-400 animate-spin-slow" />
                      </div>
                      <select 
                        value={currentUser.id}
                        onChange={(e) => {
                          const selected = usersList.find(u => u.id === e.target.value);
                          if (selected) {
                            setCurrentUser(selected);
                            setProfileDropdownOpen(false);
                            setCurrentView('home');
                          }
                        }}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-bold focus:outline-none focus:border-blue-500 shadow-sm"
                      >
                        {usersList.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.roleName})
                          </option>
                        ))}
                      </select>
                      <span className="text-[9px] text-slate-400 font-light mt-1 block">
                        * Thay đổi để kiểm tra phân quyền & giao diện khác nhau
                      </span>
                    </div>

                    {/* Navigation Menu Links */}
                    <div className="p-1.5 space-y-0.5">
                      
                      {currentView !== 'home' && (
                        <button
                          onClick={() => {
                            setCurrentView('home');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Home className="w-4 h-4 text-slate-400" />
                          <span>Về Trang Chủ</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setCurrentView('member');
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                          currentView === 'member'
                            ? 'bg-amber-50 text-amber-600 font-extrabold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-brand-gold" />
                        <span>Trang Cá Nhân & Hội Viên</span>
                      </button>

                      {/* Admin Tab: ONLY shown if user has admin permission (role is not member) */}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setCurrentView('admin');
                            setProfileDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                            currentView === 'admin'
                              ? 'bg-blue-50 text-blue-600 font-extrabold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span>Trang Quản Trị Hệ Thống</span>
                        </button>
                      )}

                    </div>

                    <div className="border-t border-slate-100 p-1.5">
                      <button
                        onClick={() => {
                          const guestUser = {
                            id: 'guest',
                            name: 'Khách',
                            email: '',
                            phone: '',
                            role: 'member',
                            roleName: 'Chưa đăng nhập',
                            avatarInitials: 'K',
                            tier: 'Silver',
                            loyaltyPoints: 0
                          };
                          setCurrentUser(guestUser);
                          localStorage.setItem('gs_active_user', JSON.stringify(guestUser));
                          setProfileDropdownOpen(false);
                          setCurrentView('home');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer border-none bg-transparent"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>

                    {/* Tiny logout helper */}
                    <div className="border-t border-slate-100 pt-1.5 px-4 text-[10px] text-slate-400 font-mono text-center">
                      GrandStay Connection ID: Active
                    </div>

                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          )}

        </div>

        {/* Mobile Menu Trigger */}
        <div className="md:hidden flex items-center gap-3">
          <button 
            onClick={() => setCurrentView('member')}
            className="relative cursor-pointer p-2 rounded-lg hover:bg-slate-100 border-none bg-transparent"
          >
            <ShoppingBag className="w-5.5 h-5.5 text-slate-700" />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">
              {activeBranchCount}
            </span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              
              {/* Account summary on mobile */}
              {currentUser.id === 'guest' ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2 shadow-sm border-none cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Đăng nhập hệ thống</span>
                </button>
              ) : (
                <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center text-white ${
                      currentUser.role === 'member' ? 'bg-amber-500' : 'bg-blue-600'
                    }`}>
                      {currentUser.avatarInitials}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-white">{currentUser.name}</h4>
                      <span className="text-[10px] text-slate-400 block leading-none">{currentUser.roleName} ({currentUser.tier || 'Member'})</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const guestUser = {
                        id: 'guest',
                        name: 'Khách',
                        email: '',
                        phone: '',
                        role: 'member',
                        roleName: 'Chưa đăng nhập',
                        avatarInitials: 'K',
                        tier: 'Silver',
                        loyaltyPoints: 0
                      };
                      setCurrentUser(guestUser);
                      localStorage.setItem('gs_active_user', JSON.stringify(guestUser));
                      setMobileMenuOpen(false);
                      setCurrentView('home');
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-rose-300 hover:text-rose-400 flex items-center justify-center border-none cursor-pointer"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Mobile Simulation Switcher */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/50">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Mô phỏng tài khoản (Switch Role)</label>
                <select 
                  value={currentUser.id}
                  onChange={(e) => {
                    const selected = MOCK_USERS.find(u => u.id === e.target.value);
                    if (selected) {
                      setCurrentUser(selected);
                      setMobileMenuOpen(false);
                      setCurrentView('home');
                    }
                  }}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 text-slate-700 font-bold focus:outline-none"
                >
                  {MOCK_USERS.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.roleName})</option>
                  ))}
                </select>
              </div>

              {/* Mobile links */}
              <div className="space-y-2 pt-2">
                
                {currentView !== 'home' && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCurrentView('home');
                    }}
                    className="w-full text-left py-2.5 text-base font-semibold text-slate-700 border-b border-slate-50 flex items-center gap-2 bg-transparent border-none cursor-pointer"
                  >
                    <Home className="w-5 h-5 text-slate-400" />
                    Trang chủ GrandStay
                  </button>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCurrentView('member');
                  }}
                  className="w-full text-left py-2.5 text-base font-semibold text-amber-600 border-b border-slate-50 flex items-center gap-2 bg-transparent border-none cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-brand-gold animate-pulse" />
                  Hội viên VIP & Trang cá nhân
                </button>

                {/* Mobile Admin tab check */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCurrentView('admin');
                    }}
                    className="w-full text-left py-2.5 text-base font-semibold text-blue-600 border-b border-slate-50 flex items-center gap-2 bg-transparent border-none cursor-pointer"
                  >
                    <Shield className="w-5 h-5 text-blue-500" />
                    Quản trị hệ thống (Admin)
                  </button>
                )}

                <a
                  href="#long-term"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCurrentView('home');
                  }}
                  className="block py-2.5 text-base font-semibold text-slate-700 border-b border-slate-50"
                >
                  Long-term Rooms
                </a>
                
                <a
                  href="#about"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCurrentView('home');
                  }}
                  className="block py-2.5 text-base font-semibold text-slate-700 border-b border-slate-50"
                >
                  About GrandStay
                </a>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-slate-500">Language:</span>
                <div className="flex gap-2">
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => setCurrentLang(l.code)}
                      className={`px-3 py-1 text-xs rounded-full border ${currentLang === l.code ? 'bg-brand-blue text-white border-brand-blue' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentView('home');
                  setMobileMenuOpen(false);
                  setTimeout(onSearchClick, 100);
                }}
                className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold text-center"
              >
                Search Rooms Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
