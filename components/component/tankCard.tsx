import React from "react";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";

export default function TankCard({ aquarium }: { aquarium: any }) {
  return (
    <>
      <Card className="w-[300px] rounded-t-xl mb-10 cursor-pointer shadow-lg bg-white/50 dark:bg-black/50  hover:bg-green-300/50 dark:hover:bg-green-700/20 transition-all duration-300 hover:translate-y-1">
        <Link href={"/"}>
          <CardContent className="p-0 cursor-pointer">
            <img
              src={aquarium.image}
              alt={aquarium.name}
              className="w-full rounded-t-xl h-40 object-cover"
            />
            <div className="p-4 ">
              <h3 className="font-semibold mb-2 ">{aquarium.name}</h3>
              <p className="text-sm text-muted-foreground bg-white/30 px-2 py-1 rounded-sm">
                Next Service: {aquarium.nextService}
              </p>
            </div>
          </CardContent>
        </Link>
      </Card>
    </>
  );
}
