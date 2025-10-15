import React from "react";
import { cn } from "@/lib/utils";
import { Command } from "lucide-react";

export default function SlashCommandPalette({
  open,
  items = [],
  selectedIndex = 0,
  onSelect,
  className = ""
}) {
  if (!open || !items?.length) return null;

  return (
    <div
      className={cn(
        "absolute bottom-16 left-12 z-30 w-[320px] rounded-lg border border-white/15 bg-black/70 backdrop-blur-xl shadow-xl",
        className
      )}
    >
      <div className="px-3 py-2 border-b border-white/10 text-xs text-white/70 flex items-center gap-2">
        <Command className="h-3.5 w-3.5 text-white/70" />
        Type to filter commands. Enter/Tab to choose.
      </div>
      <ul className="max-h-[260px] overflow-y-auto py-1">
        {items.map((cmd, idx) => (
          <li
            key={cmd.key}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect?.(cmd);
            }}
            className={cn(
              "px-3 py-2 cursor-pointer select-none",
              idx === selectedIndex
                ? "bg-white/10 text-white"
                : "hover:bg-white/5 text-white/90"
            )}
          >
            <div className="text-sm font-medium">
              <span className="font-mono text-white/90">{cmd.key}</span>
              <span className="ml-2 text-white/80">{cmd.title}</span>
            </div>
            {cmd.desc && (
              <div className="text-[11px] text-white/60 mt-0.5">{cmd.desc}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}