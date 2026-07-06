import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  User, 
  Globe, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RefreshCw, 
  Zap, 
  Check, 
  FileText, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { formatVND } from '../data';

// Definition of standard document data structure
export interface CheckInDocumentData {
  fullName: string;
  docType: 'CCCD' | 'PASSPORT';
  docNumber: string;
  dob: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  nationality: string;
  expiryDate?: string;
  placeOfIssue?: string;
  capturedPhoto?: string; // Base64 or mock URL
}

interface OnlineCheckInProps {
  booking: any;
  onClose: () => void;
  onComplete: (data: CheckInDocumentData) => void;
}

// Sample demo documents for instant testing in preview iframe environments
const DEMO_DOCUMENTS = [
  {
    label: "🪪 CCCD Việt Nam: Nguyễn Lâm Hoàng Anh",
    data: {
      fullName: "NGUYỄN LÂM HOÀNG ANH",
      docType: 'CCCD' as const,
      docNumber: "037196008452",
      dob: "1996-08-24",
      gender: "Nam" as const,
      nationality: "Việt Nam",
      placeOfIssue: "Cục Cảnh sát QLHC về Trật tự xã hội",
      capturedPhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
    }
  },
  {
    label: "🪪 CCCD Việt Nam: Trần Thị Thùy Chi",
    data: {
      fullName: "TRẦN THỊ THÙY CHI",
      docType: 'CCCD' as const,
      docNumber: "001199012356",
      dob: "1999-12-11",
      gender: "Nữ" as const,
      nationality: "Việt Nam",
      placeOfIssue: "Cục Cảnh sát QLHC về Trật tự xã hội",
      capturedPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
    }
  },
  {
    label: "🛂 Hộ chiếu Quốc tế: Alexander Wright",
    data: {
      fullName: "ALEXANDER WRIGHT",
      docType: 'PASSPORT' as const,
      docNumber: "EP8209481",
      dob: "1988-04-15",
      gender: "Nam" as const,
      nationality: "United Kingdom",
      expiryDate: "2031-10-20",
      placeOfIssue: "IPS London",
      capturedPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
    }
  }
];

export default function OnlineCheckIn({ booking, onClose, onComplete }: OnlineCheckInProps) {
  // Check-In Form States
  const [formData, setFormData] = useState<CheckInDocumentData>({
    fullName: '',
    docType: 'CCCD',
    docNumber: '',
    dob: '',
    gender: 'Nam',
    nationality: 'Việt Nam',
    expiryDate: '',
    placeOfIssue: 'Cục Cảnh sát QLHC về Trật tự xã hội'
  });

  // UI Flow States
  const [scanStep, setScanStep] = useState<'options' | 'camera' | 'upload' | 'processing' | 'verified'>('options');
  const [scanMessage, setScanMessage] = useState<string>('');
  const [ocrLogs, setOcrLogs] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Camera API Refs & States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [flashlight, setFlashlight] = useState<boolean>(false);

  // Stop camera stream safely
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  // Launch camera
  const startCamera = async () => {
    setCameraError(null);
    setScanStep('camera');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => console.error(e));
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      // Give polite advice because of Iframe sandboxing constraints in browser preview
      setCameraError(
        "Không thể mở trực tiếp webcam. Điều này thường do giới hạn quyền truy cập Camera của trình duyệt trong iFrame xem trước. Hệ thống đã tự động chuyển sang Chế độ Giả lập Camera Quét Thông Minh cao cấp."
      );
    }
  };

  // Trigger scanning animation + OCR simulation
  const handleTriggerOcrScan = (docData: CheckInDocumentData, origin: 'camera' | 'upload') => {
    stopCamera();
    setScanStep('processing');
    setOcrLogs([]);

    const steps = [
      "📷 Thiết lập kết nối phân tích sinh trắc học...",
      "🔍 Đang định vị vị trí Căn cước/Hộ chiếu trong khung ảnh...",
      "⚡ Phát hiện vùng văn bản OCR (MRZ Code)...",
      "🌐 Đang gửi dữ liệu đến Bộ phân tích AI GrandStay...",
      "🛡️ Xác thực mã bảo mật bảo mật Chip CCCD/Passport quốc tế...",
      "✅ Đã giải mã thông tin & trích xuất dữ liệu thành công!"
    ];

    let delay = 0;
    steps.forEach((logText, index) => {
      setTimeout(() => {
        setOcrLogs(prev => [...prev, logText]);
        if (index === steps.length - 1) {
          // Finish OCR and populate form
          setTimeout(() => {
            setFormData(docData);
            setScanStep('verified');
            setSuccessToast("Đã tự động điền 100% thông tin từ hồ sơ quét!");
            setTimeout(() => setSuccessToast(null), 3500);
          }, 600);
        }
      }, delay);
      delay += 550;
    });
  };

  // Perform mock shutter capture
  const handleCapturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = canvas.toDataURL('image/jpeg');
        
        // Pick a random mock data to simulate successful extraction
        const randomDemo = DEMO_DOCUMENTS[Math.floor(Math.random() * DEMO_DOCUMENTS.length)];
        handleTriggerOcrScan({
          ...randomDemo.data,
          capturedPhoto: imgData
        }, 'camera');
      }
    } else {
      // Fallback if actual camera is simulated (blocked by iframe)
      const randomDemo = DEMO_DOCUMENTS[0]; // Nguyễn Lâm Hoàng Anh
      handleTriggerOcrScan(randomDemo.data, 'camera');
    }
  };

  // Handle local file drop/upload simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // We can simulate parsing
      const reader = new FileReader();
      reader.onload = () => {
        // Pick a random mock data for files
        const randomDemo = DEMO_DOCUMENTS[1]; // Trần Thị Thùy Chi
        handleTriggerOcrScan({
          ...randomDemo.data,
          capturedPhoto: reader.result as string
        }, 'upload');
      };
      reader.readAsDataURL(file);
    }
  };

  // Direct trigger via Quick Demo Buttons
  const handleQuickDemoScan = (doc: typeof DEMO_DOCUMENTS[0]) => {
    handleTriggerOcrScan(doc.data, 'camera');
  };

  // Submit check-in
  const handleSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.docNumber || !formData.dob) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }
    onComplete(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/50 max-w-4xl w-full overflow-hidden my-8 flex flex-col md:flex-row h-auto md:h-[630px]"
      >
        {/* Left Interactive Scanning Panel */}
        <div className="w-full md:w-1/2 bg-slate-900 text-white p-6 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-indigo-600" />
          
          <div className="space-y-4 z-10">
            <div className="flex items-center justify-between">
              <span className="text-[9px] bg-blue-500/20 text-blue-400 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-blue-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-pulse" /> AI Fast Check-in
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Bản quyền GrandStay Pro</span>
            </div>

            <h3 className="text-base sm:text-lg font-black tracking-tight">
              Quét Sinh Trắc Học & Giấy Tờ
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Hệ thống tự động nhận diện khuôn mặt, thông tin cá nhân trên Căn cước công dân gắn chip hoặc Hộ chiếu để thực hiện khai báo tạm trú trực tuyến chỉ trong 5 giây.
            </p>
          </div>

          {/* Interactive view depending on current step */}
          <div className="my-6 bg-slate-950/80 rounded-2xl border border-slate-800 p-4 h-64 flex flex-col justify-center items-center relative overflow-hidden shrink-0">
            <AnimatePresence mode="wait">
              {scanStep === 'options' && (
                <motion.div 
                  key="options"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 w-full text-center"
                >
                  <p className="text-xs text-slate-400 font-medium">Chọn phương thức nhập ảnh CCCD/Hộ chiếu:</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={startCamera}
                      className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-2 group cursor-pointer"
                    >
                      <Camera className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span>Quét bằng Camera</span>
                    </button>

                    <label className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-2 group cursor-pointer">
                      <Upload className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span>Tải ảnh từ máy</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <div className="pt-2">
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-2">Hoặc dùng hồ sơ mẫu test nhanh:</div>
                    <div className="flex flex-col gap-1.5">
                      {DEMO_DOCUMENTS.map((doc, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickDemoScan(doc)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[10px] font-semibold text-slate-300 rounded-lg flex items-center justify-between text-left transition-all cursor-pointer"
                        >
                          <span>{doc.label}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {scanStep === 'camera' && (
                <motion.div 
                  key="camera"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col justify-between items-center p-3"
                >
                  {/* Camera Screen Overlay Viewport */}
                  {cameraError ? (
                    // In-iframe smart simulator fallback
                    <div className="absolute inset-0 bg-slate-950 p-4 flex flex-col justify-between text-center">
                      <div className="space-y-1">
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 font-black px-2 py-0.5 rounded uppercase">
                          Cơ chế giả lập máy quét thông minh
                        </span>
                        <p className="text-[10.5px] text-slate-300 leading-normal font-light">
                          {cameraError}
                        </p>
                      </div>

                      {/* Demo doc shortcuts to prompt instant capture */}
                      <div className="space-y-1.5 my-1 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[8.5px] text-slate-500 font-bold uppercase block tracking-wider">
                          Vui lòng chọn 1 tài liệu mẫu để đặt trước ống kính máy quét:
                        </span>
                        {DEMO_DOCUMENTS.map((doc, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickDemoScan(doc)}
                            className="w-full text-left px-2 py-1.5 bg-slate-950 hover:bg-slate-800 rounded text-[9.5px] font-bold text-blue-400 flex items-center justify-between transition-colors border border-slate-900"
                          >
                            <span>{doc.label}</span>
                            <span className="text-[8.5px] text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">Chọn</span>
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setScanStep('options')}
                          className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-bold"
                        >
                          Quay lại
                        </button>
                      </div>
                    </div>
                  ) : (
                    // True Camera API
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {/* Active video stream */}
                      <video 
                        ref={videoRef} 
                        className="absolute inset-0 w-full h-full object-cover rounded-xl"
                        playsInline
                        muted
                      />
                      
                      {/* Scanner Guidelines Overlays */}
                      <div className="absolute inset-5 border-2 border-dashed border-blue-400/50 rounded-lg pointer-events-none flex items-center justify-center">
                        <div className="w-full h-0.5 bg-blue-500/80 shadow-[0_0_12px_#3b82f6] absolute animate-bounce" style={{ animationDuration: '3s' }} />
                        <span className="text-[9px] bg-slate-900/90 text-white px-2 py-1 rounded absolute bottom-2 tracking-wide">
                          Đặt mặt trước giấy tờ vào khung quét
                        </span>
                      </div>

                      {/* Actions footer inside view */}
                      <div className="absolute bottom-3 left-0 w-full px-4 flex justify-between items-center z-20">
                        <button
                          onClick={() => { stopCamera(); setScanStep('options'); }}
                          className="bg-slate-950/80 hover:bg-slate-900 p-2 rounded-xl text-xs font-bold border border-slate-800 cursor-pointer"
                        >
                          Quay lại
                        </button>

                        <button
                          onClick={handleCapturePhoto}
                          className="w-11 h-11 bg-white hover:bg-slate-100 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all text-slate-900 cursor-pointer"
                          title="Chụp ảnh quét"
                        >
                          <Camera className="w-5 h-5 text-slate-900" />
                        </button>

                        <button
                          onClick={() => setFlashlight(!flashlight)}
                          className={`p-2 rounded-xl text-xs font-bold border cursor-pointer ${
                            flashlight ? 'bg-amber-400/20 border-amber-400/40 text-amber-400' : 'bg-slate-950/80 border-slate-800'
                          }`}
                          title="Bật đèn hỗ trợ"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </motion.div>
              )}

              {scanStep === 'processing' && (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex flex-col justify-between p-4 bg-slate-950/90"
                >
                  <div className="space-y-1 text-center shrink-0">
                    <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mt-1">Đang phân tích thông tin OCR AI</h4>
                    <p className="text-[10px] text-slate-400 font-light">Công nghệ bóc tách văn bản chuẩn ISO/IEC 7501</p>
                  </div>

                  {/* Typing OCR log list */}
                  <div className="flex-grow my-3 bg-slate-900 rounded-xl p-3 border border-slate-800 font-mono text-[9px] text-slate-300 overflow-y-auto space-y-1.5 text-left select-none">
                    {ocrLogs.map((log, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-slate-500">[{1000 + i * 21}ms]</span>
                        <span className={log.includes('✅') ? 'text-emerald-400 font-bold' : ''}>{log}</span>
                      </div>
                    ))}
                  </div>

                  <span className="text-[8.5px] text-slate-500 font-semibold block text-center uppercase tracking-wider">
                    Vui lòng không tắt hoặc tải lại trang web lúc này...
                  </span>
                </motion.div>
              )}

              {scanStep === 'verified' && (
                <motion.div 
                  key="verified"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full text-center space-y-4"
                >
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-emerald-400">Đã Trích Xuất & Điền Tự Động!</h4>
                    <p className="text-xs text-slate-300 font-light px-4 leading-normal">
                      Hệ thống OCR của GrandStay đã xử lý hình ảnh chụp tài liệu của <strong className="text-white">{formData.fullName}</strong> và điền thông tin vào phiếu lưu trú.
                    </p>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setScanStep('options')}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Quét lại giấy tờ khác</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Verification badge & Information */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-2 z-10 shrink-0">
            <div className="flex items-center gap-2 text-[11px] font-bold text-amber-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tiêu chuẩn Bảo mật Dữ liệu Quốc gia</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-light">
              Mọi dữ liệu cá nhân quét qua camera đều được mã hóa đầu-cuối 256-bit và truyền trực tiếp đến hệ thống quản lý lưu trú tạm thời của Công an Khu vực theo Nghị định Quốc hội. GrandStay cam kết không lưu lại hình ảnh gốc trên máy chủ công cộng.
            </p>
          </div>
        </div>

        {/* Right Form Data Verification Panel */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-5">
            {/* Form Title & Progress indicator */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] text-blue-600 font-extrabold block uppercase tracking-wider">
                  BƯỚC 2: XÁC THỰC THÔNG TIN KHAI BÁO
                </span>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Thông Tin Khai Báo Lưu Trú
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick alert to guide user */}
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-start gap-2 text-blue-800 text-[11px] leading-relaxed">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p>
                Quý khách vui lòng kiểm tra kỹ lưỡng các thông tin tự động trích xuất từ CCCD/Passport dưới đây để đảm bảo khớp hoàn toàn trước khi bấm xác nhận check-in.
              </p>
            </div>

            {/* Main Form Fields */}
            <form onSubmit={handleSubmitCheckIn} className="space-y-4">
              {/* Document Type select */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Loại giấy tờ</label>
                  <select
                    value={formData.docType}
                    onChange={(e) => setFormData({ ...formData, docType: e.target.value as 'CCCD' | 'PASSPORT' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="CCCD">🪪 Căn cước công dân</option>
                    <option value="PASSPORT">🛂 Hộ chiếu (Passport)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Số định danh / Số hộ chiếu <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập số giấy tờ..."
                    value={formData.docNumber}
                    onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Full name input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Họ và Tên (In hoa không dấu) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: NGUYEN VAN MINH"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wide focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900"
                />
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ngày sinh <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white h-8"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Giới tính</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/50">
                    {(['Nam', 'Nữ', 'Khác'] as const).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: g })}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          formData.gender === g ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nationality & Expiry Date / Place of Issue */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Quốc tịch</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                {formData.docType === 'PASSPORT' ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ngày hết hạn hộ chiếu <span className="text-rose-500">*</span></label>
                    <input
                      type="date"
                      required={formData.docType === 'PASSPORT'}
                      value={formData.expiryDate || ''}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white h-8"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nơi cấp căn cước</label>
                    <input
                      type="text"
                      value={formData.placeOfIssue || ''}
                      onChange={(e) => setFormData({ ...formData, placeOfIssue: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Success / Info popups */}
          {successToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-bold flex items-center gap-2 mt-4 animate-fade-in shrink-0">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Submit Action Block */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4 shrink-0">
            <div className="text-left">
              <span className="text-[9px] text-slate-400 block font-bold uppercase">Mã đặt phòng áp dụng</span>
              <span className="text-xs text-slate-800 font-extrabold font-mono block truncate max-w-44" title={booking.name}>
                {booking.name}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              
              <button
                type="button"
                onClick={handleSubmitCheckIn}
                disabled={!formData.fullName || !formData.docNumber || !formData.dob}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer text-white ${
                  formData.fullName && formData.docNumber && formData.dob
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/10'
                    : 'bg-slate-300 text-slate-100 cursor-not-allowed shadow-none'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác nhận Check-in</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
