import React from 'react';
import Hero from '../components/Hero';
import SearchBox from '../components/SearchBox';
import RoomList from '../components/RoomList';
import LongTermStaysView from '../components/LongTermStaysView';
import TourPortal from '../components/TourPortal';
import BenefitsSection from '../components/BenefitsSection';
import AboutSection from '../components/AboutSection';
import { Branch, SearchQuery, Apartment, UserSim } from '../types';

interface HomePageProps {
  searchQuery: SearchQuery;
  onSearch: (query: SearchQuery) => void;
  onBook: (branch: Branch) => void;
  branches: Branch[];
  apartments: Apartment[];
  currentUser: UserSim;
  onUpdateUser: (user: UserSim) => void;
  onSearchClick: () => void;
}

export default function HomePage({
  searchQuery,
  onSearch,
  onBook,
  branches,
  apartments,
  currentUser,
  onUpdateUser,
  onSearchClick
}: HomePageProps) {
  return (
    <>
      {/* Dynamic Carousel Hero (hidden on Long-term Stays tab) */}
      {searchQuery.activeTab !== 'longTerm' && <Hero />}

      {/* Completely Redesigned Search Box Widget (hidden on Long-term Stays tab) */}
      {searchQuery.activeTab !== 'longTerm' && (
        <SearchBox onSearch={onSearch} initialQuery={searchQuery} />
      )}

      {/* Real-time Matching Rooms List, Long-Term Stays, or Tour Experiences */}
      {searchQuery.activeTab === 'longTerm' ? (
        <LongTermStaysView initialLocation={searchQuery.location} apartments={apartments} />
      ) : searchQuery.activeTab === 'experience' ? (
        <TourPortal currentUser={currentUser} onUpdateUser={onUpdateUser} initialLocation={searchQuery.location} />
      ) : (
        <RoomList searchQuery={searchQuery} onBook={onBook} branches={branches} />
      )}

      {/* Promo and Spotlight Section */}
      <BenefitsSection onSearchClick={onSearchClick} />

      {/* Elegant About GrandStay Section */}
      <AboutSection />
    </>
  );
}
