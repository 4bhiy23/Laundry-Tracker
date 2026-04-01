"use client";

import Image from "next/image";
import { type ClothingItem } from "@/types";
import { Icons } from "./ui/icons";
import { motion } from "framer-motion";

interface ClothingCardProps {
  item: ClothingItem;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  mode?: "wardrobe" | "laundry";
}

export default function ClothingCard({ 
  item, 
  selectable = false, 
  selected = false, 
  onSelect,
  onClick,
  onDelete,
  mode = "wardrobe"
}: ClothingCardProps) {
  
  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect();
    } else if (onClick) {
      onClick();
    }
  };

  const isLaundry = item.status === "laundry";
  const expectedDateStr = item.expectedReturnDate 
    ? new Date(item.expectedReturnDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null;

  return (
    <motion.div 
      layoutId={`card-${item._id}`}
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      className={`relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group bg-[#2a2a3e] border-2 transition-colors ${
        selected ? "border-[#6366f1]" : "border-transparent"
      }`}
    >
      {/* Image */}
      <div className="absolute inset-0">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* Select indicator */}
      {selectable && (
        <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors z-10 ${
          selected ? "bg-[#6366f1] border-[#6366f1]" : "bg-black/20 border-white/50 backdrop-blur-sm"
        }`}>
          {selected && <Icons.Check className="w-4 h-4 text-white" />}
        </div>
      )}

      {/* Delete button indicator (only when not selecting and in wardrobe) */}
      {!selectable && mode === "wardrobe" && onDelete && (
        <button 
          onClick={onDelete}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 border border-white/20 backdrop-blur-sm flex items-center justify-center transition-colors z-20 hover:bg-black/60 active:scale-90 text-white/90 hover:text-red-400"
        >
          <Icons.Trash className="w-4 h-4" />
        </button>
      )}

      {/* Laundry Badge */}
      {mode === "wardrobe" && isLaundry && (
        <div className="absolute top-3 left-3 bg-[#f59e0b]/90 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider shadow-sm flex items-center gap-1 z-10">
          <Icons.WashingMachine className="w-3 h-3" />
          <span>In Laundry</span>
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 z-10 flex flex-col justify-end">
        <h3 className="text-white font-medium text-sm sm:text-base leading-tight w-full truncate shadow-black">
          {item.name}
        </h3>
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-[#e2e2f0]/80 text-[10px] sm:text-xs capitalize tracking-wide font-medium">
            {item.category}
          </span>
          
          {mode === "laundry" && expectedDateStr && (
            <span className="text-[#f59e0b] font-semibold text-[10px] bg-[#f59e0b]/20 px-1.5 py-0.5 rounded backdrop-blur-sm">
              Due: {expectedDateStr}
            </span>
          )}
        </div>
      </div>
      
      {/* Selected Overlay */}
      {selected && (
        <div className="absolute inset-0 bg-[#6366f1]/20 pointer-events-none" />
      )}
    </motion.div>
  );
}
