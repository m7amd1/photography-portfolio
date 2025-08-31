import React from "react";
import { Button } from "@/components/ui/button";
import { AdminBadge } from "@/components/dashboard/AdminBadge";

interface DashboardHeaderProps {
  title?: string;
  description?: string;
  isAdmin?: boolean;
  showAddForm?: boolean;
  onToggleAddForm?: () => void;
  onLogout?: () => void;
}

export function DashboardHeader({
  title = "Photo Management",
  description = "Manage your photography portfolio",
  isAdmin,
  showAddForm,
  onToggleAddForm,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            {title}
          </h1>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {isAdmin && <AdminBadge />}
          {onToggleAddForm && (
            <Button
              onClick={onToggleAddForm}
              className="bg-gray-900 hover:bg-gray-800 cursor-pointer"
            >
              {showAddForm ? "Cancel" : "Add Media"}
            </Button>
          )}
          {onLogout && (
            <Button
              variant="outline"
              onClick={onLogout}
              className="cursor-pointer"
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
