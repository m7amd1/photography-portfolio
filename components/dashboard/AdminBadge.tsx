"use client";

export function AdminBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 " +
        className
      }
    >
      Admin
    </span>
  );
}

export function AdminOnly({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  if (!isAdmin) return null;
  return <>{children}</>;
}
