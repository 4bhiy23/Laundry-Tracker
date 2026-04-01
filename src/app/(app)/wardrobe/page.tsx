"use client";

import { useState, useEffect } from "react";
import ClothingCard from "@/components/ClothingCard";
import { type ClothingItem } from "@/types";
import { Icons } from "@/components/ui/icons";
import GiveLaundrySheet from "@/components/GiveLaundrySheet";
import toast from "react-hot-toast";

export default function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Bottom sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchClothes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/clothes?status=wardrobe");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load wardrobe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClothes();
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        if (newSet.size === 0) setIsSelectMode(false);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCardClick = (id: string) => {
    if (isSelectMode) {
      toggleSelection(id);
    } else {
      // If not in select mode, long press or "Select" button triggers it.
      // But let's also allow tapping any card to enter select mode if none are selected
      setIsSelectMode(true);
      toggleSelection(id);
    }
  };

  const cancelSelection = () => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent card click
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`/api/clothes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      toast.success("Item deleted");
      setItems((prev) => prev.filter((item) => item._id !== id));
      
      // Auto-cleanup selection if it was selected
      if (selectedIds.has(id)) {
        toggleSelection(id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete item");
    }
  };

  const selectedItems = items.filter((item) => selectedIds.has(item._id));

  return (
    <div className="flex flex-col h-full bg-[#13131f] pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-10 bg-[#13131f]/90 backdrop-blur pb-2 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Your Wardrobe</h1>
          <p className="text-sm text-[#9191b0] mt-0.5">
            {items.length} {items.length === 1 ? 'item' : 'items'} available
          </p>
        </div>
        
        {isSelectMode ? (
          <button 
            onClick={cancelSelection}
            className="text-sm font-medium text-[#9191b0] active:text-white px-3 py-1.5"
          >
            Cancel
          </button>
        ) : (
          <button 
            onClick={() => setIsSelectMode(true)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-[#9191b0] active:scale-95 transition-transform"
          >
            <Icons.Check className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[3/4] skeleton rounded-2xl w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-20">
          <div className="w-20 h-20 rounded-full glass flex items-center justify-center mb-4 text-[#3b3b5c]">
            <Icons.Wardrobe className="w-10 h-10 opacity-50" />
          </div>
          <h3 className="text-lg font-semibold text-white">Your wardrobe is empty</h3>
          <p className="text-sm text-[#9191b0] mt-2 max-w-xs">
            Tap the + button below to start adding clothes to your digital wardrobe.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {items.map((item) => (
            <ClothingCard
              key={item._id}
              item={item}
              selectable={isSelectMode}
              selected={selectedIds.has(item._id)}
              onClick={() => handleCardClick(item._id)}
              onDelete={(e) => handleDelete(e, item._id)}
            />
          ))}
        </div>
      )}

      {/* Floating Action Bar for "Give to Laundry" */}
      {isSelectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-24 left-0 right-0 z-40 px-6 flex justify-center slide-up pointer-events-none">
          <div className="max-w-md w-full pointer-events-auto">
            <button
              onClick={() => setIsSheetOpen(true)}
              className="w-full py-4 rounded-xl font-medium text-white shadow-xl shadow-[#6366f1]/20 glass border-[#6366f1]/30 flex items-center justify-center gap-3 backdrop-blur-xl"
              style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(139, 92, 246, 0.9))" }}
            >
              <Icons.WashingMachine className="w-5 h-5" />
              <span>Give {selectedIds.size} {selectedIds.size === 1 ? 'Item' : 'Items'} to Laundry</span>
            </button>
          </div>
        </div>
      )}

      <GiveLaundrySheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        selectedItems={selectedItems}
        onSuccess={() => {
          cancelSelection();
          fetchClothes();
        }}
      />
    </div>
  );
}
