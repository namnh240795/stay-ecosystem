import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Home, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building, 
  Check, 
  Sparkles, 
  Maximize2, 
  Bed, 
  Bath, 
  Dog, 
  Tv, 
  FileText, 
  Phone, 
  User, 
  Mail, 
  Compass, 
  Eye, 
  Info, 
  Layers, 
  Wifi, 
  Wind, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  Map as MapIcon, 
  List, 
  Utensils, 
  Lock, 
  Dumbbell, 
  Waves, 
  Car,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { Apartment, LongTermSearchQuery } from '../types';

const APARTMENT_COORDS: Record<string, [number, number]> = {
  'apt-saigon-skyline': [10.795, 106.722], // Saigon Central near Landmark 81
  'apt-hanoi-indochine': [21.028, 105.852], // Hanoi Hoan Kiem
  'apt-danang-ocean': [16.068, 108.244], // Da Nang My Khe Beach
  'apt-phuquoc-sunset': [10.150, 104.000], // Phu Quoc Sunset
  'apt-sapa-misty': [22.336, 103.843], // Sapa Town
  'apt-thainguyen-garden': [21.593, 105.842] // Thai Nguyen City
};

const CITY_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  'All Locations': { center: [16.2, 106.0], zoom: 5.5 }, // Center of Vietnam
  'Saigon': { center: [10.776, 106.701], zoom: 13 },
  'Hanoi': { center: [21.028, 105.852], zoom: 13 },
  'Da Nang': { center: [16.068, 108.244], zoom: 13 },
  'Phu Quoc': { center: [10.219, 103.956], zoom: 11 },
  'Sapa': { center: [22.336, 103.843], zoom: 13 },
  'Thai Nguyen': { center: [21.593, 105.842], zoom: 13 }
};

import { APARTMENTS, APARTMENT_TYPES, LOCATIONS, formatVND } from '../data';
import InteractiveRoomTour from './InteractiveRoomTour';
import { ApartmentCompareBar, ApartmentCompareModal } from './ApartmentCompare';
import { Pencil, Sliders } from 'lucide-react';

interface LongTermStaysViewProps {
  initialLocation?: string;
  apartments?: Apartment[];
}

export default function LongTermStaysView({ initialLocation = 'All Locations', apartments = APARTMENTS }: LongTermStaysViewProps) {
  // Dynamic Content states for Long-Term stay view
  const [ltBanner, setLtBanner] = useState<string>(() => {
    return localStorage.getItem('gs_longterm_banner_image') || 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1920&q=80';
  });
  const [ltTitle, setLtTitle] = useState<string>(() => {
    return localStorage.getItem('gs_longterm_title') || 'Long-term Rooms';
  });
  const [ltSubtitle, setLtSubtitle] = useState<string>(() => {
    return localStorage.getItem('gs_longterm_subtitle') || 'Looking for extended stay options? Our long-term room packages offer comfortable accommodation at competitive rates for stays of 30 days or more.';
  });
  const [ltAdvantages, setLtAdvantages] = useState<string[]>(() => {
    const saved = localStorage.getItem('gs_longterm_advantages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      "Significant discounts compared to nightly rates",
      "Flexible lease terms from 1 to 12 months",
      "Fully furnished rooms with utilities included",
      "Dedicated housekeeping and maintenance"
    ];
  });

  // Sync with localStorage dynamically
  useEffect(() => {
    const handleSyncLongTerm = () => {
      setLtBanner(localStorage.getItem('gs_longterm_banner_image') || 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1920&q=80');
      setLtTitle(localStorage.getItem('gs_longterm_title') || 'Long-term Rooms');
      setLtSubtitle(localStorage.getItem('gs_longterm_subtitle') || 'Looking for extended stay options? Our long-term room packages offer comfortable accommodation at competitive rates for stays of 30 days or more.');
      
      const saved = localStorage.getItem('gs_longterm_advantages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLtAdvantages(parsed);
          }
        } catch (e) {}
      } else {
        setLtAdvantages([
          "Significant discounts compared to nightly rates",
          "Flexible lease terms from 1 to 12 months",
          "Fully furnished rooms with utilities included",
          "Dedicated housekeeping and maintenance"
        ]);
      }
    };

    window.addEventListener('storage', handleSyncLongTerm);
    window.addEventListener('longterm_content_updated', handleSyncLongTerm);
    return () => {
      window.removeEventListener('storage', handleSyncLongTerm);
      window.removeEventListener('longterm_content_updated', handleSyncLongTerm);
    };
  }, []);

  // 1. Search & Filter State
  const [filters, setFilters] = useState<LongTermSearchQuery>({
    location: initialLocation === 'All Locations' ? 'All Locations' : initialLocation,
    type: 'All Types',
    leaseTerm: 6, // default 6 months
    minPrice: 10000000,
    maxPrice: 80000000,
    petFriendly: false,
    hasVirtualTour: false
  });

  const [searchQueryText, setSearchQueryText] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'split' | 'scroll'>('split'); // split means Map + Cards
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredAptId, setHoveredAptId] = useState<string | null>(null);
  const [selectedAptForTour, setSelectedAptForTour] = useState<Apartment | null>(null);
  const [selectedAptForBooking, setSelectedAptForBooking] = useState<Apartment | null>(null);

  // 3D Tour active state
  const [tourRotation, setTourRotation] = useState(0);
  const [isRotatingTour, setIsRotatingTour] = useState(false);
  const tourIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Booking details state
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1); // 1: Lease configuration, 2: Tenant Info & Sign, 3: Success Certificate
  const [customLeaseTerm, setCustomLeaseTerm] = useState<number>(6); // 1, 3, 6, 12 months

  // Compare rooms states
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Admin Editing states
  const [isAdminEditMode, setIsAdminEditMode] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<any | null>(null);
  const [selectedEditApartment, setSelectedEditApartment] = useState<Apartment | null>(null);

  // Active form state for editing Room Type
  const [rtFormName, setRtFormName] = useState('');
  const [rtFormImage, setRtFormImage] = useState('');
  const [rtFormPrice, setRtFormPrice] = useState(0);
  const [rtFormSizeDesc, setRtFormSizeDesc] = useState('');

  // Active form state for editing Apartment
  const [aptFormName, setAptFormName] = useState('');
  const [aptFormImage, setAptFormImage] = useState('');
  const [aptFormPrice, setAptFormPrice] = useState(0);
  const [aptFormType, setAptFormType] = useState('');

  const startEditingRoomType = (rt: any) => {
    setEditingRoomType(rt);
    setRtFormName(rt.name);
    setRtFormImage(rt.image);
    setRtFormPrice(rt.price || 0);
    setRtFormSizeDesc(rt.sizeDesc);
  };

  const startEditingApartment = (apt: Apartment) => {
    setSelectedEditApartment(apt);
    setAptFormName(apt.name);
    setAptFormImage(apt.image);
    setAptFormPrice(apt.monthlyPrice);
    setAptFormType(apt.type);
  };

  // Dynamic list of apartments to allow editing
  const [apartmentsList, setApartmentsList] = useState<Apartment[]>(() => {
    const saved = localStorage.getItem('gs_longterm_apartments_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return apartments;
  });

  const saveApartmentsList = (newList: Apartment[]) => {
    setApartmentsList(newList);
    localStorage.setItem('gs_longterm_apartments_list', JSON.stringify(newList));
  };

  const [roomTypes, setRoomTypes] = useState(() => {
    const saved = localStorage.getItem('gs_longterm_room_types');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'Studio',
        name: 'Standard Room',
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
        sizeDesc: '25m² - Suitable for 1-2 guests',
        price: 8000000,
        icon: 'Bed'
      },
      {
        id: '1-Bedroom',
        name: 'Deluxe Room',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        sizeDesc: '35m² - Suitable for 2 guests',
        price: 12000000,
        icon: 'Maximize2'
      },
      {
        id: 'Service Apartment',
        name: 'Suite',
        image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
        sizeDesc: '50m² - Suitable for 2-3 guests',
        price: 18000000,
        icon: 'Sparkles'
      }
    ];
  });

  const saveRoomTypes = (newTypes: typeof roomTypes) => {
    setRoomTypes(newTypes);
    localStorage.setItem('gs_longterm_room_types', JSON.stringify(newTypes));
  };

  const selectedApartmentsToCompare = useMemo(() => {
    return apartmentsList.filter(apt => selectedCompareIds.includes(apt.id));
  }, [apartmentsList, selectedCompareIds]);

  const handleToggleCompare = (id: string) => {
    setSelectedCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 3) {
        alert("Quý khách chỉ có thể so sánh tối đa 3 căn hộ cùng lúc.");
        return prev;
      }
      return [...prev, id];
    });
  };
  const [tenantName, setTenantName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [moveInDate, setMoveInDate] = useState('2026-07-01');
  const [coLivingRequest, setCoLivingRequest] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [sigPoints, setSigPoints] = useState<{ x: number; y: number }[]>([]);
  const [isDrawingSig, setIsDrawingSig] = useState(false);
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync initial location prop if it changes
  useEffect(() => {
    if (initialLocation) {
      setFilters(f => ({ ...f, location: initialLocation === 'All Locations' ? 'All Locations' : initialLocation }));
    }
  }, [initialLocation]);

  // 2. Filter Logic
  const filteredApartments = useMemo(() => {
    return apartmentsList.filter(apt => {
      // Location
      if (filters.location !== 'All Locations' && apt.location !== filters.location) {
        return false;
      }
      // Type
      if (filters.type !== 'All Types' && apt.type !== filters.type) {
        return false;
      }
      // Budget
      if (apt.monthlyPrice < filters.minPrice || apt.monthlyPrice > filters.maxPrice) {
        return false;
      }
      // Pet friendly
      if (filters.petFriendly && !apt.petFriendly) {
        return false;
      }
      // 3D Virtual tour
      if (filters.hasVirtualTour && !apt.hasVirtualTour) {
        return false;
      }
      // Search query text
      if (searchQueryText.trim() !== '') {
        const text = searchQueryText.toLowerCase();
        const matchesName = apt.name.toLowerCase().includes(text);
        const matchesDesc = apt.description.toLowerCase().includes(text);
        if (!matchesName && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [filters, searchQueryText, apartmentsList]);

  // Pricing helper based on lease term discounts
  // 1 month: standard, 3 months: 5% off, 6 months: 10% off, 12 months: 15% off
  const getPricingForTerm = (basePrice: number, term: number) => {
    let discount = 0;
    if (term === 3) discount = 0.05;
    else if (term === 6) discount = 0.10;
    else if (term === 12) discount = 0.15;

    const monthly = Math.round(basePrice * (1 - discount));
    const securityDeposit = monthly; // standard 1 month
    const utilities = 3000000; // flat rate in VND (3 million)
    const totalFirstMonth = monthly + securityDeposit + utilities;
    const totalLease = (monthly + utilities) * term + securityDeposit;

    return {
      monthly,
      discountPercent: discount * 100,
      securityDeposit,
      utilities,
      totalFirstMonth,
      totalLease
    };
  };

  // Map simulation: coordinates in VN cities
  const cityCoords = useMemo(() => {
    return {
      'Saigon': [
        { id: 'apt-saigon-skyline', x: 42, y: 72, name: 'Saigon Skyline' }
      ],
      'Hanoi': [
        { id: 'apt-hanoi-indochine', x: 38, y: 25, name: 'Hanoi Indochine' }
      ],
      'Da Nang': [
        { id: 'apt-danang-ocean', x: 55, y: 48, name: 'Da Nang Ocean' }
      ],
      'Phu Quoc': [
        { id: 'apt-phuquoc-sunset', x: 18, y: 88, name: 'Phu Quoc Sunset' }
      ],
      'Sapa': [
        { id: 'apt-sapa-misty', x: 26, y: 15, name: 'Sapa Misty' }
      ],
      'Thai Nguyen': [
        { id: 'apt-thainguyen-garden', x: 44, y: 20, name: 'Thai Nguyen Zen' }
      ]
    };
  }, []);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Leaflet map setup & reactivity
  useEffect(() => {
    if (viewMode !== 'split' || !mapContainerRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    // Initialize map
    if (!mapInstanceRef.current) {
      const cityConfig = CITY_CENTERS[filters.location] || CITY_CENTERS['All Locations'];
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: true
      }).setView(cityConfig.center, cityConfig.zoom);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(mapInstanceRef.current);

      L.control.zoom({
        position: 'bottomright'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Pan/Zoom to city center when filters change
    const cityConfig = CITY_CENTERS[filters.location] || CITY_CENTERS['All Locations'];
    map.setView(cityConfig.center, cityConfig.zoom, { animate: true, duration: 1 });

    // Clear old markers
    Object.keys(markersRef.current).forEach(key => {
      markersRef.current[key]?.remove();
    });
    markersRef.current = {};

    // Create new markers matching current filter results
    filteredApartments.forEach((apt) => {
      const coords = APARTMENT_COORDS[apt.id];
      if (!coords) return;

      const isHovered = hoveredAptId === apt.id;
      
      const iconHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer transition-all duration-300">
          ${isHovered ? `
            <div class="absolute -inset-3 rounded-full bg-emerald-500/30 animate-ping" style="animation-duration: 1.5s;"></div>
            <div class="absolute -inset-1.5 rounded-full bg-emerald-500/20"></div>
          ` : ''}
          <div class="relative flex items-center gap-1.5 bg-slate-900 border-2 ${isHovered ? 'border-emerald-400 text-emerald-400 scale-110 shadow-emerald-500/25 shadow-lg' : 'border-slate-700 text-slate-200'} px-2.5 py-1.5 rounded-xl shadow-md transition-all duration-300">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M3 21h18M9 21V9a2 2 0 012-2h2a2 2 0 012 2v12M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="text-[11px] font-mono font-black tracking-tight whitespace-nowrap">
              ${(apt.monthlyPrice / 1000000).toFixed(1).replace('.0', '')} tr
            </span>
          </div>
          <div class="w-2 h-2 bg-slate-900 ${isHovered ? 'border-b-2 border-r-2 border-emerald-400' : 'border-b border-r border-slate-700'} rotate-45 -mt-1 shadow-md"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: iconHtml,
        iconSize: [60, 36],
        iconAnchor: [30, 36]
      });

      const marker = L.marker(coords, { icon: customIcon }).addTo(map);
      
      marker.on('click', () => {
        setSelectedAptForBooking(apt);
        setCustomLeaseTerm(6);
        setBookingStep(1);
      });

      marker.on('mouseover', () => {
        setHoveredAptId(apt.id);
      });

      marker.on('mouseout', () => {
        setHoveredAptId(null);
      });

      markersRef.current[apt.id] = marker;
    });

  }, [viewMode, filteredApartments, filters.location, hoveredAptId]);

  // Clean map instance on complete unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);


  // 3D virtual tour auto rotation handling
  useEffect(() => {
    if (selectedAptForTour && isRotatingTour) {
      tourIntervalRef.current = setInterval(() => {
        setTourRotation(r => (r + 1) % 360);
      }, 40);
    } else {
      if (tourIntervalRef.current) clearInterval(tourIntervalRef.current);
    }
    return () => {
      if (tourIntervalRef.current) clearInterval(tourIntervalRef.current);
    };
  }, [selectedAptForTour, isRotatingTour]);

  // Handle signature pad drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    setIsDrawingSig(true);
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setSigPoints([{ x, y }]);
    setHasSigned(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setSigPoints(prev => [...prev, { x, y }]);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#1d4ed8'; // blue-700
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      if (sigPoints.length > 0) {
        ctx.moveTo(sigPoints[sigPoints.length - 1].x, sigPoints[sigPoints.length - 1].y);
      }
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawingSig(false);
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSigPoints([]);
    setHasSigned(false);
  };

  // Quick chips search logic
  const handleQuickBudgetChip = (maxPrice: number) => {
    setFilters(prev => ({ ...prev, minPrice: 500, maxPrice }));
  };

  const handleQuickTypeChip = (type: string) => {
    setFilters(prev => ({ ...prev, type }));
  };

  // Get Amenity Icon helper
  const renderAmenityIcon = (name: string) => {
    switch (name) {
      case 'Kitchen': return <Utensils className="w-4 h-4 text-slate-500" />;
      case 'Washing Machine': return <Wind className="w-4 h-4 text-slate-500" />;
      case 'Desk': return <FileText className="w-4 h-4 text-slate-500" />;
      case 'High-speed Wi-Fi': return <Wifi className="w-4 h-4 text-slate-500" />;
      case 'Smart Lock': return <Lock className="w-4 h-4 text-slate-500" />;
      case 'Gym': return <Dumbbell className="w-4 h-4 text-slate-500" />;
      case 'Pool': return <Waves className="w-4 h-4 text-slate-500" />;
      case 'Parking': return <Car className="w-4 h-4 text-slate-500" />;
      default: return <Sparkle className="w-4 h-4 text-slate-500" />;
    }
  };

  const scrollToSearchResults = () => {
    const el = document.getElementById('long-term-search-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentBookingPrice = selectedAptForBooking 
    ? getPricingForTerm(selectedAptForBooking.monthlyPrice, customLeaseTerm)
    : null;

  return (
    <div id="long-term-stays-view" className="w-full pb-20 bg-slate-50/30">
      
      {/* Full-width premium breadcrumb banner with room background and purple/indigo/blue overlay */}
      <div className="relative w-full h-[360px] bg-slate-950 overflow-hidden mb-12">
        <img
          src={ltBanner}
          alt="Long-term premium room interior"
          className="w-full h-full object-cover opacity-65 scale-105 motion-safe:animate-[pulse_10s_ease-in-out_infinite]"
          referrerPolicy="no-referrer"
        />
        {/* Soft, deep blue-purple-indigo gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-purple-950/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/30 to-slate-950/75" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-left">
          {/* Breadcrumb path */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 mb-4 tracking-wide">
            <a href="/" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-white font-medium">{ltTitle}</span>
          </nav>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4 leading-none">
            {ltTitle}
          </h1>
          
          {/* Subtitle */}
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl font-normal leading-relaxed text-balance">
            {ltSubtitle}
          </p>
        </div>
      </div>

      {/* Main layout container with perfect side spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Advantages section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 p-6 sm:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2.5">
            <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
            Advantages
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {ltAdvantages.map((text, idx) => ({ num: idx + 1, text })).map((adv) => (
              <div 
                key={adv.num} 
                className="flex items-start gap-4 p-5 rounded-2xl bg-blue-50/35 border border-blue-100/30 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 font-bold flex items-center justify-center text-sm shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  {adv.num}
                </div>
                <p className="text-sm font-semibold text-slate-600 leading-snug group-hover:text-slate-800 transition-colors pt-1">
                  {adv.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Room Types section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Room Types (Phân khúc phòng)
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <p className="hidden lg:block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Click a room type card to quick-filter matching live apartments
              </p>
              <button
                type="button"
                onClick={() => setIsAdminEditMode(!isAdminEditMode)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm border ${
                  isAdminEditMode 
                    ? 'bg-amber-500 hover:bg-amber-600 border-amber-500 text-white shadow-amber-500/10' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {isAdminEditMode ? '✓ Tắt Chế độ Sửa' : '⚙️ Chỉnh sửa Phân khúc & Giá'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roomTypes.map((typeItem) => {
              const isSelected = filters.type === typeItem.id;
              
              // Choose correct icon component
              let IconComponent = Bed;
              if (typeItem.icon === 'Maximize2') {
                IconComponent = Maximize2;
              } else if (typeItem.icon === 'Sparkles') {
                IconComponent = Sparkles;
              }

              // Color scheme based on category ID
              const badgeColors = 
                typeItem.id === 'Studio' 
                  ? { border: 'border-blue-500 ring-blue-500/10 hover:border-blue-300', text: 'text-blue-600' }
                  : typeItem.id === '1-Bedroom'
                  ? { border: 'border-indigo-500 ring-indigo-500/10 hover:border-indigo-300', text: 'text-indigo-600' }
                  : { border: 'border-purple-500 ring-purple-500/10 hover:border-purple-300', text: 'text-purple-600' };

              return (
                <div key={typeItem.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      setFilters(prev => ({ ...prev, type: typeItem.id }));
                      scrollToSearchResults();
                    }}
                    className={`w-full text-left rounded-3xl overflow-hidden border transition-all duration-300 group cursor-pointer ${
                      isSelected 
                        ? `${badgeColors.border} ring-4 shadow-xl -translate-y-1.5` 
                        : `border-slate-100 ${badgeColors.border.split(' ')[2]} shadow-md hover:shadow-xl hover:-translate-y-1.5 bg-white`
                    }`}
                  >
                    <div className="h-44 relative overflow-hidden flex flex-col justify-end p-6 text-white">
                      <img
                        src={typeItem.image}
                        alt={typeItem.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
                      <div className="relative z-10 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="relative z-10 text-lg font-black tracking-tight text-white drop-shadow-sm">{typeItem.name}</h3>
                    </div>
                    <div className="p-6 bg-white space-y-4">
                      <p className="text-sm text-slate-500 font-medium">{typeItem.sizeDesc}</p>
                      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giá từ</span>
                        <span className={`text-base font-black ${badgeColors.text}`}>
                          {typeof typeItem.price === 'number' ? formatVND(typeItem.price) + '/tháng' : typeItem.price}
                        </span>
                      </div>
                    </div>
                  </button>

                  {isAdminEditMode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        startEditingRoomType(typeItem);
                      }}
                      className="absolute top-4 right-4 z-20 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 text-xs font-bold cursor-pointer border border-amber-400"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Search & Map Panel container */}
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              Live Search: Find Co-living & Long-term Stays
            </h3>
          </div>

          {/* Advanced Filter Ribbon Section */}
          <div id="long-term-search-anchor" className="bg-white rounded-3xl shadow-xl border border-slate-100 p-5">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-slate-50">
          
          {/* Search bar input text */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Từ khóa tìm kiếm</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ví dụ: ban công, Landmark 81, bồn tắm..."
                value={searchQueryText}
                onChange={(e) => setSearchQueryText(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-sm font-semibold focus:outline-none transition-all"
              />
              {searchQueryText && (
                <button onClick={() => setSearchQueryText('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Location selector dropdown */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Khu vực TP</label>
            <select
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-sm font-semibold focus:outline-none transition-all cursor-pointer"
            >
              <option value="All Locations">Tất cả khu vực</option>
              {LOCATIONS.filter(l => l !== 'All Locations').map(loc => (
                <option key={loc} value={loc}>{loc === 'Saigon' ? 'TP. Hồ Chí Minh' : loc === 'Hanoi' ? 'Thủ đô Hà Nội' : loc}</option>
              ))}
            </select>
          </div>

          {/* Type selector dropdown */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hạng căn hộ</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-sm font-semibold focus:outline-none transition-all cursor-pointer"
            >
              <option value="All Types">Mọi phân khúc</option>
              {APARTMENT_TYPES.filter(t => t !== 'All Types').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Budget filter selectors */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Khoảng giá (₫ / tháng)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={10000000}
                max={100000000}
                step={5000000}
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: parseInt(e.target.value) || 10000000 }))}
                className="w-1/2 px-2.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold text-center focus:outline-none"
                placeholder="Từ"
              />
              <span className="text-slate-300 font-bold">—</span>
              <input
                type="number"
                min={10000000}
                max={100000000}
                step={5000000}
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) || 80000000 }))}
                className="w-1/2 px-2.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold text-center focus:outline-none"
                placeholder="Đến"
              />
            </div>
          </div>

        </div>

        {/* Checkbox filters & Toggle Views */}
        <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-5">
            {/* Pet friendly toggle */}
            <label className="relative flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.petFriendly}
                onChange={(e) => setFilters(prev => ({ ...prev, petFriendly: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800 flex items-center gap-1">
                <Dog className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                Cho phép thú cưng
              </span>
            </label>

            {/* Virtual tour 3D toggle */}
            <label className="relative flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.hasVirtualTour}
                onChange={(e) => setFilters(prev => ({ ...prev, hasVirtualTour: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                Có nhà mẫu 3D VR
              </span>
            </label>

            {/* Quick tag chips */}
            <div className="hidden lg:flex items-center gap-2 border-l border-slate-100 pl-4 text-xs font-medium text-slate-400">
              <span>Lọc nhanh:</span>
              <button 
                onClick={() => handleQuickBudgetChip(25000000)}
                className="px-2.5 py-1 bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors border border-slate-100"
              >
                Dưới 25 triệu/tháng
              </button>
              <button 
                onClick={() => handleQuickTypeChip('Studio')}
                className="px-2.5 py-1 bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors border border-slate-100"
              >
                Phòng Studio
              </button>
            </div>
          </div>

          {/* Toggle View Mode: Grid vs. Map Split View */}
          <div className="flex items-center gap-1.5 self-end md:self-auto bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Dạng lưới</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'split' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Bản đồ nhiệt</span>
            </button>
            <button
              onClick={() => setViewMode('scroll')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'scroll' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Cuộn ngang</span>
            </button>
          </div>

        </div>

      </div>

      {/* Main Workspace Frame with Split Layout option */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Apartment List Grid */}
        <div className={`${viewMode === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6 transition-all duration-500`}>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Tìm thấy {filteredApartments.length} căn hộ dài hạn phù hợp
            </span>
            {filteredApartments.length === 0 && (
              <button 
                onClick={() => {
                  setFilters({
                    location: 'All Locations',
                    type: 'All Types',
                    leaseTerm: 6,
                    minPrice: 10000000,
                    maxPrice: 80000000,
                    petFriendly: false,
                    hasVirtualTour: false
                  });
                  setSearchQueryText('');
                }}
                className="text-xs text-emerald-600 font-bold hover:underline"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>

          {viewMode === 'scroll' ? (
            <div className="relative group/scroll w-full">
              {/* Left Scroll Button */}
              <button 
                onClick={() => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollBy({ left: -380, behavior: 'smooth' });
                  }
                }}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-xl border border-slate-200/50 flex items-center justify-center text-slate-800 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 active:scale-90 transition-all cursor-pointer opacity-0 group-hover/scroll:opacity-100 duration-300"
              >
                <span className="text-xs font-black">◀</span>
              </button>

              {/* Right Scroll Button */}
              <button 
                onClick={() => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollBy({ left: 380, behavior: 'smooth' });
                  }
                }}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-xl border border-slate-200/50 flex items-center justify-center text-slate-800 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 active:scale-90 transition-all cursor-pointer opacity-0 group-hover/scroll:opacity-100 duration-300"
              >
                <span className="text-xs font-black">▶</span>
              </button>

              <div 
                ref={scrollContainerRef}
                className="flex flex-nowrap overflow-x-auto gap-6 pb-6 pt-2 snap-x scroll-smooth no-scrollbar scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredApartments.map((apt) => {
                  const pricing = getPricingForTerm(apt.monthlyPrice, 6);
                  return (
                    <motion.div
                      key={`scroll-${apt.id}`}
                      layoutId={`apt-card-scroll-${apt.id}`}
                      onMouseEnter={() => setHoveredAptId(apt.id)}
                      onMouseLeave={() => setHoveredAptId(null)}
                      className={`w-[290px] sm:w-[350px] md:w-[380px] shrink-0 snap-start bg-white rounded-3xl border transition-all duration-300 overflow-hidden relative ${
                        hoveredAptId === apt.id 
                          ? 'border-emerald-300 shadow-2xl shadow-emerald-500/10 -translate-y-1.5' 
                          : 'border-slate-100 shadow-md shadow-slate-200/30'
                      }`}
                    >
                      {/* Image banner frame */}
                      <div className="h-52 relative overflow-hidden group/image">
                        <img
                          src={apt.image}
                          alt={apt.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
                        />
                        
                        {/* Floating badges on top */}
                        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5">
                          <span className="px-3 py-1 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-black rounded-xl uppercase tracking-wider">
                            {apt.type}
                          </span>
                          {apt.hasVirtualTour && (
                            <span className="px-2.5 py-1 bg-emerald-500 text-white text-[9px] font-bold rounded-lg flex items-center gap-1 w-fit shadow-md shadow-emerald-500/20">
                              <Eye className="w-3.5 h-3.5 animate-pulse" />
                              3D TOUR
                            </span>
                          )}
                        </div>

                        <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl text-xs font-black text-slate-800 shadow-md">
                          ★ {apt.rating}
                        </div>

                        {/* Compare Checkbox Toggle */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleToggleCompare(apt.id);
                          }}
                          className={`absolute top-12 right-3.5 z-10 px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer border ${
                            selectedCompareIds.includes(apt.id)
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950 scale-105'
                              : 'bg-slate-950/80 hover:bg-slate-950/90 border-slate-700/50 text-slate-300 hover:text-white hover:scale-105'
                          }`}
                        >
                          {selectedCompareIds.includes(apt.id) ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ĐÃ CHỌN
                            </>
                          ) : (
                            <>
                              <span>＋</span> SO SÁNH
                            </>
                          )}
                        </button>

                        <div className="absolute bottom-3.5 left-3.5 bg-slate-950/80 backdrop-blur-md text-slate-200 text-[10px] px-3 py-1 rounded-xl font-bold">
                          Diện tích: {apt.area}m²
                        </div>

                        {/* Quick view tour overlay button */}
                        {apt.hasVirtualTour && (
                          <button
                            onClick={() => {
                              setSelectedAptForTour(apt);
                              setTourRotation(0);
                              setIsRotatingTour(true);
                            }}
                            className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover/image:opacity-100 flex items-center justify-center text-white transition-opacity duration-300 font-bold text-xs gap-1.5 cursor-pointer backdrop-blur-[2px]"
                          >
                            <Compass className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                            Khám phá nhà mẫu 3D
                          </button>
                        )}

                        {isAdminEditMode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              startEditingApartment(apt);
                            }}
                            className="absolute bottom-3.5 right-3.5 z-20 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 border border-amber-400 shadow-lg cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>
                        )}
                      </div>

                      {/* Body textual information */}
                      <div className="p-5 space-y-4 text-left">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-300" />
                            {apt.location} Central District
                          </span>
                          <h3 className="font-extrabold text-slate-900 text-base line-clamp-1 hover:text-emerald-600 cursor-pointer">
                            {apt.name}
                          </h3>
                        </div>

                        {/* Key characteristics: PN, WC, Bed */}
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-2xl border border-slate-100/50">
                          <div className="flex items-center gap-1.5">
                            <Bed className="w-4 h-4 text-slate-400" />
                            <span>{apt.bedrooms} PN</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Bath className="w-4 h-4 text-slate-400" />
                            <span>{apt.bathrooms} WC</span>
                          </div>
                          {apt.petFriendly && (
                            <div className="flex items-center gap-1 text-emerald-600 ml-auto bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                              <Dog className="w-3.5 h-3.5" />
                              <span>Thú cưng Ok</span>
                            </div>
                          )}
                        </div>

                        {/* Brief description */}
                        <p className="text-slate-500 font-light text-xs line-clamp-2 leading-relaxed">
                          {apt.description}
                        </p>

                        {/* Amenities list (up to 4 icons) */}
                        <div className="flex items-center gap-2 pt-1">
                          {apt.amenities.slice(0, 4).map((amenity) => (
                            <div
                              key={amenity}
                              title={amenity}
                              className="p-2 bg-slate-100 hover:bg-slate-200/50 rounded-xl transition-colors cursor-help"
                            >
                              {renderAmenityIcon(amenity)}
                            </div>
                          ))}
                          {apt.amenities.length > 4 && (
                            <span className="text-[10px] font-bold text-slate-400 ml-1">
                              +{apt.amenities.length - 4}
                            </span>
                          )}
                        </div>

                        {/* Pricing Footer of the card */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Giá thuê chỉ từ</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-black text-emerald-600">{formatVND(pricing.monthly)}</span>
                              <span className="text-xs text-slate-400 font-medium">/tháng</span>
                            </div>
                            <span className="text-[9px] text-emerald-500 block">Hợp đồng dài hạn giảm tới 15%</span>
                          </div>

                          <div className="flex gap-2">
                             {apt.hasVirtualTour && (
                              <button
                                onClick={() => {
                                  setSelectedAptForTour(apt);
                                  setTourRotation(0);
                                  setIsRotatingTour(true);
                                }}
                                className="border border-slate-200 bg-white hover:bg-emerald-600 text-slate-800 hover:text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer group/tour-list shadow-sm hover:shadow-md hover:border-emerald-600"
                                title="Tham quan căn hộ 3D"
                              >
                                <Compass className="w-3.5 h-3.5 text-emerald-600 group-hover/tour-list:text-white transition-colors animate-pulse" />
                                Tham quan 3D
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedAptForBooking(apt);
                                setCustomLeaseTerm(6);
                                setBookingStep(1);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 active:scale-95 flex items-center gap-1 cursor-pointer"
                            >
                              Thuê ngay
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${viewMode === 'split' ? 'sm:grid-cols-1 xl:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-6`}>
              {filteredApartments.map((apt) => {
                const pricing = getPricingForTerm(apt.monthlyPrice, 6); // standard standard display for 6m
                return (
                  <motion.div
                    key={apt.id}
                    layoutId={`apt-card-${apt.id}`}
                    onMouseEnter={() => setHoveredAptId(apt.id)}
                    onMouseLeave={() => setHoveredAptId(null)}
                    className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden relative ${
                      hoveredAptId === apt.id 
                        ? 'border-emerald-200 shadow-xl shadow-emerald-500/5 -translate-y-1' 
                        : 'border-slate-100 shadow-sm'
                    }`}
                  >
                    
                    {/* Image banner frame */}
                    <div className="h-48 relative overflow-hidden group">
                      <img
                        src={apt.image}
                        alt={apt.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      
                      {/* Floating badges on top */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                          {apt.type}
                        </span>
                        {apt.hasVirtualTour && (
                          <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded flex items-center gap-1 w-fit shadow-md shadow-emerald-500/20">
                            <Eye className="w-3 h-3 animate-pulse" />
                            3D TOUR
                          </span>
                        )}
                      </div>

                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-black text-slate-800 shadow-md">
                        ★ {apt.rating}
                      </div>

                      {/* Compare Checkbox Toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleToggleCompare(apt.id);
                        }}
                        className={`absolute top-12 right-3 z-10 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer border ${
                          selectedCompareIds.includes(apt.id)
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 scale-105'
                            : 'bg-slate-900/80 hover:bg-slate-900/90 border-slate-700/50 text-slate-300 hover:text-white hover:scale-105'
                        }`}
                      >
                        {selectedCompareIds.includes(apt.id) ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            ĐÃ CHỌN
                          </>
                        ) : (
                          <>
                            <span>＋</span> SO SÁNH
                          </>
                        )}
                      </button>

                      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] px-2.5 py-1 rounded-lg">
                        Diện tích: {apt.area}m²
                      </div>

                      {/* Quick view tour overlay button */}
                      {apt.hasVirtualTour && (
                        <button
                          onClick={() => {
                            setSelectedAptForTour(apt);
                            setTourRotation(0);
                            setIsRotatingTour(true);
                          }}
                          className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-300 font-bold text-xs gap-1.5"
                        >
                          <Compass className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                          Khám phá nhà mẫu 3D
                        </button>
                      )}

                      {isAdminEditMode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            startEditingApartment(apt);
                          }}
                          className="absolute bottom-3 right-3 z-20 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 border border-amber-400 shadow-lg cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                      )}
                    </div>

                    {/* Body textual information */}
                    <div className="p-4 space-y-3.5 text-left">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-300" />
                          {apt.location} Central District
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-1 hover:text-emerald-600 cursor-pointer">
                          {apt.name}
                        </h3>
                      </div>

                      {/* Key characteristics: PN, WC, Bed */}
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100/50">
                        <div className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-slate-400" />
                          <span>{apt.bedrooms} PN</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5 text-slate-400" />
                          <span>{apt.bathrooms} WC</span>
                        </div>
                        {apt.petFriendly && (
                          <div className="flex items-center gap-1 text-emerald-600 ml-auto bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                            <Dog className="w-3 h-3" />
                            <span>Nuôi Pet Ok</span>
                          </div>
                        )}
                      </div>

                      {/* Brief description */}
                      <p className="text-slate-500 font-light text-xs line-clamp-2 leading-relaxed">
                        {apt.description}
                      </p>

                      {/* Amenities list (up to 4 icons) */}
                      <div className="flex items-center gap-2 pt-1">
                        {apt.amenities.slice(0, 4).map((amenity) => (
                          <div
                            key={amenity}
                            title={amenity}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200/50 rounded-lg transition-colors cursor-help"
                          >
                            {renderAmenityIcon(amenity)}
                          </div>
                        ))}
                        {apt.amenities.length > 4 && (
                          <span className="text-[10px] font-bold text-slate-400">
                            +{apt.amenities.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Pricing Footer of the card */}
                      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Giá thuê chỉ từ</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-emerald-600">{formatVND(pricing.monthly)}</span>
                            <span className="text-xs text-slate-400 font-medium">/tháng</span>
                          </div>
                          <span className="text-[9px] text-emerald-500 block">Hợp đồng dài hạn giảm tới 15%</span>
                        </div>

                        <div className="flex gap-2">
                          {apt.hasVirtualTour && (
                            <button
                              onClick={() => {
                                setSelectedAptForTour(apt);
                                setTourRotation(0);
                                setIsRotatingTour(true);
                              }}
                              className="border border-slate-200 bg-white hover:bg-emerald-600 text-slate-800 hover:text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer group/tour-grid shadow-sm hover:shadow-md hover:border-emerald-600"
                              title="Tham quan căn hộ 3D"
                            >
                              <Compass className="w-3.5 h-3.5 text-emerald-600 group-hover/tour-grid:text-white transition-colors animate-pulse" />
                              Tham quan 3D
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedAptForBooking(apt);
                              setCustomLeaseTerm(6);
                              setBookingStep(1);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 active:scale-95 flex items-center gap-1 cursor-pointer"
                          >
                            Đăng ký thuê
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Side: Map & Interactive Pins Section */}
        {viewMode === 'split' && (
          <div className="lg:col-span-5 h-[620px] sticky top-6 bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col relative z-10">
            {/* Real OpenStreetMap container */}
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden" />
            
            {/* Floating indicator for premium feel */}
            <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 shadow-xl pointer-events-none">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[11px] font-extrabold tracking-wider uppercase font-sans text-slate-100">Bản đồ vệ tinh OpenStreetMap</span>
            </div>

            <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-800 text-[10px] text-slate-300 space-y-1 shadow-xl pointer-events-none">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span>Căn hộ trống dài hạn</span>
              </div>
              <div className="text-[9px] text-slate-400 font-mono">Click vào Ghim để Đăng ký thuê</div>
            </div>
          </div>
        )}

      </div> {/* closes grid-cols-12 Main workspace frame */}
      </div> {/* closes space-y-6 Live Search container */}
      </div> {/* closes max-w-7xl inner layout wrapper */}

      {/* MODAL 1: 3D VIRTUAL TOUR DIALOG */}
      <AnimatePresence>
        {selectedAptForTour && (
          <InteractiveRoomTour
            apartment={selectedAptForTour}
            onClose={() => setSelectedAptForTour(null)}
            onBook={(apt) => {
              setSelectedAptForBooking(apt);
              setSelectedAptForTour(null);
              setCustomLeaseTerm(6);
              setBookingStep(1);
            }}
          />
        )}
      </AnimatePresence>

      {/* MODAL 2: DETAILED LEASE SIGNING & BOOKING FLOW */}
      <AnimatePresence>
        {selectedAptForBooking && currentBookingPrice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAptForBooking(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100 max-h-[95vh] flex flex-col"
            >
              
              {/* Modal Title Banner */}
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div>
                  <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest block mb-1">
                    HỢP ĐỒNG THUÊ CĂN HỘ CAO CẤP GRANDSTAY
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white leading-none">
                    {bookingStep === 1 ? 'Cấu Hình Kỳ Hạn & Chi Phí Thuê' : bookingStep === 2 ? 'Ký Hợp Đồng Thuê Nhà Điện Tử' : 'Đăng Ký Thuê Thành Công!'}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAptForBooking(null)}
                  className="p-1.5 rounded-xl bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Steps Header */}
              <div className="bg-slate-50 px-6 py-2 border-b border-slate-100 shrink-0 flex items-center justify-between text-xs font-bold text-slate-400">
                <div className={`flex items-center gap-1.5 ${bookingStep === 1 ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <span className="w-5 h-5 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-[10px] font-bold peer-checked:bg-emerald-500">1</span>
                  <span>Thiết lập kỳ hạn</span>
                </div>
                <div className="h-[1px] bg-slate-200 flex-1 mx-4" />
                <div className={`flex items-center gap-1.5 ${bookingStep === 2 ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <span className="w-5 h-5 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Đăng ký & Ký tên</span>
                </div>
                <div className="h-[1px] bg-slate-200 flex-1 mx-4" />
                <div className={`flex items-center gap-1.5 ${bookingStep === 3 ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <span className="w-5 h-5 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Chứng nhận</span>
                </div>
              </div>

              {/* Scrollable Container Body */}
              <div className="overflow-y-auto p-6 sm:p-8 flex-1 text-left no-scrollbar">
                
                {/* STEP 1: CALCULATOR & TERM SETUP */}
                {bookingStep === 1 && (
                  <div className="space-y-6">
                    
                    {/* Apartment details header card */}
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <img src={selectedAptForBooking.image} alt={selectedAptForBooking.name} className="w-16 h-16 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">{selectedAptForBooking.name}</h4>
                        <span className="text-xs text-slate-500 mt-1 block flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          Quận trung tâm, TP. {selectedAptForBooking.location} • Diện tích: {selectedAptForBooking.area}m²
                        </span>
                      </div>
                    </div>

                    {/* Lease Term Selector with dynamic discounts explanation */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Kỳ hạn thuê hợp đồng</label>
                      <div className="grid grid-cols-4 gap-2.5">
                        {[1, 3, 6, 12].map((term) => {
                          const termPricing = getPricingForTerm(selectedAptForBooking.monthlyPrice, term);
                          const isSelected = customLeaseTerm === term;
                          return (
                            <button
                              key={term}
                              type="button"
                              onClick={() => setCustomLeaseTerm(term)}
                              className={`p-3 rounded-2xl border text-center transition-all ${
                                isSelected 
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-100' 
                                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <strong className="block text-lg font-black leading-none mb-1">{term}</strong>
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Tháng</span>
                              {termPricing.discountPercent > 0 && (
                                <span className="inline-block mt-1 text-[9px] font-black text-emerald-600 bg-emerald-100/60 px-1 py-0.2 rounded">
                                  Giam {termPricing.discountPercent}%
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detailed price calculation rows */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bảng chi phí chi tiết</h5>
                      <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100 text-xs text-slate-600 overflow-hidden">
                        
                        <div className="p-3.5 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-800 text-sm">Tiền thuê hàng tháng:</span>
                            <span className="block text-slate-400 text-[10px]">Đã áp dụng giảm giá kỳ hạn {customLeaseTerm} tháng</span>
                          </div>
                          <strong className="text-slate-900 text-base font-black">{formatVND(currentBookingPrice.monthly)} / tháng</strong>
                        </div>

                        <div className="p-3.5 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-800 text-sm">Tiền cọc đảm bảo hoàn trả:</span>
                            <span className="block text-slate-400 text-[10px]">Hoàn trả 100% khi thanh lý hợp đồng đúng cam kết</span>
                          </div>
                          <strong className="text-slate-800 text-sm font-bold">{formatVND(currentBookingPrice.securityDeposit)} (1 tháng cọc)</strong>
                        </div>

                        <div className="p-3.5 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-800 text-sm">Gói tiện ích & Internet cố định:</span>
                            <span className="block text-slate-400 text-[10px]">Bao gồm điện, nước, internet cáp quang tốc độ cao</span>
                          </div>
                          <strong className="text-slate-800 text-sm font-bold">{formatVND(currentBookingPrice.utilities)} / tháng</strong>
                        </div>

                        <div className="p-4 bg-emerald-50/50 flex justify-between items-center">
                          <div>
                            <span className="font-black text-emerald-800 text-sm sm:text-base">Thanh toán tháng đầu tiên:</span>
                            <span className="block text-emerald-600 text-[10px] font-bold">Thanh toán khi ký hợp đồng (Tháng đầu + Tiền cọc + Tiện ích)</span>
                          </div>
                          <strong className="text-emerald-700 text-lg sm:text-xl font-black">{formatVND(currentBookingPrice.totalFirstMonth)}</strong>
                        </div>

                      </div>
                    </div>

                    {/* Service disclaimer details */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed font-light">
                      <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Lưu ý về dọn dẹp hàng tuần:</strong> GrandStay Suites cung cấp dịch vụ dọn dẹp phòng, thay chăn ga gối đệm 1 lần/tuần miễn phí. Gói giặt là đồ cá nhân tùy chọn thêm có thể đăng ký bổ sung trong lúc ký hợp đồng.
                      </div>
                    </div>

                    {/* Step control button */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setBookingStep(2)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <span>Tiếp tục điền thông tin</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                )}

                {/* STEP 2: TENANT DETAILS & SIGN PAD */}
                {bookingStep === 2 && (
                  <div className="space-y-6">
                    
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin người đứng tên hợp đồng</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-500">Họ và Tên người thuê</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <User className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              required
                              value={tenantName}
                              onChange={(e) => setTenantName(e.target.value)}
                              placeholder="Nguyễn Văn A"
                              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs font-semibold focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-500">Số điện thoại liên lạc</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <Phone className="w-4 h-4" />
                            </span>
                            <input
                              type="tel"
                              required
                              value={tenantPhone}
                              onChange={(e) => setTenantPhone(e.target.value)}
                              placeholder="0912 345 678"
                              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs font-semibold focus:outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-500">Địa chỉ Email nhận hợp đồng PDF</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <Mail className="w-4 h-4" />
                            </span>
                            <input
                              type="email"
                              required
                              value={tenantEmail}
                              onChange={(e) => setTenantEmail(e.target.value)}
                              placeholder="nguyenvana@gmail.com"
                              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs font-semibold focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-500 font-sans">Ngày mong muốn dọn vào</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <Calendar className="w-4 h-4" />
                            </span>
                            <input
                              type="date"
                              required
                              value={moveInDate}
                              onChange={(e) => setMoveInDate(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs font-semibold focus:outline-none transition-all cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Co-living roommate toggle options */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-bold text-slate-800">Cần tìm thêm người ghép phòng (Roommate)?</span>
                          <span className="block text-[11px] text-slate-400 font-light mt-0.5">Chúng tôi hỗ trợ kết nối bạn với các cư dân số, digital nomad văn minh phù hợp tính cách.</span>
                        </div>
                        <label className="relative flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={coLivingRequest}
                            onChange={(e) => setCoLivingRequest(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                    </div>

                    {/* Signature Pad Section */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <label className="text-slate-500 uppercase tracking-wider">Ký tên điện tử vào hợp đồng mẫu</label>
                        {hasSigned && (
                          <button
                            type="button"
                            onClick={clearSignature}
                            className="text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-0.5"
                          >
                            Xóa ký lại
                          </button>
                        )}
                      </div>

                      <div className="relative bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl h-36 flex flex-col items-center justify-center overflow-hidden">
                        <canvas
                          ref={sigCanvasRef}
                          width={600}
                          height={144}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="absolute inset-0 w-full h-full cursor-crosshair z-20 touch-none"
                        />
                        {!hasSigned && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 text-xs">
                            <span className="text-xl">✍</span>
                            <span className="mt-1 font-medium font-sans">Ký tên bằng chuột hoặc ngón tay vào đây</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Terms & Conditions Agreement */}
                    <div className="text-[10px] text-slate-400 leading-relaxed text-left">
                      ✓ Bằng việc ký tên bên trên, bạn đồng ý với Điều khoản thuê căn hộ GrandStay, Quy chế cư dân co-living văn minh, cam kết không gây tiếng ồn lớn sau 22:00 đêm và chịu trách nhiệm bảo quản trang thiết bị nội thất.
                    </div>

                    {/* Step buttons */}
                    <div className="pt-4 border-t border-slate-100 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setBookingStep(1)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 h-11 rounded-xl text-xs font-bold transition-all"
                      >
                        Quay lại
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!tenantName || !tenantPhone || !tenantEmail) return;
                          
                          // Save signed contract to localStorage for CustomerPortal synchronization
                          if (selectedAptForBooking) {
                            const newContract = {
                              id: 'HD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                              aptName: selectedAptForBooking.name,
                              location: selectedAptForBooking.location,
                              monthlyPrice: currentBookingPrice,
                              leaseTerm: customLeaseTerm,
                              tenantName: tenantName,
                              tenantPhone: tenantPhone,
                              tenantEmail: tenantEmail,
                              signedDate: new Date().toISOString().split('T')[0]
                            };
                            
                            try {
                              const existing = localStorage.getItem('gs_signed_contracts');
                              const parsed = existing ? JSON.parse(existing) : [];
                              localStorage.setItem('gs_signed_contracts', JSON.stringify([newContract, ...parsed]));
                              window.dispatchEvent(new Event('storage'));
                            } catch (e) {
                              console.error('Error saving contract to localStorage', e);
                            }
                          }

                          setBookingStep(3);
                        }}
                        disabled={!hasSigned || !tenantName || !tenantPhone}
                        className={`px-8 h-11 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          hasSigned && tenantName && tenantPhone
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10 active:scale-95'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Ký tên & Xác nhận</span>
                      </button>
                    </div>

                  </div>
                )}

                {/* STEP 3: SUCCESS FLOW CONTRACT CERTIFICATE */}
                {bookingStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 space-y-6"
                  >
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black text-slate-900 tracking-tight">Ký Hợp Đồng Thành Công!</h4>
                      <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                        Hệ thống đã phê duyệt trực tuyến hợp đồng của quý cư dân <strong className="text-slate-800">{tenantName}</strong>. Bản gốc PDF có chữ ký điện tử đã được gửi tới hòm thư <strong className="text-slate-800">{tenantEmail}</strong>.
                      </p>
                    </div>

                    {/* Interactive signed agreement summary voucher card layout */}
                    <div className="bg-slate-900 text-white rounded-3xl p-6 text-left text-xs max-w-md mx-auto space-y-4 border border-slate-800 relative shadow-2xl overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div>
                          <span className="text-emerald-400 text-[9px] font-mono uppercase tracking-wider block">MÃ KHÁCH HÀNG CHỨNG THỰC</span>
                          <strong className="font-mono text-white text-sm uppercase">GS-RES-{Math.floor(1000 + Math.random() * 9000)}</strong>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[9px] font-black rounded-md uppercase tracking-wider">
                          SIGNED ACTIVE
                        </span>
                      </div>

                      <div className="space-y-2.5 font-sans">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Căn hộ:</span>
                          <strong className="text-slate-200">{selectedAptForBooking.name}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Thời hạn hợp đồng:</span>
                          <strong className="text-slate-200">{customLeaseTerm} tháng (Bắt đầu từ {moveInDate})</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Giá thuê hàng tháng:</span>
                          <strong className="text-slate-200">{formatVND(currentBookingPrice.monthly)} / tháng</strong>
                        </div>
                        <div className="flex justify-between text-emerald-400 font-bold pt-1">
                          <span>Phải trả tháng đầu (bao gồm cọc):</span>
                          <span>{formatVND(currentBookingPrice.totalFirstMonth)}</span>
                        </div>
                        {coLivingRequest && (
                          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-[10px] text-slate-300 leading-relaxed">
                            🙋‍♂️ <strong>Yêu cầu ghép phòng (Roommate) đã ghi nhận:</strong> Hệ thống AI Matching của GrandStay đang tìm các digital nomad tương thích để gợi ý trước ngày nhận nhà.
                          </div>
                        )}
                      </div>

                      {/* Render simulated signed canvas snippet inside receipt */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        <div>
                          <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Đại diện GrandStay</span>
                          <span className="font-serif italic text-emerald-400 font-bold text-sm block mt-0.5">GrandStay Corp.</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Chữ ký người thuê</span>
                          <div className="h-8 bg-white/5 rounded px-2 flex items-center justify-center font-mono text-[10px] italic text-emerald-400">
                            {tenantName}
                          </div>
                        </div>
                      </div>

                    </div>

                    <p className="text-slate-400 text-[11px] max-w-md mx-auto leading-relaxed">
                      Lịch bàn giao chìa khóa thông minh Smartkey và nhận nhà trực tiếp sẽ được gửi qua số điện thoại <strong className="text-slate-600">{tenantPhone}</strong> trong vòng 1-2 ngày làm việc.
                    </p>

                    <div className="pt-2">
                      <button
                        onClick={() => setSelectedAptForBooking(null)}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                      >
                        Quay lại danh sách căn hộ
                      </button>
                    </div>

                  </motion.div>
                )}

              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* Floating Room Comparison Bar */}
      <ApartmentCompareBar
        selectedApartments={selectedApartmentsToCompare}
        onRemove={(id) => setSelectedCompareIds(prev => prev.filter(x => x !== id))}
        onClear={() => setSelectedCompareIds([])}
        onOpenCompare={() => setIsCompareModalOpen(true)}
      />

      {/* Full-Screen Room Comparison Table Modal */}
      <AnimatePresence>
        {isCompareModalOpen && (
          <ApartmentCompareModal
            selectedApartments={selectedApartmentsToCompare}
            onClose={() => setIsCompareModalOpen(false)}
            onRemove={(id) => setSelectedCompareIds(prev => prev.filter(x => x !== id))}
            onBook={(apt) => {
              setIsCompareModalOpen(false);
              setSelectedAptForBooking(apt);
              setBookingStep(1);
            }}
            onOpenTour={(apt) => {
              setIsCompareModalOpen(false);
              setSelectedAptForTour(apt);
              setTourRotation(0);
              setIsRotatingTour(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Room Type Modal */}
      <AnimatePresence>
        {editingRoomType && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop shadow overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingRoomType(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 z-10 space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                    <h3 className="text-lg font-black text-slate-950">Chỉnh sửa Phân Khúc Phòng</h3>
                  </div>
                  <button
                    onClick={() => setEditingRoomType(null)}
                    className="p-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên Phân Khúc</label>
                    <input
                      type="text"
                      value={rtFormName}
                      onChange={(e) => setRtFormName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  {/* Size description field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mô tả diện tích / số khách</label>
                    <input
                      type="text"
                      value={rtFormSizeDesc}
                      onChange={(e) => setRtFormSizeDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  {/* Price field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Giá thuê hàng tháng (VND)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={rtFormPrice}
                        onChange={(e) => setRtFormPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-16 py-3 text-sm font-black text-blue-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₫/tháng</span>
                    </div>
                    {/* Live formatting preview */}
                    <div className="mt-1 text-[11px] text-slate-400 font-medium">
                      Định dạng hiển thị: <span className="font-bold text-slate-600">{formatVND(rtFormPrice)} / tháng</span>
                    </div>
                  </div>

                  {/* Image URL input & Unsplash presets */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ảnh Phân Khúc (Image URL)</label>
                    <input
                      type="text"
                      value={rtFormImage}
                      onChange={(e) => setRtFormImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />

                    {/* Predefined aesthetic choices */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Gợi ý hình ảnh thiết kế sang trọng:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80', label: 'Cozy Modern Studio' },
                          { url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80', label: 'Nordic Bed' },
                          { url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=400&q=80', label: 'Luxury Suite' },
                          { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80', label: 'Warm Deluxe' },
                          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80', label: 'Sunny Loft' },
                          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80', label: 'Elegant Suite' }
                        ].map((imgObj, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setRtFormImage(imgObj.url)}
                            className={`relative h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                              rtFormImage === imgObj.url ? 'border-amber-500 scale-95 shadow-md' : 'border-transparent hover:border-slate-300'
                            }`}
                            title={imgObj.label}
                          >
                            <img src={imgObj.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setEditingRoomType(null)}
                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={() => {
                      const updated = roomTypes.map(r => r.id === editingRoomType.id ? {
                        ...r,
                        name: rtFormName,
                        image: rtFormImage,
                        price: rtFormPrice,
                        sizeDesc: rtFormSizeDesc
                      } : r);
                      saveRoomTypes(updated);
                      setEditingRoomType(null);
                    }}
                    className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    Lưu Thay Đổi
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Apartment Modal */}
      <AnimatePresence>
        {selectedEditApartment && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop shadow overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEditApartment(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 z-10 space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                    <h3 className="text-lg font-black text-slate-950">Chỉnh sửa Căn Hộ / Phòng</h3>
                  </div>
                  <button
                    onClick={() => setSelectedEditApartment(null)}
                    className="p-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên Căn Hộ / Phòng</label>
                    <input
                      type="text"
                      value={aptFormName}
                      onChange={(e) => setAptFormName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  {/* Room Type dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phân Khúc (Room Type)</label>
                    <select
                      value={aptFormType}
                      onChange={(e) => setAptFormType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Studio">Standard Room (Studio)</option>
                      <option value="1-Bedroom">Deluxe Room (1-Bedroom)</option>
                      <option value="Service Apartment">Suite (Service Apartment)</option>
                      <option value="2-Bedroom">Two-Bedroom (2-Bedroom)</option>
                    </select>
                  </div>

                  {/* Price field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Giá thuê hàng tháng (VND)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={aptFormPrice}
                        onChange={(e) => setAptFormPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-16 py-3 text-sm font-black text-blue-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₫/tháng</span>
                    </div>
                    {/* Live formatting preview */}
                    <div className="mt-1 text-[11px] text-slate-400 font-medium">
                      Định dạng hiển thị: <span className="font-bold text-slate-600">{formatVND(aptFormPrice)} / tháng</span>
                    </div>
                  </div>

                  {/* Image URL input & Unsplash presets */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ảnh Căn Hộ (Image URL)</label>
                    <input
                      type="text"
                      value={aptFormImage}
                      onChange={(e) => setAptFormImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />

                    {/* Predefined aesthetic choices */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Gợi ý hình ảnh căn hộ cao cấp:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80', label: 'Cozy Modern Studio' },
                          { url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80', label: 'Nordic Bed' },
                          { url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=400&q=80', label: 'Luxury Suite' },
                          { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80', label: 'Warm Deluxe' },
                          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80', label: 'Sunny Loft' },
                          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80', label: 'Elegant Suite' }
                        ].map((imgObj, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setAptFormImage(imgObj.url)}
                            className={`relative h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                              aptFormImage === imgObj.url ? 'border-amber-500 scale-95 shadow-md' : 'border-transparent hover:border-slate-300'
                            }`}
                            title={imgObj.label}
                          >
                            <img src={imgObj.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedEditApartment(null)}
                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={() => {
                      const updated = apartmentsList.map(a => a.id === selectedEditApartment.id ? {
                        ...a,
                        name: aptFormName,
                        image: aptFormImage,
                        monthlyPrice: aptFormPrice,
                        type: aptFormType
                      } : a);
                      saveApartmentsList(updated);
                      setSelectedEditApartment(null);
                    }}
                    className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    Lưu Thay Đổi
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
