"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import { get } from "@/lib/api";

type NotificationType = "alert" | "success" | "info";

interface Notification {
  id: number;
  title: string;
  description: string;
  type: NotificationType;
  icon: string;
  severity: string;
}

const TYPE_STYLES: Record<
  NotificationType,
  { accent: string; dot: string; iconBg: string; iconColor: string; borderColor: string }
> = {
  alert: {
    accent: "bg-tertiary",
    dot: "bg-tertiary",
    iconBg: "bg-tertiary-container/10",
    iconColor: "text-tertiary",
    borderColor: "border-tertiary/20",
  },
  success: {
    accent: "bg-primary",
    dot: "bg-primary",
    iconBg: "bg-primary-container/10",
    iconColor: "text-primary",
    borderColor: "border-primary/20",
  },
  info: {
    accent: "bg-secondary",
    dot: "bg-secondary",
    iconBg: "bg-secondary-container/30",
    iconColor: "text-secondary",
    borderColor: "border-secondary/20",
  },
};

function NotificationItem({ notification }: { notification: Notification }) {
  const style = TYPE_STYLES[notification.type];

  return (
    <div className="app-card rounded-xl p-4 md:p-5 flex items-start gap-4 cursor-pointer relative overflow-hidden group transition-all"
    >
      {/* Hover accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />

      {/* Status dot */}
      <div className="mt-1 flex-shrink-0">
        <span className={`w-2 h-2 rounded-full inline-block ${style.dot}`}
          style={{ boxShadow: `0 0 8px var(--color-${notification.type === "alert" ? "warning" : notification.type === "success" ? "success" : "secondary"})` }}
        />
      </div>

      {/* Icon */}
      <div className={`flex-shrink-0 p-2 rounded-lg ${style.iconBg} ${style.iconColor} border ${style.borderColor}`}>
        <span className="material-symbols-outlined">{notification.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h4 className="text-body-md font-semibold text-on-surface truncate">
            {notification.title}
          </h4>
        </div>
        <p className="text-body-md text-on-surface-variant text-sm line-clamp-2">
          {notification.description}
        </p>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    get<{ notifications: Notification[] }>("/api/notifications")
      .then((data) => setNotifications(data.notifications))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell>
      <div className="page-content max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-8 mt-4">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-display-lg-mobile md:text-display-lg text-on-surface mb-2">
              Notifications
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Stay updated on your academic progress and important university events.
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant py-12">
            <div className="h-4 w-4 animate-pulse rounded-full bg-primary" />
            Loading notifications...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="py-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-3 block">error_outline</span>
            <p className="text-body-md">Failed to load notifications: {error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && notifications.length === 0 && (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-container mb-4">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant">notifications_none</span>
            </div>
            <h3 className="font-[family-name:var(--font-heading)] text-headline-sm text-on-surface mb-2">
              You have no notifications right now
            </h3>
            <p className="text-body-md text-on-surface-variant max-w-sm mx-auto">
              When there are important updates about your academic standing, they will appear here.
            </p>
          </div>
        )}

        {/* Notifications list */}
        {!loading && !error && notifications.length > 0 && (
          <section className="mb-12">
            <div className="flex flex-col gap-3">
              {notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} />
              ))}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}
