"use client";

import NameModal from "./components/modals/nameModal";
import UserProvider from "./UserProvider";

/** Firebase auth and the name modal. Loaded only outside /admin. */
export default function GameBoot({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <NameModal />
      {children}
    </UserProvider>
  );
}
