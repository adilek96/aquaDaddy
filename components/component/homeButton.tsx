"use client";
import React, { SVGProps } from "react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomeButton() {
  const pathname = usePathname().substring(4);
  const router = useRouter();

  if (pathname.length > 0 && pathname.includes("/")) {
    return (
      <Button
        onClick={() => router.back()}
        variant="ghost"
        size="icon"
        className={`rounded-md ${pathname.length === 0 ? "hidden" : "flex"} `}
      >
        <ArrowIcon className="w-6 h-6 text-muted-foreground " />
        <span className="sr-only">Back</span>
      </Button>
    );
  }
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-md ${pathname.length === 0 ? "hidden" : "flex"} `}
      >
        <Link
          href={"/"}
          className="flex h-full w-full justify-center items-center"
        >
          <HomeIcon className="w-6 h-6 text-muted-foreground " />
          <span className="sr-only">Home</span>
        </Link>
      </Button>
    </>
  );
}

function HomeIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 25"
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
        d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
      />
    </svg>
  );
}

function ArrowIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
        d="M16 16.881V7.119a1 1 0 0 0-1.636-.772l-5.927 4.881a1 1 0 0 0 0 1.544l5.927 4.88a1 1 0 0 0 1.636-.77Z"
      />
    </svg>
  );
}
