"use client";
import { useEffect, useState } from "react";
import { fetchAquariums } from "@/app/actions/aquariumListFetch";
import { useTranslations } from "next-intl";
import TankCard from "./tankCard";
import { Button } from "../ui/button";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Input } from "../ui/input";
import LoadingBlock from "../ui/loadingBlock";

export default function AquariumLists() {
  const t = useTranslations("MyTanks");
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("nextService");
  const [aquariums, setAquariums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const sortData = (data: any[]) => {
    const sortedData = [...data].sort((a, b) => {
      if (sort === "nextService") {
        return (
          new Date(a.nextService).getTime() - new Date(b.nextService).getTime()
        );
      }

      if (sort === "name") {
        return a.name.localeCompare(b.name);
      }

      return 0;
    });

    setAquariums(sortedData);
  };

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchAquariums({ search, userId }).then((data) => {
      sortData(data);
      setLoading(false);
    });
  }, [search, sort, userId]);

  return (
    <>
      <div className="flex flex-wrap justify-end items-center gap-4 my-10 mr-10">
        <div className="flex flex-row items-end gap-4">
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-md px-3 py-2 md:w-64 md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
          />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="border rounded-md px-3 py-2 md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5 flex items-center justify-center">
              <SortIcon className="w-5 h-5" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nextService">
                {t("sortByNextService")}
              </SelectItem>
              <SelectItem value="name">{t("sortByName")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap justify-evenly my-10">
        {loading ? (
          <LoadingBlock translate={t("loading")} />
        ) : aquariums.length > 0 ? (
          aquariums.map((aquarium, index) => (
            <TankCard
              aquarium={aquarium}
              key={aquarium.id || index}
              notAssignedText={t("notAssigned")}
            />
          ))
        ) : (
          <div className="text-2xl font-bold w-full text-center h-[50vh] flex items-center justify-center">
            {t("noAquariums")}
          </div>
        )}
      </div>
    </>
  );
}

function SortIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M7 4v16M7 4l3 3M7 4 4 7m9-3h6l-6 6h6m-6.5 10 3.5-7 3.5 7M14 18h4"
      />
    </svg>
  );
}
