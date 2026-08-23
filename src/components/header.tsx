"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  rightContent?: React.ReactNode;
}

export function Header({
  title,
  subtitle,
  onSearch,
  searchPlaceholder = "Search...",
  showSearch = false,
  rightContent,
}: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {rightContent}
      </div>

      {showSearch && onSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="input-base pl-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <kbd className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              Ctrl K
            </kbd>
          </div>
        </div>
      )}
    </motion.header>
  );
}