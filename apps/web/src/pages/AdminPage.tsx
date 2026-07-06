import React from 'react';
import AdminPortal from '../components/AdminPortal';
import { Branch, Apartment, UserSim } from '../types';

interface AdminPageProps {
  branches: Branch[];
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;
  apartments: Apartment[];
  setApartments: React.Dispatch<React.SetStateAction<Apartment[]>>;
  currentUser: UserSim;
  onBackToHome: () => void;
}

export default function AdminPage({
  branches,
  setBranches,
  apartments,
  setApartments,
  currentUser,
  onBackToHome
}: AdminPageProps) {
  return (
    <AdminPortal
      branches={branches}
      setBranches={setBranches}
      apartments={apartments}
      setApartments={setApartments}
      currentUser={currentUser}
      onBackToHome={onBackToHome}
    />
  );
}
