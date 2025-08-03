"use client";
import { useEffect, useState } from "react";
import { fetchAquariums } from "@/app/actions/aquariumListFetch";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import TankCard from "./tankCard";
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

import { useSearchParams } from "next/navigation";
import { useSettingStore } from "@/store/modalsStore";

export default function AquariumLists() {
  const t = useTranslations("MyTanks");
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { openSuccessModal } = useSettingStore();
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

  // Обработка URL параметров для показа модального окна
  useEffect(() => {
    const success = searchParams.get("success");
    const id = searchParams.get("id");
    const name = searchParams.get("name");

    if (success === "true" && id && name) {
      openSuccessModal({
        aquariumId: id,
        aquariumName: decodeURIComponent(name),
      });

      // Очищаем URL параметры
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      url.searchParams.delete("id");
      url.searchParams.delete("name");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, openSuccessModal]);

  return (
    <>
      <motion.div
        className="flex flex-wrap justify-center md:justify-end items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="flex flex-row items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-md px-3 py-2 md:w-64 md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div
        className="flex flex-wrap justify-evenly my-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {loading ? (
          <LoadingBlock translate={t("loading")} />
        ) : aquariums.length > 0 ? (
          <AnimatePresence>
            {aquariums.map((aquarium, index) => (
              <motion.div
                key={aquarium.id || index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.9 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 },
                }}
              >
                <TankCard
                  aquarium={aquarium}
                  notAssignedText={t("notAssigned")}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            className="text-2xl font-bold w-full text-center h-[50vh] flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {t("noAquariums")}
          </motion.div>
        )}
      </motion.div>
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
