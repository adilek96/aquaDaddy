import React from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Link from "next/link";

export default function CardFilling({
  title,
  description,
  icon,
  link,
  count,
  linkText,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  count: number;
  linkText: string;
}) {
  return (
    <>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-2xl font-bold">{count}</span>
          </div>
          <Link href={link} className="text-sm underline" prefetch={false}>
            {linkText}
          </Link>
        </div>
      </CardContent>
    </>
  );
}
