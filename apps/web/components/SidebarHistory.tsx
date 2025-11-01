"use client";

import React from "react";
import { Trash2 } from "lucide-react";

interface SidebarHistoryProps {
  history: any[];
  onSelect: (item: any) => void;
  activeId?: string | null;
  onDelete: (item: any) => void;
}

export default function SidebarHistory({
  history,
  onSelect,
  activeId,
  onDelete,
}: SidebarHistoryProps) {
  const handleDelete = (item: any) => {
    if (confirm("Are you sure you want to delete this project?")) {
      onDelete(item);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1528] border-r border-[#1d2840] w-64">
      {/* Header */}
      <div className="flex flex-col border-b border-[#1d2840] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#00A8E8] mb-2">
          Project History
        </h2>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {history.length === 0 ? (
          <p className="text-center text-xs text-gray-500 mt-4">
            No projects yet
          </p>
        ) : (
          history.map((item, idx) => (
            <div
              key={idx}
              className={`flex justify-between items-center bg-[#111a2e] hover:bg-[#162244] px-3 py-2 rounded-md cursor-pointer transition-all group ${
                activeId === item.file ? "border border-[#00A8E8]" : ""
              }`}
              onClick={() => onSelect(item)}
            >
              <span className="truncate text-sm text-gray-200 w-[80%]">
                {item.title || item.prompt?.split(" ").slice(0, 4).join(" ")}
              </span>
              <Trash2
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item);
                }}
                className="w-4 h-4 text-gray-400 hover:text-red-400 opacity-70 group-hover:opacity-100 transition-opacity"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
