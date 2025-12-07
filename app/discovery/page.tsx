"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { fetchPublicAquariums, SortType } from "@/app/actions/discoveryFetch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingBlock from "@/components/ui/loadingBlock";
import { EmptyState } from "@/components/ui/empty-state";
import DiscoveryCard from "@/components/component/discoveryCard";
import { FiSearch, FiFilter } from "react-icons/fi";

export default function DiscoveryPage() {
  const t = useTranslations("Discovery");
  const [aquariums, setAquariums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortType>("newest");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadAquariums();
  }, [search, sort, typeFilter]);

  const loadAquariums = async (pageNum = 1) => {
    setLoading(true);
    try {
      const result = await fetchPublicAquariums({
        search,
        sort,
        type: typeFilter,
        page: pageNum,
        limit: 12,
      });
      
      if (pageNum === 1) {
        setAquariums(result.aquariums);
      } else {
        setAquariums((prev) => [...prev, ...result.aquariums]);
      }
      
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading aquariums:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadAquariums(page + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font-bebas">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          {t("subtitle")}
        </p>

        {/* Фильтры */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t("filterByType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allTypes")}</SelectItem>
              <SelectItem value="freshwater">{t("aquariumType.freshwater")}</SelectItem>
              <SelectItem value="saltwater">{t("aquariumType.saltwater")}</SelectItem>
              <SelectItem value="paludarium">{t("aquariumType.paludarium")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(value) => setSort(value as SortType)}>
            <SelectTrigger className="w-full sm:w-48">
              <FiFilter className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("sortNewest")}</SelectItem>
              <SelectItem value="rating">{t("sortRating")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Список аквариумов */}
        {loading && page === 1 ? (
          <LoadingBlock translate={t("loading")} />
        ) : aquariums.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {aquariums.map((aquarium, index) => (
                <motion.div
                  key={aquarium.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <DiscoveryCard aquarium={aquarium} />
                </motion.div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? t("loading") : t("loadMore")}
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<FiSearch className="w-16 h-16" />}
            title={t("noAquariums")}
            description={t("noAquariumsDescription")}
          />
        )}
      </motion.div>
    </div>
  );
}
