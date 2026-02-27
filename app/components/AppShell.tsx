"use client";

import Navbar from "./Navbar";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Navbar />
    </>
  );
}
