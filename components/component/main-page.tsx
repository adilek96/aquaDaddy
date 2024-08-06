/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/gsebiM6SPSn
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

/** Add fonts into your Next.js project:

import { Libre_Franklin } from 'next/font/google'
import { Chivo } from 'next/font/google'

libre_franklin({
  subsets: ['latin'],
  display: 'swap',
})

chivo({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { JSX, SVGProps } from "react";

export function MainPage() {
  return (
    <div className="flex justify-center items-center h-[100vh] w-[100vw]  ">
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 grid-flow-row-dense md:grid-cols-3 gap-8 p-4 sm:p-6 md:p-8  ">
          <Card className="bg-[00EBFF]  backdrop-blur-md text-secondary-foreground hover:bg-green-300/50  transition-all duration-300   hover:text-secondary-foregroundcol-span-1 sm:col-span-1 md:col-span-3  border border-muted   hover:-translate-y-1   ">
            <CardHeader>
              <CardTitle>Aquariums</CardTitle>
              <CardDescription>
                Explore and manage your aquatic ecosystems.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FishIcon className="h-6 w-6" />
                  <span className="text-2xl font-bold">12</span>
                </div>
                <Link href="#" className="text-sm underline" prefetch={false}>
                  View Aquariums
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[00EBFF]  backdrop-blur-md h-full text-secondary-foreground hover:bg-green-300/60  transition-all duration-300 col-span-1 sm:col-span-2  md:col-span-2 border border-mutted  hover:translate-y-1 hover:-translate-x-1 ">
            <CardHeader>
              <CardTitle>Wiki</CardTitle>
              <CardDescription>
                Discover and learn about aquatic life and ecosystems.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookIcon className="h-6 w-6" />
                  <span className="text-2xl font-bold">250</span>
                </div>
                <Link href="#" className="text-sm underline" prefetch={false}>
                  Explore Wiki
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[00EBFF]  backdrop-blur-md  h-full text-secondary-foreground hover:bg-green-300/60 transition-all duration-300 col-span-1 sm:col-span-1 md:col-span-1 row-start-2 sm:row-start-1 md:row-start-1 border border-mutted   hover:translate-y-1 hover:translate-x-1">
            <CardHeader>
              <CardTitle>Discovery</CardTitle>
              <CardDescription>
                Uncover new species and explore the underwater world.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CompassIcon className="h-6 w-6" />
                  <span className="text-2xl font-bold">1,000+</span>
                </div>
                <Link href="#" className="text-sm underline" prefetch={false}>
                  Start Exploring
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BookIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function CompassIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function FishIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
      <path d="M18 12v.5" />
      <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
      <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
      <path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4" />
      <path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98" />
    </svg>
  );
}

function XIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

// hover:shadow-xl hover:shadow-black shadow-md shadow-black
