"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MESSENGERS, SITE_PHONE_TEL } from "@/lib/contacts";
import {
  MESSENGER_FAB_OPEN_EVENT,
  type MessengerFabOpenDetail,
} from "@/lib/messenger-fab";
import {
  trackContactMax,
  trackContactPhone,
  trackContactTelegram,
} from "@/lib/analytics/metrika";

const FAB_CONFIG = { gapY: 62, fanX: 0, baseY: 72, stagger: 50 };

type FabItem = {
  id: "phone" | "max" | "telegram";
  label: string;
  href: string;
  external: boolean;
  color: string;
  iconSrc?: string;
};

const FAB_ITEMS: FabItem[] = [
  {
    id: "max",
    label: "MAX",
    href: MESSENGERS.find((m) => m.id === "max")!.href,
    external: true,
    color: "transparent",
    iconSrc: "/images/maxxx.svg",
  },
  {
    id: "telegram",
    label: "Telegram",
    href: MESSENGERS.find((m) => m.id === "telegram")!.href,
    external: true,
    color: "#2AABEE",
  },
  {
    id: "phone",
    label: "Позвонить",
    href: SITE_PHONE_TEL,
    external: false,
    color: "#4a5335",
  },
];

function fabPositions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: -(i * FAB_CONFIG.fanX),
    y: -(FAB_CONFIG.baseY + i * FAB_CONFIG.gapY),
  }));
}

function IconChat() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTelegram() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38Z" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Expandable messenger FAB — same interaction model as Шародувы FabContacts:
 * real <button> toggle, channel items are native <a href>, closed items
 * use pointer-events:none.
 */
export function MessengerFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const justToggled = useRef(false);

  const applyFab = useCallback((isOpen: boolean) => {
    const items = itemRefs.current.filter(Boolean) as HTMLAnchorElement[];
    const pos = fabPositions(items.length);
    const n = items.length;
    items.forEach((el, i) => {
      const order = isOpen ? i : n - 1 - i;
      el.style.transitionDelay = `${order * FAB_CONFIG.stagger}ms`;
      el.style.setProperty("--x", `${isOpen ? pos[i].x : 0}px`);
      el.style.setProperty("--y", `${isOpen ? pos[i].y : 0}px`);
      el.style.setProperty("--s", isOpen ? "1" : "0");
      el.style.opacity = isOpen ? "1" : "0";
      el.style.pointerEvents = isOpen ? "auto" : "none";
    });
  }, []);

  useEffect(() => {
    applyFab(open);
  }, [open, applyFab]);

  useEffect(() => {
    const handleOpenRequest = (_event: Event) => {
      justToggled.current = true;
      window.setTimeout(() => {
        justToggled.current = false;
      }, 0);
      setOpen(true);
    };
    window.addEventListener(MESSENGER_FAB_OPEN_EVENT, handleOpenRequest);
    return () =>
      window.removeEventListener(MESSENGER_FAB_OPEN_EVENT, handleOpenRequest);
  }, []);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (justToggled.current) return;
      if (!open) return;
      if (fabRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (pathname === "/messengers") return null;

  const toggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    justToggled.current = true;
    window.setTimeout(() => {
      justToggled.current = false;
    }, 0);
    setOpen((value) => !value);
  };

  return (
    <>
      <div
        className={`messenger-fab-scrim${open ? " show" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <div
        ref={fabRef}
        id="messenger-fab-root"
        className={`messenger-fab${open ? " open" : ""}`}
      >
        {FAB_ITEMS.map((item, index) => (
          <a
            key={item.id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            href={item.href}
            {...(item.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            aria-label={item.label}
            className={`messenger-fab-item${item.iconSrc ? " messenger-fab-item--brand" : ""}`}
            style={{ ["--c" as string]: item.color }}
            onClick={() => {
              if (item.id === "phone") trackContactPhone();
              else if (item.id === "max") trackContactMax();
              else if (item.id === "telegram") trackContactTelegram();
              setOpen(false);
            }}
          >
            <span className="messenger-fab-tip">{item.label}</span>
            <span className="messenger-fab-icon">
              {item.iconSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.iconSrc} alt="" width={48} height={48} />
              ) : item.id === "telegram" ? (
                <IconTelegram />
              ) : (
                <IconPhone />
              )}
            </span>
          </a>
        ))}

        <button
          type="button"
          id="messenger-fab-toggle"
          aria-expanded={open}
          aria-label={open ? "Закрыть мессенджеры" : "Написать в мессенджер"}
          className="messenger-fab-main"
          onClick={toggle}
        >
          <span className="messenger-fab-main-label" aria-hidden={!open ? undefined : true}>
            <IconChat />
          </span>
          <span className="messenger-fab-main-close" aria-hidden={open ? undefined : true}>
            <IconClose />
          </span>
        </button>
      </div>
    </>
  );
}
