import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    try {
      // Parse parameters from both hash (implicit grant) and search (authorization code)
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      
      const hashParams = new URLSearchParams(hash.substring(1)); // strip leading '#'
      const searchParams = new URLSearchParams(search);

      const idToken = hashParams.get('id_token') || searchParams.get('id_token');
      const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
      const error = hashParams.get('error') || searchParams.get('error') || searchParams.get('error_description');

      if (error) {
        throw new Error(decodeURIComponent(error));
      }

      if (idToken) {
        // Decode JWT payload without external libraries
        const base64Url = idToken.split('.')[1];
        if (!base64Url) {
          throw new Error('Mã thông tin ID Token không hợp lệ.');
        }

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          window.atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);

        // Notify parent window
        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'AUTH0_CALLBACK_SUCCESS',
              email: payload.email,
              name: payload.name || payload.nickname || payload.email?.split('@')[0],
              picture: payload.picture,
              token: accessToken
            },
            window.location.origin
          );
          
          setStatus('success');
          setTimeout(() => {
            window.close();
          }, 800);
        } else {
          // If loaded directly without window.opener (for some reason), persist and redirect
          setStatus('success');
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);
        }
      } else {
        // If no token, maybe we are simulating or nothing is provided
        setStatus('error');
        setErrorMsg('Không tìm thấy thông tin xác thực ID Token trong phản hồi từ Auth0.');
      }
    } catch (err: any) {
      console.error('Error during Auth0 callback processing:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Xảy ra lỗi trong quá trình xử lý xác thực.');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
        {status === 'processing' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-full mx-auto flex items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-extrabold text-slate-900">Xác Thực Thông Tin...</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đang xử lý kết quả đăng nhập từ máy chủ Auth0. Vui lòng giữ nguyên cửa sổ này.
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-extrabold text-slate-900">Liên Kết Thành Công</h3>
              <p className="text-xs text-emerald-600 leading-relaxed">
                Đăng nhập Auth0 được phê duyệt. Cửa sổ này sẽ tự động đóng ngay bây giờ.
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-extrabold text-slate-900 text-rose-600">Xác Thực Thất Bại</h3>
              <p className="text-xs text-rose-500 leading-relaxed font-medium">
                {errorMsg}
              </p>
            </div>
            <button
              onClick={() => {
                if (window.opener) {
                  window.close();
                } else {
                  navigate('/');
                }
              }}
              className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Quay Lại Ứng Dụng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
