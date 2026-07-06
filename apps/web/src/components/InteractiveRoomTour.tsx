import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Map, 
  Sparkles, 
  Eye, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Check, 
  Maximize2, 
  ChevronRight, 
  X, 
  Info, 
  Sliders, 
  Tv, 
  Bed, 
  Coffee, 
  Utensils, 
  Grid,
  Heart,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Apartment, Branch } from '../types';
import { formatVND } from '../data';

interface InteractiveRoomTourProps {
  apartment?: Apartment;
  branch?: Branch;
  onClose: () => void;
  onBook?: (item: any) => void;
}

interface TourSpace {
  id: 'living' | 'bedroom' | 'kitchen' | 'balcony';
  name: string;
  image: string;
  description: string;
  radarAngle: number; // coordinates for the floor-plan radar
  radarX: number; // % in mini-map
  radarY: number; // % in mini-map
  hotspots: TourHotspot[];
  specs: string[];
}

interface TourHotspot {
  id: string;
  x: number; // % from left
  y: number; // % from top
  label: string;
  type: 'spec' | 'nav';
  targetSpace?: 'living' | 'bedroom' | 'kitchen' | 'balcony';
  icon?: string;
  details?: string;
}

export default function InteractiveRoomTour({ apartment, branch, onClose, onBook }: InteractiveRoomTourProps) {
  const item = apartment || branch;
  // Define custom 360-ish spaces for each apartment
  const spaces: TourSpace[] = [
    {
      id: 'living',
      name: 'Phòng Khách Sang Trọng (Living Room)',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1600',
      description: 'Không gian sinh hoạt chung ngập tràn ánh sáng tự nhiên với trần cao 3.2m và hệ vách kính Low-E full tràn viền.',
      radarAngle: 0,
      radarX: 35,
      radarY: 65,
      specs: [
        'Sofa góc chữ L nhập khẩu nguyên chiếc từ Ý (Da bò Full Grain)',
        'Hệ thống TV thông minh Samsung QLED 75 inch 4K HDR10+',
        'Hệ thống âm thanh rạp hát vòm Bang & Olufsen Beosound',
        'Thảm len dệt tay thủ công thiết kế Bắc Âu đơn giản'
      ],
      hotspots: [
        {
          id: 'h-sofa',
          x: 42,
          y: 60,
          label: 'Sofa Da Thật Nhập Ý',
          type: 'spec',
          icon: '🛋️',
          details: 'Sofa thương hiệu Minotti danh tiếng, chế tác từ da bò thượng hạng vùng Tuscany mềm mại.'
        },
        {
          id: 'h-tv',
          x: 75,
          y: 40,
          label: 'Màn hình QLED 75" & Soundbar',
          type: 'spec',
          icon: '📺',
          details: 'Tích hợp tài khoản Netflix Premium & Spotify Lossless cho trải nghiệm nghe nhìn vô hạn.'
        },
        {
          id: 'h-nav-bedroom',
          x: 15,
          y: 45,
          label: 'Bước vào Phòng Ngủ ➔',
          type: 'nav',
          targetSpace: 'bedroom'
        }
      ]
    },
    {
      id: 'bedroom',
      name: 'Phòng Ngủ Master (Master Bedroom)',
      image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=1600',
      description: 'Nơi tái tạo năng lượng đỉnh cao với đệm lò xo túi 7 vùng cao cấp nhất và hệ thống rèm 2 lớp tự động chống tia UV tuyệt đối.',
      radarAngle: 90,
      radarX: 75,
      radarY: 35,
      specs: [
        'Giường cỡ King size từ gỗ sồi sấy tự nhiên vững chãi',
        'Đệm lò xo King Koil nhập khẩu Mỹ nâng đỡ cột sống hoàn hảo',
        'Gối lông vũ tơ tằm sinh học êm ái, thoáng khí điều hòa nhiệt độ',
        'Hệ thống đèn ngủ Ambient Light tùy chỉnh sắc độ theo nhịp sinh học'
      ],
      hotspots: [
        {
          id: 'h-bed',
          x: 50,
          y: 55,
          label: 'Đệm King Koil Thượng Hạng',
          type: 'spec',
          icon: '🛏️',
          details: 'Được thiết kế theo tiêu chuẩn nghỉ dưỡng 6 sao của các nguyên thủ quốc gia.'
        },
        {
          id: 'h-cabinet',
          x: 82,
          y: 48,
          label: 'Bàn Trang Điểm & Trợ Lý Ảo',
          type: 'spec',
          icon: '💄',
          details: 'Tích hợp sạc không dây đa cổng, gương thông minh LED sấy sương tự động.'
        },
        {
          id: 'h-nav-balcony',
          x: 10,
          y: 35,
          label: 'Ra Ban Công Ngắm Cảnh ➔',
          type: 'nav',
          targetSpace: 'balcony'
        }
      ]
    },
    {
      id: 'kitchen',
      name: 'Phòng Bếp Hiện Đại (Kitchen & Dining)',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1600',
      description: 'Nhà bếp khơi nguồn cảm hứng ẩm thực với đầy đủ thiết bị âm tủ Bosch châu Âu và bàn đảo đá thạch anh nhân tạo.',
      radarAngle: 270,
      radarX: 25,
      radarY: 30,
      specs: [
        'Bếp từ âm 3 vùng nấu Bosch dòng Serie 8 thông minh',
        'Lò nướng & Lò vi sóng đối lưu âm tủ Bosch đối lưu đa chiều',
        'Tủ lạnh Side-by-Side Hitachi inverter lấy đá ngoài tự động',
        'Đầy đủ dụng cụ nấu ăn đúc gang Staub cao cấp Pháp'
      ],
      hotspots: [
        {
          id: 'h-fridge',
          x: 22,
          y: 42,
          label: 'Tủ Lạnh Smart Inverter',
          type: 'spec',
          icon: '🧊',
          details: 'Đã setup sẵn các loại đồ uống detox tốt cho sức khỏe hoàn toàn miễn phí.'
        },
        {
          id: 'h-island',
          x: 60,
          y: 65,
          label: 'Bàn Đảo Đá Thạch Anh',
          type: 'spec',
          icon: '🍷',
          details: 'Nơi hoàn hảo để thưởng thức một ly rượu vang vang đỏ hảo hạng vào buổi tối.'
        },
        {
          id: 'h-nav-living',
          x: 85,
          y: 50,
          label: 'Quay lại Phòng Khách ➔',
          type: 'nav',
          targetSpace: 'living'
        }
      ]
    },
    {
      id: 'balcony',
      name: 'Ban Công Panorama 180° (Scenic Balcony)',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1600',
      description: 'Tầm nhìn ngoạn mục vô cực hướng ra đường chân trời thành phố hoặc bãi biển thơ mộng, mang lại không gian thư giãn tuyệt đỉnh.',
      radarAngle: 180,
      radarX: 55,
      radarY: 85,
      specs: [
        'Bàn ghế thưởng trà mây tre đan tự nhiên xử lý kháng thời tiết',
        'Khu vườn treo thảo mộc nhỏ thơm dịu (Bạc hà, Lavender, Xạ hương)',
        'Hệ vách kính cường lực tràn viền bảo vệ an toàn tuyệt đối',
        'Đèn trang trí treo lãng mạn lấp lánh tự động bật khi hoàng hôn'
      ],
      hotspots: [
        {
          id: 'h-view',
          x: 50,
          y: 35,
          label: 'Tầm Nhìn Vô Cực Triệu Đô',
          type: 'spec',
          icon: '🏙️',
          details: 'Ngắm trọn vẹn bình minh rực rỡ hoặc ánh hoàng hôn lộng lẫy bao phủ toàn thành phố.'
        },
        {
          id: 'h-plants',
          x: 80,
          y: 62,
          label: 'Vườn Thảo Mộc Mini',
          type: 'spec',
          icon: '🌿',
          details: 'Hương thơm tự nhiên thanh lọc tâm hồn, xoa dịu mọi căng thẳng mệt mỏi.'
        },
        {
          id: 'h-nav-kitchen',
          x: 20,
          y: 55,
          label: 'Đi vào Phòng Bếp ➔',
          type: 'nav',
          targetSpace: 'kitchen'
        }
      ]
    }
  ];

  const [activeSpaceId, setActiveSpaceId] = useState<'living' | 'bedroom' | 'kitchen' | 'balcony'>('living');
  const currentSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0];

  const [viewSource, setViewSource] = useState<'simulated' | 'external'>(() => {
    return (item && item.virtualTourUrl && item.virtualTourUrl.trim() !== '') ? 'external' : 'simulated';
  });

  if (!item) return null;

  // 360-degree panning simulator states
  const [panOffset, setPanOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1x to 1.5x
  const [lightingMode, setLightingMode] = useState<'day' | 'night'>('day');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [activeHotspotDetail, setActiveHotspotDetail] = useState<TourHotspot | null>(null);
  const [showGuidelines, setShowGuidelines] = useState<boolean>(true);

  // References
  const viewerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number>(0);
  const dragStartOffset = useRef<number>(0);

  // Auto rotation effect
  useEffect(() => {
    let intervalId: any = null;
    if (isAutoRotate && !isDragging) {
      intervalId = setInterval(() => {
        setPanOffset(prev => (prev + 0.15) % 360);
      }, 30);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoRotate, isDragging]);

  // Handle Drag / Swipe mouse/touch actions to shift image background positioning
  const handleStartDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setIsAutoRotate(false);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = clientX;
    dragStartOffset.current = panOffset;
  };

  const handleDragAction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - dragStartX.current;
    
    // Convert pixels to rotation degrees
    const sensitivity = 0.4; 
    const newOffset = (dragStartOffset.current - deltaX * sensitivity + 360) % 360;
    setPanOffset(newOffset);
  };

  const handleEndDrag = () => {
    setIsDragging(false);
  };

  // Convert pan offset to simulated compass angle
  const compassAngle = Math.round(panOffset);

  // Apply filters depending on lighting mode
  const getFilterStyle = () => {
    if (lightingMode === 'night') {
      return {
        filter: 'brightness(0.6) sepia(0.3) saturate(1.2) hue-rotate(-10deg)',
        transition: 'filter 1.2s ease-in-out'
      };
    }
    return {
      filter: 'brightness(1.02) saturate(1.05)',
      transition: 'filter 1.2s ease-in-out'
    };
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800/80 max-w-6xl w-full overflow-hidden my-4 flex flex-col md:flex-row h-auto md:h-[650px] relative text-white"
      >
        {/* Top Gold Bar Decor */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-brand-gold to-yellow-600 z-30" />

        {/* Left Hand: High Immersive 360 Virtual View Box */}
        <div className="w-full md:w-[60%] lg:w-[65%] bg-black relative flex flex-col justify-between overflow-hidden h-[320px] sm:h-[400px] md:h-full group">
          
          {/* Top Interactive Panel: Compass, Status, Close */}
          <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
            {/* Realtime Rotational Compass UI */}
            <div className="flex items-center gap-3 bg-slate-950/80 border border-white/10 px-3.5 py-2 rounded-full backdrop-blur-md pointer-events-auto">
              <div 
                className="w-8 h-8 rounded-full border border-emerald-500/30 flex items-center justify-center bg-slate-900"
                style={{ transform: `rotate(${-compassAngle}deg)`, transition: 'transform 0.1s ease-out' }}
              >
                <Compass className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left font-mono">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider leading-none">Hướng Quét</span>
                <span className="text-xs font-black text-white">{compassAngle}° {compassAngle > 337 || compassAngle <= 22 ? 'Bắc (N)' : compassAngle > 22 && compassAngle <= 67 ? 'Đông Bắc (NE)' : compassAngle > 67 && compassAngle <= 112 ? 'Đông (E)' : compassAngle > 112 && compassAngle <= 157 ? 'Đông Nam (SE)' : compassAngle > 157 && compassAngle <= 202 ? 'Nam (S)' : compassAngle > 202 && compassAngle <= 247 ? 'Tây Nam (SW)' : compassAngle > 247 && compassAngle <= 292 ? 'Tây (W)' : 'Tây Bắc (NW)'}</span>
              </div>
            </div>

            {/* Room Badges & Ambient Status Indicator */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-pulse" /> 360° LIVE
              </span>
              <button 
                onClick={onClose} 
                className="md:hidden p-2 bg-slate-950/80 border border-white/10 text-white rounded-full hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Core Interactive Pan View Screen */}
          {viewSource === 'external' && item.virtualTourUrl ? (
            <div className="w-full h-full relative bg-slate-950">
              <iframe 
                src={item.virtualTourUrl}
                title={`3D Virtual Tour - ${item.name}`}
                className="w-full h-full border-0 absolute inset-0 z-10"
                allowFullScreen
                allow="xr-spatial-tracking; gyroscope; accelerometer"
              />
            </div>
          ) : (
            <div 
              ref={viewerRef}
              onMouseDown={handleStartDrag}
              onMouseMove={handleDragAction}
              onMouseUp={handleEndDrag}
              onMouseLeave={handleEndDrag}
              onTouchStart={handleStartDrag}
              onTouchMove={handleDragAction}
              onTouchEnd={handleEndDrag}
              className={`w-full h-full relative overflow-hidden select-none cursor-grab active:cursor-grabbing`}
              style={{ 
                backgroundImage: `url(${currentSpace.image})`,
                backgroundSize: 'cover',
                // Shift background horizontally by using panOffset to simulate a cylindrical panoramic layout
                backgroundPositionX: `${panOffset * 2.2}px`,
                backgroundPositionY: 'center',
                transform: `scale(${zoomLevel})`,
                transition: isDragging ? 'none' : 'background-position 0.2s ease-out, transform 0.3s ease-out',
                ...getFilterStyle()
              }}
            >
              {/* Interactive Grid lines Visual Effect overlay */}
              {showGuidelines && (
                <div className="absolute inset-0 border border-white/5 pointer-events-none flex items-center justify-center">
                  {/* Horizontal guide */}
                  <div className="w-full h-[1px] bg-white/10 absolute top-1/2 -translate-y-1/2" />
                  {/* Vertical guide */}
                  <div className="h-full w-[1px] bg-white/10 absolute left-1/2 -translate-x-1/2" />
                  {/* Scanning sweep effect */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent top-1/3 animate-pulse" />
                </div>
              )}

              {/* Smart Hotspots that shift matching the pan offset! */}
              {currentSpace.hotspots.map((h) => {
                // Simulating horizontal motion offsets so hotspots move horizontally when panned!
                // backgroundPositionX shift is mapped to hotspots
                const pixelShiftPerDegree = 2.2;
                const basePixelX = (h.x / 100) * (viewerRef.current?.clientWidth || 500);
                const pannedX = basePixelX + (panOffset * pixelShiftPerDegree);
                // Wrap coordinates perfectly
                const viewportWidth = viewerRef.current?.clientWidth || 500;
                const finalX = ((pannedX % viewportWidth) + viewportWidth) % viewportWidth;

                return (
                  <div
                    key={h.id}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
                    style={{
                      left: `${finalX}px`,
                      top: `${h.y}%`
                    }}
                  >
                    <div className="relative group/hotspot">
                      {/* Ring Pulse Visual Animation */}
                      <span className={`absolute -inset-2 rounded-full animate-ping pointer-events-none border ${h.type === 'nav' ? 'bg-blue-500/20 border-blue-400' : 'bg-amber-500/20 border-amber-400'}`} style={{ animationDuration: '3s' }} />
                      
                      <button
                        type="button"
                        onClick={() => {
                          setIsAutoRotate(false);
                          if (h.type === 'nav' && h.targetSpace) {
                            setActiveSpaceId(h.targetSpace);
                            setActiveHotspotDetail(null);
                          } else {
                            setActiveHotspotDetail(h);
                          }
                        }}
                        className={`relative w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all border ${
                          h.type === 'nav' 
                            ? 'bg-blue-600 hover:bg-blue-700 border-blue-300' 
                            : 'bg-amber-500 hover:bg-amber-600 border-amber-300'
                        }`}
                        title={h.label}
                      >
                        {h.type === 'nav' ? '➔' : h.icon || '🔍'}
                      </button>

                      {/* Hotspot Floating Tooltip Label */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-slate-950/90 rounded-lg text-[10px] text-white font-black whitespace-nowrap shadow-md border border-white/10 pointer-events-none group-hover/hotspot:opacity-100 opacity-80 transition-opacity">
                        {h.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Interactive Control Dock (Overlaid at bottom of 360 View) */}
          <div className="absolute bottom-4 inset-x-4 z-20 flex flex-wrap gap-2 justify-between items-center pointer-events-none">
            {/* Rotation and Zoom Controls */}
            {viewSource !== 'external' ? (
              <div className="flex items-center gap-1 bg-slate-950/80 border border-white/10 p-1 rounded-xl backdrop-blur-md pointer-events-auto">
                <button
                  onClick={() => {
                    setIsAutoRotate(false);
                    setPanOffset(p => (p - 15 + 360) % 360);
                  }}
                  className="p-2 text-xs hover:bg-white/10 rounded-lg transition-all font-bold"
                  title="Xoay trái"
                >
                  ◀
                </button>
                <button
                  onClick={() => setIsAutoRotate(!isAutoRotate)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    isAutoRotate ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {isAutoRotate ? 'ĐANG TỰ XOAY' : 'TỰ XOAY'}
                </button>
                <button
                  onClick={() => {
                    setIsAutoRotate(false);
                    setPanOffset(p => (p + 15) % 360);
                  }}
                  className="p-2 text-xs hover:bg-white/10 rounded-lg transition-all font-bold"
                  title="Xoay phải"
                >
                  ▶
                </button>
                
                <div className="h-4 w-[1px] bg-white/10 mx-1" />

                {/* Zoom Buttons */}
                <button
                  onClick={() => setZoomLevel(z => Math.min(z + 0.1, 1.5))}
                  className="p-2 hover:bg-white/10 text-xs text-slate-300 hover:text-white rounded-lg transition-colors font-bold"
                  title="Phóng to"
                >
                  ＋
                </button>
                <button
                  onClick={() => setZoomLevel(z => Math.max(z - 0.1, 1.0))}
                  className="p-2 hover:bg-white/10 text-xs text-slate-300 hover:text-white rounded-lg transition-colors font-bold"
                  title="Thu nhỏ"
                >
                  －
                </button>
              </div>
            ) : <div />}

            {/* View Source Toggle Button */}
            {item.virtualTourUrl && (
              <div className="flex items-center gap-1 bg-slate-950/80 border border-white/10 p-1 rounded-xl backdrop-blur-md pointer-events-auto">
                <button
                  onClick={() => setViewSource(viewSource === 'external' ? 'simulated' : 'external')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewSource === 'external' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{viewSource === 'external' ? 'XEM MÔ PHỎNG 360°' : 'XEM VIRTUAL TOUR 3D'}</span>
                </button>
              </div>
            )}

            {/* Aesthetics Toggle Buttons (Atmosphere lighting & sound) */}
            {viewSource !== 'external' ? (
              <div className="flex items-center gap-1 bg-slate-950/80 border border-white/10 p-1 rounded-xl backdrop-blur-md pointer-events-auto">
                {/* Gridtoggle */}
                <button
                  onClick={() => setShowGuidelines(!showGuidelines)}
                  className={`p-2 rounded-lg transition-colors ${showGuidelines ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Bật/Tắt đường lưới quét"
                >
                  <Grid className="w-4 h-4" />
                </button>

                {/* Lighting Preset toggle */}
                <button
                  onClick={() => setLightingMode(l => l === 'day' ? 'night' : 'day')}
                  className={`p-2 rounded-lg transition-all ${
                    lightingMode === 'night' ? 'text-amber-400 bg-amber-400/10' : 'text-sky-400 bg-sky-400/5'
                  }`}
                  title={lightingMode === 'night' ? 'Chuyển sang ánh sáng ban ngày' : 'Chuyển sang không khí ấm hoàng hôn'}
                >
                  {lightingMode === 'night' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>

                {/* Sound FX preset simulator */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 rounded-lg transition-all ${
                    !isMuted ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={!isMuted ? 'Tắt nhạc nền căn hộ' : 'Bật nhạc nền Lofi thư giãn'}
                >
                  {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            ) : <div />}
          </div>

          {/* Sound wave Visualizer Overlay */}
          {!isMuted && (
            <div className="absolute bottom-16 right-4 z-20 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-2 text-[9px] text-emerald-400 font-mono tracking-wide">
              <span>Môi trường Lofi Jazz:</span>
              <div className="flex gap-0.5 items-end h-3">
                <span className="w-0.5 bg-emerald-400 rounded animate-bounce" style={{ animationDuration: '0.8s', height: '100%' }} />
                <span className="w-0.5 bg-emerald-400 rounded animate-bounce" style={{ animationDuration: '1.2s', height: '60%' }} />
                <span className="w-0.5 bg-emerald-400 rounded animate-bounce" style={{ animationDuration: '0.6s', height: '80%' }} />
                <span className="w-0.5 bg-emerald-400 rounded animate-bounce" style={{ animationDuration: '1.0s', height: '40%' }} />
              </div>
            </div>
          )}
        </div>

        {/* Right Hand: Detailed Descriptive Sidebar & Control Suite */}
        <div className="w-full md:w-[40%] lg:w-[35%] p-5 sm:p-6 flex flex-col justify-between overflow-y-auto bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 relative z-10">
          
          <div className="space-y-5 text-left">
            {/* Title Block */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-wider block mb-1">
                  TRẢI NGHIỆM {branch ? 'KHÁCH SẠN' : 'CĂN HỘ'} VR 3D
                </span>
                <h3 className="text-lg font-black tracking-tight text-white leading-tight">
                  {item.name}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="hidden md:block p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Interactive Navigation Tabs */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Chọn vị trí đứng quan sát</label>
              <div className="grid grid-cols-2 gap-1.5">
                {spaces.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSpaceId(s.id);
                      setActiveHotspotDetail(null);
                    }}
                    className={`px-3 py-2 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      activeSpaceId === s.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10 border-l-2 border-amber-400'
                        : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-950/80 border border-slate-800'
                    }`}
                  >
                    <span>{s.id === 'living' ? '🛋️' : s.id === 'bedroom' ? '🛏️' : s.id === 'kitchen' ? '🍳' : '🌅'}</span>
                    <span className="truncate">{s.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description Text */}
            <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800 text-slate-300 space-y-2">
              <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <span>{currentSpace.name}</span>
              </h4>
              <p className="text-[11px] leading-relaxed font-light text-slate-400">
                {currentSpace.description}
              </p>
            </div>

            {/* Active Hotspot Detail Popover inside sidebar */}
            <AnimatePresence mode="wait">
              {activeHotspotDetail ? (
                <motion.div
                  key={activeHotspotDetail.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-amber-400/10 border border-amber-400/30 p-4 rounded-2xl text-amber-200 text-xs relative overflow-hidden"
                >
                  <button
                    onClick={() => setActiveHotspotDetail(null)}
                    className="absolute top-2 right-2 text-amber-400 hover:text-amber-100 p-1 font-bold text-[10px]"
                  >
                    ✖
                  </button>
                  <div className="flex gap-2 items-start text-left">
                    <span className="text-base shrink-0">{activeHotspotDetail.icon}</span>
                    <div className="space-y-1">
                      <strong className="text-amber-300 font-extrabold block text-[11px] uppercase tracking-wide">
                        {activeHotspotDetail.label}
                      </strong>
                      <p className="text-[10.5px] font-light leading-relaxed text-amber-200/90">
                        {activeHotspotDetail.details}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // Floor plan & radar mini-map container
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Map className="w-3.5 h-3.5 text-blue-400" /> Sơ Đồ Căn Hộ Của Bạn</span>
                    <span className="text-emerald-400 font-mono">Radar Đồng Bộ</span>
                  </div>

                  {/* Floor Plan Diagram Canvas */}
                  <div className="relative h-28 bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden flex items-center justify-center">
                    {/* Simulating walls & layout rooms inside apartment */}
                    <div className="absolute inset-4 border border-dashed border-white/5 rounded-lg grid grid-cols-2 grid-rows-2">
                      <div className="border-r border-b border-white/5 p-1 text-[8px] text-slate-600 font-extrabold text-left uppercase">Kitchen</div>
                      <div className="border-b border-white/5 p-1 text-[8px] text-slate-600 font-extrabold text-right uppercase">Bedroom</div>
                      <div className="border-r border-white/5 p-1 text-[8px] text-slate-600 font-extrabold text-left uppercase">Living</div>
                      <div className="p-1 text-[8px] text-slate-600 font-extrabold text-right uppercase">Balcony</div>
                    </div>

                    {/* Active Radar Beacon Circle */}
                    {spaces.map((s) => (
                      <div
                        key={s.id}
                        className="absolute transition-all duration-500"
                        style={{ left: `${s.radarX}%`, top: `${s.radarY}%` }}
                      >
                        <div className={`relative w-2.5 h-2.5 rounded-full ${activeSpaceId === s.id ? 'bg-emerald-400' : 'bg-slate-700'}`}>
                          {activeSpaceId === s.id && (
                            <>
                              <span className="absolute -inset-1.5 rounded-full bg-emerald-400/20 animate-ping" />
                              {/* Field of View Radar Cone */}
                              <div 
                                className="absolute -top-6 -left-6 w-14 h-14 border-t-2 border-dashed border-emerald-400/40 rounded-t-full pointer-events-none origin-bottom opacity-50"
                                style={{ transform: `rotate(${s.radarAngle - compassAngle}deg)`, transition: 'transform 0.1s ease-out' }}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Spec Sheet Listing */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Trang thiết bị bàn giao gốc</label>
              <ul className="space-y-1.5 text-[10.5px] text-slate-300">
                {currentSpace.specs.map((spec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="font-light">{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Call to Action and Metadata Details */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 mt-4">
            <div className="text-left">
              <span className="text-[9px] text-slate-500 font-bold block uppercase leading-none mb-1">
                {branch ? 'Giá Nghỉ Đã Gồm Ăn Sáng' : 'Giá Thuê Đã Gồm Phí Dịch Vụ'}
              </span>
              <strong className="text-base sm:text-lg font-black text-amber-400 tracking-tight block">
                {branch ? formatVND(branch.pricePerNight) : formatVND(apartment!.monthlyPrice)}
              </strong>
              <span className="text-[10px] text-slate-400 font-mono block">
                {branch ? '/ đêm • Đã gồm thuế phí' : '/ tháng • Đặt tối thiểu 1 tháng'}
              </span>
            </div>

            {onBook && (
              <button
                onClick={() => onBook(item)}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs h-11 px-5 rounded-xl shadow-lg shadow-emerald-500/10 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{branch ? 'Đặt Phòng Ngay' : 'Đăng Ký Thuê'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}
