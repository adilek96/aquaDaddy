"use client";
import { logOutAction } from "@/app/actions/logOutAction";
import Link from "next/link";
import React from "react";

export default function LogOutButton() {
  return (
    <Link
      href="/"
      onClick={() => logOutAction()}
      className="flex items-center gap-2"
      prefetch={false}
    >
      <div className="h-4 w-4" />
      <span>Log out</span>
    </Link>
  );
}
