"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { fetchPublicAquariums, SortType } from "@/app/actions/discoveryFetch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CardSkeletonGrid } from "@/components/ui/card-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import DiscoveryCard from "@/components/component/discoveryCard";

const PAGE_SIZE = 12;

export default function DiscoveryPage() {
  const t = useTranslations("Discovery");
  const [aquariums, setAquariums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Отдельный флаг для подгрузки: раньше «Load More» поднимал общий loading,
  // и условие (loading && page === 1) прятало уже показанный список —
  // на экране вместо карточек появлялась заглушка «Loading...»
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortType>("newest");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Один запрос на паузу в наборе вместо запроса на каждую букву
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchPublicAquariums({
        search: debouncedSearch,
        sort,
        type: typeFilter,
        page: 1,
        limit: PAGE_SIZE,
      });
      setAquariums(result.aquariums);
      setHasMore(result.hasMore);
      setPage(1);
    } catch (error) {
      console.error("Error loading aquariums:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sort, typeFilter]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const result = await fetchPublicAquariums({
        search: debouncedSearch,
        sort,
        type: typeFilter,
        page: nextPage,
        limit: PAGE_SIZE,
      });
      setAquariums((prev) => [...prev, ...result.aquariums]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading aquariums:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="app-container py-6 sm:py-10">
      <header className="mb-6 animate-fade-in-up sm:mb-8">
        <h1 className="mb-2">{t("title")}</h1>
        <p className="measure text-sm text-muted-foreground sm:text-base">
          {t("subtitle")}
        </p>
      </header>

      {/* Фильтры: столбик на телефоне, два селекта в ряд от sm,
          вся панель в одну строку от lg */}
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 lg:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="discovery-search" className="sr-only">
            {t("searchPlaceholder")}
          </label>
          <Input
            id="discovery-search"
            type="search"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:shrink-0">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger
              className="h-11 w-full lg:w-48"
              aria-label={t("filterByType")}
            >
              <SelectValue placeholder={t("filterByType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allTypes")}</SelectItem>
              <SelectItem value="freshwater">
                {t("aquariumType.freshwater")}
              </SelectItem>
              <SelectItem value="saltwater">
                {t("aquariumType.saltwater")}
              </SelectItem>
              <SelectItem value="paludarium">
                {t("aquariumType.paludarium")}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(value) => setSort(value as SortType)}
          >
            <SelectTrigger className="h-11 w-full lg:w-48" aria-label={t("sortBy")}>
              <SlidersHorizontal
                className="mr-2 h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("sortNewest")}</SelectItem>
              <SelectItem value="rating">{t("sortRating")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <CardSkeletonGrid count={PAGE_SIZE} label={t("loading")} />
      ) : aquariums.length > 0 ? (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
            {aquariums.map((aquarium, index) => (
              <li
                key={aquarium.id}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${Math.min((index % PAGE_SIZE) * 40, 320)}ms`,
                }}
              >
                <DiscoveryCard aquarium={aquarium} />
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="mt-8 flex justify-center sm:mt-10">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                size="lg"
                variant="outline"
              >
                {loadingMore && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                {loadingMore ? t("loading") : t("loadMore")}
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={<Search className="h-10 w-10" />}
          title={t("noAquariums")}
          description={t("noAquariumsDescription")}
        />
      )}
    </div>
  );
}
