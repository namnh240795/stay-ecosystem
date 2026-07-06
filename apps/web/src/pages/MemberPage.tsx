import React from 'react';
import CustomerPortal from '../components/CustomerPortal';
import { Branch, UserSim } from '../types';

interface MemberPageProps {
  bookedList: Branch[];
  onBackToHome: () => void;
  currentUser: UserSim;
  onUpdateUser: (user: UserSim) => void;
  onUpdateBookedList: React.Dispatch<React.SetStateAction<Branch[]>>;
}

export default function MemberPage({
  bookedList,
  onBackToHome,
  currentUser,
  onUpdateUser,
  onUpdateBookedList
}: MemberPageProps) {
  return (
    <CustomerPortal
      bookedList={bookedList}
      onBackToHome={onBackToHome}
      currentUser={currentUser}
      onUpdateUser={onUpdateUser}
      onUpdateBookedList={onUpdateBookedList}
    />
  );
}
