"use client";
import { useEffect, useState } from "react";
import { fetchAquariums } from "@/app/actions/aquariumListFetch";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import TankCard from "./tankCard";
import { useSession } from "next-auth/react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "../ui/select";
import { Input } from "../ui/input";
import LoadingBlock from "../ui/loadingBlock";
import { useSearchParams } from "next/navigation";
import { useSettingStore } from "@/store/modalsStore";
import { EmptyState } from "../ui/empty-state";
import { Button } from "../ui/button";
import Link from "next/link";

export default function AquariumLists() {
  const t = useTranslations("MyTanks");
  const tHome = useTranslations("HomePage");
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { openSuccessModal } = useSettingStore();
  const userId = session?.user?.id;
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("nextService");
  const [aquariums, setAquariums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const sortData = (data: any[]) => {
    // Удаляем дубликаты по ID
    const uniqueData = data.filter(
      (aquarium, index, self) =>
        index === self.findIndex((a) => a.id === aquarium.id)
    );

    // Добавляем информацию о ближайшем обслуживании к каждому аквариуму
    const aquariumsWithNextService = uniqueData.map((aquarium) => {
      // Используем ту же логику, что и в tankCard.tsx
      const pendingMaintenance = aquarium.maintenance
        ?.filter((item: any) => item.status === "PENDING")
        .sort(
          (a: any, b: any) =>
            new Date(a.performedAt).getTime() -
            new Date(b.performedAt).getTime()
        );

      const upcoming =
        pendingMaintenance && pendingMaintenance.length > 0
          ? pendingMaintenance[0]
          : null;

      return {
        ...aquarium,
        nextServiceDate: upcoming ? new Date(upcoming.performedAt) : null,
        nextServiceFormatted: upcoming
          ? new Date(upcoming.performedAt).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : null,
      };
    });

    // Сортируем по дате обслуживания
    const sortedData = [...aquariumsWithNextService].sort((a, b) => {
      if (sort === "nextService") {
        // Если у обоих нет обслуживания, сортируем по имени
        if (!a.nextServiceDate && !b.nextServiceDate) {
          return a.name.localeCompare(b.name);
        }

        // Если у одного нет обслуживания, он идет в конец
        if (!a.nextServiceDate) return 1;
        if (!b.nextServiceDate) return -1;

        // Сортируем по дате обслуживания
        return a.nextServiceDate.getTime() - b.nextServiceDate.getTime();
      }

      if (sort === "name") {
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
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
      {/* Фильтры */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-48">
            <SortIcon className="mr-2 w-4 h-4" />
            <span>{sort === "nextService" ? t("sortByNextService") : t("sortByName")}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nextService">
              {t("sortByNextService")}
            </SelectItem>
            <SelectItem value="name">{t("sortByName")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Список аквариумов */}
      {loading ? (
        <LoadingBlock translate={t("loading")} />
      ) : aquariums.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {aquariums.map((aquarium, index) => (
            <motion.div
              key={aquarium.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <TankCard
                aquarium={aquarium}
                notAssignedText={t("notAssigned")}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FishIcon className="w-16 h-16" />}
          title={tHome("noAquariumsYet")}
          description={tHome("noAquariumsDescription")}
          action={
            <Button asChild size="lg" className="gap-2">
              <Link href="/myTanks/addNewTank">
                <PlusIcon className="w-5 h-5" />
                {tHome("addFirstAquarium")}
              </Link>
            </Button>
          }
        />
      )}
    </>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function SortIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M7 4v16M7 4l3 3M7 4 4 7m9-3h6l-6 6h6m-6.5 10 3.5-7 3.5 7M14 18h4" />
    </svg>
  );
}

function FishIcon(props: React.SVGProps<SVGSVGElement>) {
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

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
