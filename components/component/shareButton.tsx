"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Link2, Share2 } from "lucide-react";
import {
  FaFacebookF,
  FaTelegram,
  FaVk,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";
import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";

/**
 * Кнопка «Поделиться» для статей и обитателей.
 *
 * На устройствах с системным шарингом (телефоны) сразу открывает его.
 * Иначе — выпадающий список соцсетей и «скопировать ссылку». Адрес берём из
 * window.location, поэтому компонент клиентский и работает на любой странице.
 */

type Network = {
  key: string;
  label: string;
  Icon: IconType;
  color: string;
  href: (url: string, title: string) => string;
};

const NETWORKS: Network[] = [
  {
    key: "telegram",
    label: "Telegram",
    Icon: FaTelegram,
    color: "#229ED9",
    href: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    Icon: FaWhatsapp,
    color: "#25D366",
    href: (url, title) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    key: "vk",
    label: "VK",
    Icon: FaVk,
    color: "#0077FF",
    href: (url, title) =>
      `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    Icon: FaFacebookF,
    color: "#1877F2",
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: "x",
    label: "X",
    Icon: FaXTwitter,
    color: "currentColor",
    href: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
];

export default function ShareButton({ title }: { title: string }) {
  const t = useTranslations("Wiki");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  // Адрес страницы доступен только на клиенте
  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function onShareClick() {
    const shareUrl = url || window.location.href;
    // Системный шаринг — лучший вариант на телефонах
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        // Пользователь отменил или шаринг не сработал — покажем меню
      }
    }
    setOpen((v) => !v);
  }

  async function copy() {
    const shareUrl = url || window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* буфер недоступен — молча */
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={onShareClick}
        aria-haspopup="menu"
        aria-expanded={open}
        className="tap-fast inline-flex h-9 items-center gap-2 rounded-full border border-surface-border bg-transparent px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        {t("share")}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-dropdown mt-2 w-56 overflow-hidden rounded-2xl border border-surface-border bg-surface p-1.5 shadow-lg"
        >
          {NETWORKS.map(({ key, label, Icon, color, href }) => (
            <a
              key={key}
              role="menuitem"
              href={href(url || "", title)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent/10"
            >
              <Icon className="h-4 w-4 shrink-0" style={{ color }} aria-hidden="true" />
              {label}
            </a>
          ))}

          <button
            type="button"
            role="menuitem"
            onClick={copy}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent/10"
          >
            {copied ? (
              <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            ) : (
              <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
            <span className={cn(copied && "text-success")}>
              {copied ? t("linkCopied") : t("copyLink")}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
