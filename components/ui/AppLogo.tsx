"use client";
import Image from "next/image";

export default function AppLogo() {
  return (
    <Image
      src="/app-logo.svg"
      width={100}
      height={100}
      className="w-auto h-auto"
      alt="App logo"
      priority
    />
  );
}
