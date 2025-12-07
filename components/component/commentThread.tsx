"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FiUser, FiTrash2, FiMessageCircle, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useTranslations } from "next-intl";

interface CommentThreadProps {
  comment: any;
  level?: number;
  currentUserId?: string;
  onReply: (parentId: string, text: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  maxLevel?: number;
}

export default function CommentThread({
  comment,
  level = 0,
  currentUserId,
  onReply,
  onDelete,
  maxLevel = 3,
}: CommentThreadProps) {
  const t = useTranslations("Discovery");
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const handleReply = async () => {
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      await onReply(comment.id, replyText);
      setReplyText("");
      setIsReplying(false);
    } catch (error) {
      console.error("Error replying:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await onDelete(comment.id);
  };

  const hasReplies = comment.replies && comment.replies.length > 0;
  const canReply = level < maxLevel;

  return (
    <div className={`${level > 0 ? "ml-8 mt-4" : ""}`}>
      <div className="flex gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={comment.user.image || ""} />
          <AvatarFallback>
            <FiUser />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <p className="font-medium">{comment.user.name || "Anonymous"}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
              {currentUserId === comment.userId && (
                <button
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  aria-label={t("deleteComment")}
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm whitespace-pre-wrap break-words mb-2">{comment.text}</p>
          
          {/* Кнопки действий */}
          <div className="flex items-center gap-3 mt-2">
            {canReply && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <FiMessageCircle className="w-3 h-3" />
                {t("reply")}
              </button>
            )}
            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {showReplies ? (
                  <>
                    <FiChevronUp className="w-3 h-3" />
                    {t("hideReplies")} ({comment.replies.length})
                  </>
                ) : (
                  <>
                    <FiChevronDown className="w-3 h-3" />
                    {t("showReplies")} ({comment.replies.length})
                  </>
                )}
              </button>
            )}
          </div>

          {/* Форма ответа */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t("replyPlaceholder")}
                rows={2}
                maxLength={1000}
                className="text-sm"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {replyText.length}/1000
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyText("");
                    }}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReply}
                    disabled={submitting || !replyText.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {submitting ? t("submitting") : t("reply")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Рекурсивное отображение ответов */}
      {hasReplies && showReplies && (
        <div className="mt-2">
          {comment.replies.map((reply: any) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              level={level + 1}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              maxLevel={maxLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
