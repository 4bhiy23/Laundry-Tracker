"use client";

import { useState, useEffect } from "react";
import ClothingCard from "@/components/ClothingCard";
import { type ClothingItem } from "@/types";
import { Icons } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/Spinner";
import toast from "react-hot-toast";

export default function LaundryPage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchLaundry = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/clothes?status=laundry");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load laundry items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaundry();
  }, []);

  const handleReturnToWardrobe = async (id: string, name: string) => {
    try {
      setUpdatingId(id);
      
      const res = await fetch(`/api/clothes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "wardrobe" }),
      });

      if (!res.ok) throw new Error("Failed to mark as returned");

      toast.success(`${name} returned to wardrobe!`);
      // Remove from list locally for immediate feedback
      setItems((prev) => prev.filter((item) => item._id !== id));
      
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#13131f] pb-20">
      
      {/* Header */}
      <div className="mb-6 sticky top-0 z-10 bg-[#13131f]/90 backdrop-blur pb-2 pt-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">In Laundry</h1>
        <p className="text-sm text-[#9191b0] mt-0.5">
          {items.length} {items.length === 1 ? 'item' : 'items'} currently washing
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] skeleton rounded-2xl w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-20">
          <div className="w-20 h-20 rounded-full glass flex items-center justify-center mb-4 text-[#3b3b5c]">
            <Icons.Check className="w-10 h-10 opacity-50" />
          </div>
          <h3 className="text-lg font-semibold text-white">All caught up!</h3>
          <p className="text-sm text-[#9191b0] mt-2 max-w-xs">
            You don&apos;t have any clothes in the laundry right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {items.map((item) => (
            <div key={item._id} className="relative group">
              <ClothingCard
                item={item}
                mode="laundry"
              />
              {/* Return Button Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex flex-col items-center justify-center p-4">
                <button
                  onClick={() => handleReturnToWardrobe(item._id, item.name)}
                  disabled={updatingId === item._id}
                  className="w-full py-3 rounded-xl font-medium text-white shadow-lg active:scale-95 flex items-center justify-center gap-2 bg-[#1e1e2e]/90 backdrop-blur"
                >
                  {updatingId === item._id ? (
                    <Spinner className="w-5 h-5" />
                  ) : (
                    <>
                      <Icons.Wardrobe className="w-5 h-5" />
                      <span>Returned</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
