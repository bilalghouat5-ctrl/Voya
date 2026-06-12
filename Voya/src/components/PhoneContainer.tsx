/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface PhoneContainerProps {
  children: React.ReactNode;
  unreadNotifications?: number;
  onOpenNotifications?: () => void;
}

export default function PhoneContainer({ children }: PhoneContainerProps) {
  return (
    <div className="h-screen max-h-screen bg-[#070708] text-white flex justify-center items-stretch antialiased selection:bg-zinc-800 overflow-hidden">
      <div className="w-full max-w-md bg-black relative flex flex-col h-screen max-h-screen overflow-hidden shadow-2xl">
        <div className="flex-1 w-full bg-black relative flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
