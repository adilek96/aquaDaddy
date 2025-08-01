"use client";

import React, { SVGProps } from "react";
import { signOut } from "next-auth/react";

export default function LogOutButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => signOut()}
      className="flex items-center gap-2 w-full"
    >
      <SignOut className="h-4 w-4" />
      <span>{text}</span>
    </button>
  );
}

function SignOut(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"
      />
    </svg>
  );
}
