import React from 'react';
import CustomerPortal from '../components/CustomerPortal';
import { UserSim } from '../types';

interface MemberPageProps {
  onBackToHome: () => void;
  currentUser: UserSim;
  onUpdateUser: (user: UserSim) => void;
}

export default function MemberPage({
  onBackToHome,
  currentUser,
  onUpdateUser
}: MemberPageProps) {
  return (
    <CustomerPortal
      onBackToHome={onBackToHome}
      currentUser={currentUser}
      onUpdateUser={onUpdateUser}
    />
  );
}
