import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Mail, Lock, User, Phone, Chrome, Settings, AlertCircle, 
  CheckCircle2, KeyRound, Sparkles, RefreshCw, Shield, Info, 
  ChevronRight, Sliders, Eye, EyeOff
} from 'lucide-react';
import { UserSim } from '../types';

interface LoginPortalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSim;
  setCurrentUser: (user: UserSim) => void;
  usersList: UserSim[];
  setUsersList: React.Dispatch<React.SetStateAction<UserSim[]>>;
}

export default function LoginPortal({
  isOpen,
  onClose,
  currentUser,
  setCurrentUser,
  usersList,
  setUsersList
}: LoginPortalProps) {
  // Navigation tabs: 'login' | 'register' | 'forgot' | 'auth0-config'
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'auth0-config'>('login');
  
  // Auth0 config state (persisted to localStorage)
  const [auth0Domain, setAuth0Domain] = useState(() => {
    return localStorage.getItem('gs_auth0_domain') || (import.meta as any).env.VITE_AUTH0_DOMAIN || '';
  });
  const [auth0ClientId, setAuth0ClientId] = useState(() => {
    return localStorage.getItem('gs_auth0_client_id') || (import.meta as any).env.VITE_AUTH0_CLIENT_ID || '';
  });
  const [auth0Mode, setAuth0Mode] = useState<'simulated' | 'live'>(() => {
    return (localStorage.getItem('gs_auth0_mode') as 'simulated' | 'live') || 'simulated';
  });

  // Save Auth0 settings
  useEffect(() => {
    localStorage.setItem('gs_auth0_domain', auth0Domain);
    localStorage.setItem('gs_auth0_client_id', auth0ClientId);
    localStorage.setItem('gs_auth0_mode', auth0Mode);
  }, [auth0Domain, auth0ClientId, auth0Mode]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Register states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1); // 1: request, 2: enter code, 3: success
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Interaction feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset form states on tab change
  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(false);
  }, [activeTab]);

  // Handle message from OAuth popup callback
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      // Trust local origins
      if (!event.origin.endsWith('.run.app') && !event.origin.includes('localhost')) {
        return;
      }

      if (event.data?.type === 'AUTH0_CALLBACK_SUCCESS') {
        const { email, name, picture } = event.data;
        
        // Match existing user or create a new user profile
        let matchedUser = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!matchedUser) {
          const initials = name ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'GS';
          matchedUser = {
            id: `auth0-${Date.now()}`,
            name: name || email.split('@')[0],
            email: email,
            phone: '',
            role: 'member',
            roleName: 'Hội viên VIP (Auth0)',
            avatarInitials: initials,
            tier: 'Silver',
            loyaltyPoints: 0
          };
          setUsersList(prev => [...prev, matchedUser!]);
        }

        setCurrentUser(matchedUser);
        setSuccessMessage('Đăng nhập thành công qua Auth0!');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [usersList, setCurrentUser, setUsersList, onClose]);

  // 1. Traditional Email Login
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setIsLoading(true);

    // Simulate database latency
    setTimeout(() => {
      // Check mock users
      const matched = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (matched) {
        setCurrentUser(matched);
        setSuccessMessage(`Chào mừng trở lại, ${matched.name}!`);
        setIsLoading(false);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        // If not found in mock list, let's create a verified custom user account for them
        // to ensure zero barriers to entry while simulating a robust auth database
        const initials = email.substring(0, 2).toUpperCase();
        const newUser: UserSim = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0],
          email: email,
          phone: '',
          role: 'member',
          roleName: 'Hội viên VIP',
          avatarInitials: initials,
          tier: 'Silver',
          loyaltyPoints: 100
        };

        setUsersList(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        setSuccessMessage('Đăng nhập thành công! Tài khoản mới đã được khởi tạo.');
        setIsLoading(false);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    }, 1000);
  };

  // 2. Email Registration
  const handleEmailRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName || !registerEmail || !registerPassword || !confirmPassword) {
      setErrorMessage('Vui lòng điền đầy đủ tất cả thông tin bắt buộc.');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    if (registerPassword.length < 6) {
      setErrorMessage('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Check if email already registered
      const emailExists = usersList.some(u => u.email.toLowerCase() === registerEmail.toLowerCase());
      if (emailExists) {
        setErrorMessage('Email này đã được sử dụng. Vui lòng đăng nhập.');
        setIsLoading(false);
        return;
      }

      // Generate avatar initials
      const nameParts = fullName.trim().split(' ');
      let initials = 'GS';
      if (nameParts.length > 0) {
        initials = nameParts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
      }

      // Create new user profile
      const newUser: UserSim = {
        id: `user-${Date.now()}`,
        name: fullName,
        email: registerEmail,
        phone: phone,
        role: 'member',
        roleName: 'Hội viên VIP',
        avatarInitials: initials,
        tier: 'Silver',
        loyaltyPoints: 100 // Welcome points!
      };

      setUsersList(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setSuccessMessage('Đăng ký tài khoản thành công! Điểm thưởng chào mừng: +100 PTS.');
      setIsLoading(false);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1200);
  };

  // 3. Forgot Password Flow
  const handleForgotPasswordRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMessage('Vui lòng nhập Email của bạn.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      // Simulate sending OTP
      setIsLoading(false);
      setForgotStep(2);
      setSuccessMessage('Mã xác minh gồm 6 số đã được gửi đến email của bạn.');
    }, 1200);
  };

  const handleVerifyResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode) {
      setErrorMessage('Vui lòng nhập mã xác minh.');
      return;
    }
    if (resetCode !== '123456' && resetCode.length !== 6) {
      setErrorMessage('Mã xác minh không chính xác. Thử lại với mã: 123456');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsLoading(false);
      setForgotStep(3);
      setSuccessMessage('Mật khẩu của bạn đã được cập nhật thành công!');
    }, 1000);
  };

  // 4. Auth0 & Google OAuth Actions
  const handleThirdPartyLogin = (provider: 'google' | 'auth0') => {
    setErrorMessage('');
    setSuccessMessage('');

    if (auth0Mode === 'live') {
      // Check if keys are set
      if (!auth0Domain || !auth0ClientId) {
        setErrorMessage('Chưa cấu hình Auth0 Client ID hoặc Domain. Vui lòng chuyển sang Chế độ mô phỏng hoặc vào phần Cấu hình Auth0 để cập nhật.');
        return;
      }

      setIsLoading(true);

      // Construct Auth0 Popup URL
      const redirectUri = `${window.location.origin}/auth/callback`;
      const nonce = Math.random().toString(36).substring(7);
      
      // If provider is Google, we append the connection parameter to force Google auth
      const connectionParam = provider === 'google' ? '&connection=google-oauth2' : '';
      
      const auth0Url = `https://${auth0Domain}/authorize?` + new URLSearchParams({
        client_id: auth0ClientId,
        redirect_uri: redirectUri,
        response_type: 'token id_token',
        scope: 'openid profile email',
        nonce: nonce,
        audience: `https://${auth0Domain}/api/v2/`
      }).toString() + connectionParam;

      // Open popup directly
      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        auth0Url,
        'auth0_popup',
        `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes`
      );

      if (!popup) {
        setIsLoading(false);
        setErrorMessage('Popup đã bị chặn bởi trình duyệt. Vui lòng cho phép mở popup và thử lại.');
      } else {
        // Monitor popup close or timeout
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setIsLoading(false);
          }
        }, 1000);
      }
    } else {
      // SIMULATED OAUTH MODE
      setIsLoading(true);
      
      setTimeout(() => {
        setIsLoading(false);
        
        // Pick or generate a beautiful profile based on selection
        let simulatedUser: UserSim;
        if (provider === 'google') {
          simulatedUser = {
            id: `google-${Date.now()}`,
            name: 'Nguyễn Minh Quân (Google)',
            email: 'minhquan.nguyen@gmail.com',
            phone: '0977 123 456',
            role: 'member',
            roleName: 'Hội viên VIP (Google)',
            avatarInitials: 'MQ',
            tier: 'Platinum Elite',
            loyaltyPoints: 350
          };
        } else {
          simulatedUser = {
            id: `auth0-${Date.now()}`,
            name: 'Lâm Hoàng Phong (Auth0)',
            email: 'hoangphong.lam@auth0.com',
            phone: '0933 999 888',
            role: 'member',
            roleName: 'Hội viên VIP (Auth0)',
            avatarInitials: 'HP',
            tier: 'Gold Elite',
            loyaltyPoints: 600
          };
        }

        // Add to usersList and set as active session
        setUsersList(prev => {
          if (!prev.some(u => u.email.toLowerCase() === simulatedUser.email.toLowerCase())) {
            return [...prev, simulatedUser];
          }
          return prev;
        });

        setCurrentUser(simulatedUser);
        setSuccessMessage(`Đăng nhập thành công bằng ${provider === 'google' ? 'Google' : 'Auth0'} (Mô Phỏng)!`);
        
        setTimeout(() => {
          onClose();
        }, 1200);
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Main modal container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header with Title and Close Button */}
        <div className="px-6 py-5 border-b border-slate-100/80 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-brand-blue block mb-0.5">
              GrandStay Authentication
            </span>
            <h3 className="font-display text-lg font-extrabold text-slate-900">
              {activeTab === 'login' && 'Đăng Nhập Tài Khoản'}
              {activeTab === 'register' && 'Đăng Ký Thành Viên'}
              {activeTab === 'forgot' && 'Khôi Phục Mật Khẩu'}
              {activeTab === 'auth0-config' && 'Cấu Hình Auth0 Integration'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher buttons for login and register */}
        {activeTab !== 'forgot' && activeTab !== 'auth0-config' && (
          <div className="grid grid-cols-2 border-b border-slate-100/60">
            <button
              onClick={() => setActiveTab('login')}
              className={`py-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'login' 
                  ? 'border-brand-blue text-brand-blue bg-blue-50/10' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/40'
              }`}
            >
              Tôi đã có tài khoản
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`py-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'register' 
                  ? 'border-brand-blue text-brand-blue bg-blue-50/10' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/40'
              }`}
            >
              Tạo tài khoản mới
            </button>
          </div>
        )}

        {/* Scrollable Form Body content */}
        <div className="p-6 overflow-y-auto flex-grow max-h-[60vh] space-y-5">
          
          {/* Status alerts */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-xs font-semibold text-rose-600"
              >
                <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
            
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-600"
              >
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email thành viên <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Mật khẩu <span className="text-rose-500">*</span></label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-[11px] font-bold text-brand-blue hover:underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập ít nhất 6 ký tự..."
                    className="w-full pl-10 pr-10 py-3 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white py-3 rounded-xl text-sm font-bold shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang xác thực thông tin...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng Nhập Thành Viên</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleEmailRegister} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Họ và tên thành viên <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Địa chỉ Email <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Số điện thoại liên hệ</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Mật khẩu <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Xác nhận mật khẩu <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Xác nhận..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white py-3 rounded-xl text-sm font-bold shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang tạo tài khoản...</span>
                  </>
                ) : (
                  <>
                    <span>Hoàn Tất Đăng Ký Hội Viên</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD FLOW */}
          {activeTab === 'forgot' && (
            <div className="space-y-4">
              {forgotStep === 1 && (
                <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Nhập email đã đăng ký của bạn bên dưới. Chúng tôi sẽ gửi một mã OTP gồm 6 số để bạn tiến hành đặt lại mật khẩu của mình.
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Địa chỉ Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-brand-blue text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-brand-blue-hover transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Gửi Mã Xác Minh'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setForgotStep(1);
                    }}
                    className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Quay lại đăng nhập
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyResetCode} className="space-y-4">
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-start gap-2 text-xs text-amber-700">
                    <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>Hệ thống đã gửi mã. Để kiểm thử, bạn có thể nhập mã: <b>123456</b></span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Mã xác minh (OTP)</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm font-mono tracking-widest text-center focus:outline-none focus:border-brand-blue focus:bg-white text-slate-800 placeholder-slate-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Mật khẩu mới</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới từ 6 ký tự..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-brand-blue focus:bg-white text-slate-800 placeholder-slate-400"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-blue text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-brand-blue-hover transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Đặt Lại Mật Khẩu'}
                  </button>
                </form>
              )}

              {forgotStep === 3 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-sm">Đặt lại thành công!</h4>
                    <p className="text-xs text-slate-500">Mật khẩu của bạn đã được cập nhật. Giờ đây bạn có thể đăng nhập bằng thông tin mới.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setForgotStep(1);
                    }}
                    className="bg-brand-blue text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-brand-blue-hover transition-all cursor-pointer"
                  >
                    Đăng Nhập Ngay
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DEVELOPER AUTH0 CONFIG PANEL */}
          {activeTab === 'auth0-config' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Trạng thái kết nối Auth0</span>
                  <div className="flex bg-slate-200 rounded-lg p-0.5 text-[10px] font-black">
                    <button
                      onClick={() => setAuth0Mode('simulated')}
                      className={`px-2 py-1 rounded-md transition-all ${auth0Mode === 'simulated' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500'}`}
                    >
                      MÔ PHỎNG
                    </button>
                    <button
                      onClick={() => setAuth0Mode('live')}
                      className={`px-2 py-1 rounded-md transition-all ${auth0Mode === 'live' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-500'}`}
                    >
                      LIVE (THỰC TẾ)
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 leading-relaxed">
                  {auth0Mode === 'simulated' ? (
                    <span className="text-amber-600 font-medium">
                      ⚠️ <b>Chế độ mô phỏng:</b> Không cần điền mã cấu hình. Click vào Google hoặc Auth0 sẽ giả lập đăng nhập thành công. Thích hợp để xem thử giao diện ngay lập tức.
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium">
                      🟢 <b>Chế độ Live:</b> Thực hiện liên kết thực tế với tenant Auth0 của bạn qua cửa sổ Popup chuẩn. Hãy điền các thông tin của ứng dụng của bạn ở bên dưới.
                    </span>
                  )}
                </div>
              </div>

              {auth0Mode === 'live' && (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Auth0 Domain</label>
                    <input
                      type="text"
                      value={auth0Domain}
                      onChange={(e) => setAuth0Domain(e.target.value)}
                      placeholder="example-tenant.us.auth0.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Auth0 Client ID</label>
                    <input
                      type="text"
                      value={auth0ClientId}
                      onChange={(e) => setAuth0ClientId(e.target.value)}
                      placeholder="Enter your Client ID"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-xl space-y-2">
                    <h5 className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-600" />
                      Yêu cầu cấu hình tại Auth0 Dashboard:
                    </h5>
                    <p className="text-[10px] text-blue-700 leading-relaxed">
                      Để popup hoạt động, bạn cần đăng nhập Auth0 và cấu hình callback URI này vào mục <b>Allowed Callback URLs</b> và <b>Allowed Web Origins</b>:
                    </p>
                    <div className="bg-slate-900 text-slate-200 p-2 rounded-lg font-mono text-[9px] select-all break-all border border-slate-800 flex justify-between items-center">
                      <span>{window.location.origin}/auth/callback</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setSuccessMessage('Đã lưu cấu hình Auth0!');
                  setTimeout(() => {
                    setActiveTab('login');
                  }, 800);
                }}
                className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold cursor-pointer hover:bg-black transition-colors"
              >
                Lưu Thay Đổi & Quay Lại
              </button>
            </div>
          )}

          {/* Social / Third-Party Login Options (Google, Auth0) */}
          {activeTab !== 'auth0-config' && (
            <div className="space-y-3.5 pt-3 border-t border-slate-100">
              <div className="relative flex py-1.5 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold tracking-widest text-slate-400">Hoặc tiếp tục bằng</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => handleThirdPartyLogin('google')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-xs text-slate-700 transition-all duration-200 hover:border-slate-300 cursor-pointer active:scale-98"
                  disabled={isLoading}
                >
                  <Chrome className="w-4 h-4 text-rose-500" />
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleThirdPartyLogin('auth0')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-xs text-slate-700 transition-all duration-200 hover:border-slate-300 cursor-pointer active:scale-98"
                  disabled={isLoading}
                >
                  <div className="w-4 h-4 bg-orange-600 text-white font-extrabold rounded-full flex items-center justify-center text-[8px] tracking-tighter">A0</div>
                  <span>Auth0</span>
                </button>
              </div>

              {/* Developer Configuration Link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('auth0-config')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Cấu hình Auth0 cho ứng dụng</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
