"use client";

import { use, useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { fetchAquariumDetails } from "@/app/actions/discoveryFetch";
import { addOrUpdateRating, getUserRating } from "@/app/actions/ratingActions";
import { addComment, deleteComment } from "@/app/actions/commentActions";
import LoadingBlock from "@/components/ui/loadingBlock";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageSlider from "@/components/component/imageSlider";
import CommentThread from "@/components/component/commentThread";
import Link from "next/link";
import { FiStar, FiUser, FiArrowLeft, FiTrash2, FiMapPin } from "react-icons/fi";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

export default function DiscoveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("Discovery");
  const { data: session } = useSession();
  const { showToast } = useToast();
  const router = useRouter();

  const [aquarium, setAquarium] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    loadAquarium();
    loadUserRating();
  }, [id]);

  // Отдельный useEffect для polling
  useEffect(() => {
    if (loading || !aquarium) return;

    // Polling для обновления комментариев каждые 5 секунд
    const interval = setInterval(() => {
      loadCommentsOnly();
    }, 5000);

    return () => clearInterval(interval);
  }, [aquarium?.id, loading]);

  const loadAquarium = async () => {
    setLoading(true);
    try {
      const data = await fetchAquariumDetails(id);
      if (!data) {
        showToast(t("aquariumNotFound"), "error");
        router.push("/discovery");
        return;
      }
      setAquarium(data);
    } catch (error) {
      console.error("Error loading aquarium:", error);
      showToast(t("errorLoading"), "error");
    } finally {
      setLoading(false);
    }
  };

  const loadUserRating = async () => {
    if (!session?.user?.id) return;
    const rating = await getUserRating(id);
    if (rating) {
      setUserRating(rating.value);
    }
  };

  const loadCommentsOnly = async () => {
    try {
      const { fetchComments, fetchAquariumStats } = await import("@/app/actions/commentsPolling");
      const [commentsResult, statsResult] = await Promise.all([
        fetchComments(id),
        fetchAquariumStats(id),
      ]);

      if (commentsResult.success && statsResult.success && statsResult.data) {
        setAquarium((prev: any) => ({
          ...prev,
          comments: commentsResult.data,
          _count: {
            ...prev._count,
            comments: statsResult.data.commentsCount,
            ratings: statsResult.data.ratingsCount,
          },
          averageRating: statsResult.data.averageRating,
        }));
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleRating = async (value: number) => {
    if (!session?.user?.id) {
      showToast(t("signInToRate"), "warning");
      return;
    }

    if (aquarium.userId === session.user.id) {
      showToast(t("cannotRateOwn"), "error");
      return;
    }

    setSubmittingRating(true);
    try {
      const result = await addOrUpdateRating(id, value);
      if (result.success) {
        setUserRating(value);
        showToast(t("ratingSuccess"), "success");
        // Обновляем только статистику
        loadCommentsOnly();
      } else {
        showToast(result.error || t("ratingError"), "error");
      }
    } catch (error) {
      showToast(t("ratingError"), "error");
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleAddComment = async (parentId?: string, text?: string) => {
    if (!session?.user?.id) {
      showToast(t("signInToComment"), "warning");
      return;
    }

    const commentContent = text || commentText;
    if (!commentContent.trim()) {
      showToast(t("commentEmpty"), "error");
      return;
    }

    setSubmittingComment(true);
    try {
      const result = await addComment(id, commentContent, parentId);
      if (result.success && result.data) {
        // Оптимистичное обновление
        if (!parentId) {
          // Корневой комментарий
          setAquarium((prev: any) => ({
            ...prev,
            comments: [result.data, ...(prev.comments || [])],
            _count: {
              ...prev._count,
              comments: (prev._count?.comments || 0) + 1,
            },
          }));
          setCommentText("");
        } else {
          // Ответ на комментарий - перезагружаем все комментарии
          loadCommentsOnly();
        }
        showToast(t("commentSuccess"), "success");
      } else {
        showToast(result.error || t("commentError"), "error");
      }
    } catch (error) {
      showToast(t("commentError"), "error");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(t("confirmDeleteComment"))) return;

    try {
      // Оптимистичное удаление - убираем комментарий сразу
      setAquarium((prev: any) => ({
        ...prev,
        comments: prev.comments.filter((c: any) => c.id !== commentId),
        _count: {
          ...prev._count,
          comments: Math.max(0, (prev._count?.comments || 0) - 1),
        },
      }));

      const result = await deleteComment(commentId);
      if (result.success) {
        showToast(t("commentDeleted"), "success");
      } else {
        // Если ошибка, откатываем изменения
        loadCommentsOnly();
        showToast(result.error || t("deleteCommentError"), "error");
      }
    } catch (error) {
      // Если ошибка, откатываем изменения
      loadCommentsOnly();
      showToast(t("deleteCommentError"), "error");
    }
  };

  if (loading) {
    return <LoadingBlock translate={t("loading")} />;
  }

  if (!aquarium) {
    return null;
  }

  const canRate = session?.user?.id && aquarium.userId !== session.user.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Кнопка назад */}
        <Link
          href="/discovery"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <FiArrowLeft />
          {t("backToDiscovery")}
        </Link>

        {/* Заголовок и автор */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-bebas">
              {aquarium.name}
            </h1>
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={aquarium.user.image || ""} />
                <AvatarFallback>
                  <FiUser />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{aquarium.user.name || "Anonymous"}</p>
                {aquarium.user.country && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FiMapPin className="w-3 h-3" />
                    {aquarium.user.country}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Средний рейтинг */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <FiStar className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                <span className="text-3xl font-bold">
                  {aquarium.averageRating > 0
                    ? aquarium.averageRating.toFixed(1)
                    : "—"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {aquarium._count.ratings} {t("ratings")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Галерея */}
        {aquarium.images && aquarium.images.length > 0 && (
          <div className="mb-8">
            <ImageSlider images={aquarium.images} />
          </div>
        )}

        {/* Описание */}
        {aquarium.description && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("description")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {aquarium.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Спецификации */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("specifications")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t("typeLabel")}</p>
                <p className="font-medium">{t(`aquariumType.${aquarium.type.toLowerCase()}`)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("volume")}</p>
                <p className="font-medium">{aquarium.volumeLiters} L</p>
              </div>
              {aquarium.startDate && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("startDate")}</p>
                  <p className="font-medium">
                    {new Date(aquarium.startDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Обитатели */}
        {aquarium.inhabitants && aquarium.inhabitants.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("inhabitants")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {aquarium.inhabitants.map((inhabitant: any) => (
                  <li key={inhabitant.id} className="flex justify-between">
                    <span>{inhabitant.species}</span>
                    <span className="text-muted-foreground">×{inhabitant.count}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Оценка */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("rateThisAquarium")}</CardTitle>
          </CardHeader>
          <CardContent>
            {canRate ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleRating(value)}
                      onMouseEnter={() => setHoveredRating(value)}
                      onMouseLeave={() => setHoveredRating(null)}
                      disabled={submittingRating}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        (hoveredRating !== null ? value <= hoveredRating : value <= (userRating || 0))
                          ? "bg-yellow-500 border-yellow-500 text-white"
                          : "border-muted hover:border-yellow-500"
                      } disabled:opacity-50`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                {userRating && (
                  <p className="text-sm text-muted-foreground">
                    {t("yourRating")}: {userRating}/10
                  </p>
                )}
              </div>
            ) : session?.user?.id ? (
              <p className="text-center text-muted-foreground">{t("cannotRateOwn")}</p>
            ) : (
              <p className="text-center text-muted-foreground">
                <Link href="/signIn" className="underline">
                  {t("signInToRate")}
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Комментарии */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("comments")} ({aquarium._count.comments})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Форма добавления комментария */}
            {session?.user?.id ? (
              <div className="mb-6">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t("commentPlaceholder")}
                  rows={3}
                  maxLength={1000}
                  className="mb-2"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {commentText.length}/1000
                  </span>
                  <Button
                    onClick={() => handleAddComment()}
                    disabled={submittingComment || !commentText.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {submittingComment ? t("submitting") : t("addComment")}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground mb-6">
                <Link href="/signIn" className="underline">
                  {t("signInToComment")}
                </Link>
              </p>
            )}

            {/* Список комментариев */}
            <div className="space-y-4">
              {aquarium.comments && aquarium.comments.length > 0 ? (
                aquarium.comments.map((comment: any) => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    currentUserId={session?.user?.id}
                    onReply={handleAddComment}
                    onDelete={handleDeleteComment}
                    maxLevel={3}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t("noComments")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
