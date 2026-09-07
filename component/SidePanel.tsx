"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  X,
  User,
  Heart,
  MessageCircle,
  Package,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type SidePanelProps = {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
};

export default function SidePanel({
  open,
  onClose,
  onLogout,
}: SidePanelProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      setIsAdmin(profile?.role === "admin");
    }

    checkAdmin();
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/30"
        onClick={onClose}
      />

      {/* Side panel */}
      <aside className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-sm flex-col border-l border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex h-[76px] items-center justify-between border-b border-gray-200 px-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-950">
              Account
            </h2>
            <p className="text-sm text-gray-500">
              Manage your marketplace account
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile */}
        <div className="border-b border-gray-200 p-6">
          <Link
            href="/profile"
            onClick={onClose}
            className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white">
              <User size={21} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900">
                Your Profile
              </p>
              <p className="mt-0.5 text-sm text-gray-500">
                View and manage your profile
              </p>
            </div>

            <ChevronRight
              size={18}
              className="shrink-0 text-gray-400"
            />
          </Link>
        </div>

        {/* Account options */}
        <div className="flex-1 px-4 py-4">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Account
          </p>

          <div className="space-y-1">
            <SidePanelLink
              href="/profile"
              icon={<Package size={19} />}
              title="My Listings"
              description="Manage your products, services and roommates"
              onClick={onClose}
            />

            <SidePanelLink
              href="/wishlist"
              icon={<Heart size={19} />}
              title="Wishlist"
              description="View your saved listings"
              onClick={onClose}
            />

            <SidePanelLink
              href="/chat"
              icon={<MessageCircle size={19} />}
              title="Chats"
              description="View your conversations"
              onClick={onClose}
            />

            {/* Admin only */}
            {isAdmin && (
              <SidePanelLink
                href="/admin"
                icon={<ShieldCheck size={19} />}
                title="Admin Dashboard"
                description="Manage users, listings and reports"
                onClick={onClose}
              />
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="border-t border-gray-200 p-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function SidePanelLink({
  href,
  icon,
  title,
  description,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-gray-100"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition group-hover:bg-white group-hover:text-gray-900">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">
          {title}
        </p>
        <p className="mt-0.5 truncate text-xs text-gray-500">
          {description}
        </p>
      </div>

      <ChevronRight
        size={16}
        className="shrink-0 text-gray-400"
      />
    </Link>
  );
}