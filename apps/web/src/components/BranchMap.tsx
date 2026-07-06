import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Branch } from '../types';
import { Star, MapPin, X, ShieldCheck } from 'lucide-react';
import { formatVND } from '../data';

// Branch coordinate definitions
const BRANCH_COORDS: Record<string, [number, number]> = {
  'thai-nguyen': [21.593, 105.842],
  'phu-quoc': [10.219, 103.956],
  'da-nang': [16.068, 108.244],
  'ha-noi': [21.028, 105.852],
  'saigon': [10.776, 106.701],
  'sapa': [22.336, 103.843]
};

const LOCATION_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  'All Locations': { center: [16.2, 106.0], zoom: 5.5 }, // Vietnam center
  'Thai Nguyen': { center: [21.593, 105.842], zoom: 12 },
  'Phu Quoc': { center: [10.219, 103.956], zoom: 11 },
  'Da Nang': { center: [16.068, 108.244], zoom: 12 },
  'Hanoi': { center: [21.028, 105.852], zoom: 12 },
  'Saigon': { center: [10.776, 106.701], zoom: 12 },
  'Sapa': { center: [22.336, 103.843], zoom: 12 }
};

interface BranchMapProps {
  branches: Branch[];
  selectedLocation: string;
  onBook: (branch: Branch) => void;
  hoveredBranchId?: string | null;
  setHoveredBranchId?: (id: string | null) => void;
}

export default function BranchMap({
  branches,
  selectedLocation,
  onBook,
  hoveredBranchId = null,
  setHoveredBranchId
}: BranchMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map
    if (!mapInstanceRef.current) {
      const config = LOCATION_CENTERS[selectedLocation] || LOCATION_CENTERS['All Locations'];
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: true
      }).setView(config.center, config.zoom);

      // Add elegant dark theme tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(mapInstanceRef.current);

      // Add zoom control at bottom right
      L.control.zoom({
        position: 'bottomright'
      }).addTo(mapInstanceRef.current);

      // Handle popup booking button click dynamically
      mapInstanceRef.current.on('popupopen', (e) => {
        const container = e.popup.getElement();
        if (container) {
          const btn = container.querySelector('.popup-book-btn') as HTMLButtonElement | null;
          if (btn) {
            const branchId = btn.getAttribute('data-branch-id');
            const targetBranch = branches.find(b => b.id === branchId);
            if (targetBranch) {
              btn.addEventListener('click', () => {
                onBook(targetBranch);
              });
            }
          }
        }
      });
    }

    const map = mapInstanceRef.current;

    // Update map view based on selected search location
    const config = LOCATION_CENTERS[selectedLocation] || LOCATION_CENTERS['All Locations'];
    map.setView(config.center, config.zoom, { animate: true, duration: 1.2 });

    // Clear existing markers
    Object.keys(markersRef.current).forEach(key => {
      markersRef.current[key]?.remove();
    });
    markersRef.current = {};

    // Place branch markers
    branches.forEach((branch) => {
      const coords = BRANCH_COORDS[branch.id];
      if (!coords) return;

      const isHovered = hoveredBranchId === branch.id;
      const formattedPrice = (branch.pricePerNight / 1000000).toFixed(1).replace('.0', '');

      // Elegant custom map pin HTML
      const iconHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer transition-all duration-300">
          ${isHovered ? `
            <div class="absolute -inset-3 rounded-full bg-blue-500/30 animate-ping" style="animation-duration: 1.5s;"></div>
            <div class="absolute -inset-1.5 rounded-full bg-blue-500/20"></div>
          ` : ''}
          <div class="relative flex items-center gap-1.5 bg-slate-900 border-2 ${
            isHovered 
              ? 'border-brand-gold text-brand-gold scale-110 shadow-brand-gold/25 shadow-lg' 
              : 'border-slate-700 text-slate-200'
          } px-2.5 py-1.5 rounded-xl shadow-md transition-all duration-300">
            <svg class="w-3.5 h-3.5 ${isHovered ? 'text-brand-gold' : 'text-blue-400'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M3 21h18M9 21V9a2 2 0 012-2h2a2 2 0 012 2v12M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="text-[11px] font-mono font-black tracking-tight whitespace-nowrap">
              ${formattedPrice} tr
            </span>
          </div>
          <div class="w-2 h-2 bg-slate-900 ${
            isHovered ? 'border-b-2 border-r-2 border-brand-gold' : 'border-b border-r border-slate-700'
          } rotate-45 -mt-1 shadow-md"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: iconHtml,
        iconSize: [64, 38],
        iconAnchor: [32, 38]
      });

      // Prepare custom luxury styled Leaflet Popup markup
      const popupContent = `
        <div class="p-3 w-64 text-slate-100 font-sans bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
          <div class="relative h-28 rounded-xl overflow-hidden mb-2">
            <img src="${branch.image}" alt="${branch.name}" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
            <div class="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded-md text-[9px] font-bold text-white uppercase tracking-wider">
              ${branch.brand}
            </div>
          </div>
          <div class="space-y-1">
            <h4 class="text-xs font-black text-white line-clamp-1">${branch.name}</h4>
            <div class="flex items-center gap-1 text-[10px] text-slate-400">
              <svg class="w-3 h-3 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>${branch.region}</span>
            </div>
            <div class="flex items-center gap-1.5 pt-0.5">
              <span class="text-amber-400 font-bold text-[10px] flex items-center gap-0.5">★ ${branch.rating}</span>
              <span class="text-slate-500 text-[9px]">(${branch.reviews} đánh giá)</span>
            </div>
            <div class="flex items-baseline justify-between pt-2 border-t border-slate-900 mt-2">
              <div>
                <span class="text-[8px] text-slate-500 uppercase tracking-widest block leading-none">Giá từ</span>
                <span class="text-xs font-black text-brand-gold">${(branch.pricePerNight / 1000).toLocaleString('vi-VN')}k <span class="text-[9px] text-slate-400 font-normal">/đêm</span></span>
              </div>
              <button 
                data-branch-id="${branch.id}"
                class="popup-book-btn bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1"
              >
                Đặt Ngay
              </button>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker(coords, { icon: customIcon }).addTo(map);
      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'custom-leaflet-popup-frame',
        maxWidth: 280,
        minWidth: 240,
        offset: [0, -25]
      });

      // Mouseover/mouseout interactivity
      marker.on('mouseover', () => {
        if (setHoveredBranchId) setHoveredBranchId(branch.id);
      });

      marker.on('mouseout', () => {
        if (setHoveredBranchId) setHoveredBranchId(null);
      });

      markersRef.current[branch.id] = marker;
    });

  }, [branches, selectedLocation, hoveredBranchId]);

  // Clean map instance on complete unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[450px] relative z-10">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
      
      {/* Premium overlay indicators */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow-xl pointer-events-none">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-extrabold tracking-wider uppercase font-sans text-slate-100">Bản đồ vệ tinh chi nhánh</span>
      </div>

      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[10px] text-slate-300 space-y-1 shadow-xl pointer-events-none max-w-[200px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-blue-400 rounded-full" />
          <span className="font-bold">Chi nhánh GrandStay</span>
        </div>
        <p className="text-[9px] text-slate-400 font-mono leading-tight">Click vào Ghim để xem chi tiết và đặt nhanh phòng nghỉ</p>
      </div>
    </div>
  );
}
