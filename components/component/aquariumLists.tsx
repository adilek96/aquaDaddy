"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Search, ArrowDownUp, Fish, Plus } from "lucide-react";
import { fetchAquariums } from "@/app/actions/aquariumListFetch";
import TankCard from "./tankCard";
import { Select, SelectTrigger, SelectContent, SelectItem } from "../ui/select";
import { Input } from "../ui/input";
import { CardSkeletonGrid } from "../ui/card-skeleton";
import { useSettingStore } from "@/store/modalsStore";
import { EmptyState } from "../ui/empty-state";
import { Button } from "../ui/button";

type SortKey = "nextService" | "name";

/** Ближайшее незакрытое обслуживание аквариума, null — не запланировано */
function nextServiceDate(aquarium: any): Date | null {
  const pending = aquarium.maintenance
    ?.filter((item: any) => item.status === "PENDING")
    .sort(
      (a: any, b: any) =>
        new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime()
    );
  return pending?.length ? new Date(pending[0].performedAt) : null;
}

export default function AquariumLists() {
  const t = useTranslations("MyTanks");
  const tHome = useTranslations("HomePage");
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const openSuccessModal = useSettingStore((s) => s.openSuccessModal);
  const userId = session?.user?.id;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("nextService");
  const [aquariums, setAquariums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Поиск ходил на сервер на каждое нажатие клавиши. Дебаунс в 300 мс
  // оставляет один запрос на паузу в наборе.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (!userId) {
      setAquariums([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchAquariums({ search: debouncedSearch })
      .then((data) => {
        // Ответ на устаревший запрос не должен перетирать свежий список
        if (cancelled) return;
        setAquariums(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, userId]);

  // Сортировка — чисто клиентская операция, раньше её смена вызывала
  // повторный запрос за теми же данными.
  const sorted = useMemo(() => {
    const unique = aquariums.filter(
      (a, i, self) => i === self.findIndex((x) => x.id === a.id)
    );
    const withDate = unique.map((a) => ({ ...a, _next: nextServiceDate(a) }));

    return withDate.sort((a, b) => {
      if (sort === "name") {
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      }
      // Аквариумы без запланированного обслуживания уходят в конец
      if (!a._next && !b._next) return a.name.localeCompare(b.name);
      if (!a._next) return 1;
      if (!b._next) return -1;
      return a._next.getTime() - b._next.getTime();
    });
  }, [aquariums, sort]);

  // Возврат со страницы создания: показать модалку успеха и очистить URL
  useEffect(() => {
    const success = searchParams.get("success");
    const id = searchParams.get("id");
    const name = searchParams.get("name");
    if (success !== "true" || !id || !name) return;

    openSuccessModal({ aquariumId: id, aquariumName: decodeURIComponent(name) });

    const url = new URL(window.location.href);
    url.searchParams.delete("success");
    url.searchParams.delete("id");
    url.searchParams.delete("name");
    window.history.replaceState({}, "", url.toString());
  }, [searchParams, openSuccessModal]);

  return (
    <>
      {/* Фильтры: на телефоне в столбик во всю ширину, от sm — в строку */}
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="aquarium-search" className="sr-only">
            {t("searchPlaceholder")}
          </label>
          <Input
            id="aquarium-search"
            type="search"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="h-11 w-full sm:w-56" aria-label={t("sort")}>
            <ArrowDownUp
              className="mr-2 h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="truncate">
              {sort === "nextService" ? t("sortByNextService") : t("sortByName")}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nextService">{t("sortByNextService")}</SelectItem>
            <SelectItem value="name">{t("sortByName")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <CardSkeletonGrid label={t("loading")} />
      ) : sorted.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
          {sorted.map((aquarium, index) => (
            <li
              key={aquarium.id ?? index}
              className="animate-fade-in-up"
              // Ступенчатое появление: 40 мс на карточку, но не дольше 320 мс,
              // иначе нижние карточки заметно «отстают»
              style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
            >
              <TankCard aquarium={aquarium} notAssignedText={t("notAssigned")} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<Fish className="h-10 w-10" />}
          title={tHome("noAquariumsYet")}
          description={tHome("noAquariumsDescription")}
          action={
            <Button asChild size="lg">
              <Link href="/myTanks/addNewTank">
                <Plus className="h-5 w-5" aria-hidden="true" />
                {tHome("addFirstAquarium")}
              </Link>
            </Button>
          }
        />
      )}
    </>
  );
}
