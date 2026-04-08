"use client";

import { useState, useEffect } from "react";
import ClothingCard from "@/components/ClothingCard";
import { type ClothingItem } from "@/types";
import { Icons } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { type LaundryBagItem } from "@/types";
import Link from "next/link";

export default function LaundryPage() {
  const [bags, setBags] = useState<LaundryBagItem[]>([]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/laundry");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBags(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load laundry history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);
  
  
  
  
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const currentBag = bags.find((b) => b.status === "pending");

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
    const getStatusColor = (status: string) => {
    switch (status) {
      case "returned": return "text-green-400 bg-green-400/20";
      case "late": return "text-red-400 bg-red-400/20";
      default: return "text-amber-400 bg-amber-400/20";
    }
  };
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
        <Link href="/laundry/history"><button className="text-sm text-[#9191b0] mt-0.5">History</button></Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] skeleton rounded-2xl w-full" />
          ))}
        </div>
      ) : bags.length === 0 ? (
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
            </div>
        //  <div className="space-y-4 px-2">
        //   {bags.map((bag) => (
        //     <Link key={bag._id} href={`/laundry/${bag._id}`}>
        //       <div className="bg-[#2a2a3e] p-4 rounded-2xl flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform cursor-pointer border border-transparent hover:border-[#3b3b5c]">
        //         <div>
        //           <h3 className="text-white font-medium text-lg mb-1">
        //             {new Date(bag.takenDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        //           </h3>
        //           <p className="text-[#9191b0] text-sm">
        //             {bag.clothes.length} items
        //           </p>
        //         </div>
        //         <div className="flex flex-col items-end gap-2">
        //           <span className={`px-2 py-1 rounded text-xs font-semibold capitalize tracking-wide ${getStatusColor(bag.status)}`}>
        //             {bag.status}
        //           </span>
        //           <Icons.Check className="w-5 h-5 text-[#9191b0] opacity-50 rotate-[225deg]" /> {/* Roughly chevron right */}
        //         </div>
        //       </div>
        //     </Link>
          ))}
          
        </div>
      )}

      {/* Action Button for Current Bag */}
      {currentBag && items.length > 0 && (
        <div className="fixed bottom-[90px] left-0 right-0 px-4 bg-gradient-to-t from-[#13131f] via-[#13131f]/90 to-transparent pt-12 pb-4 z-20 flex justify-center pointer-events-none">
          <button 
            onClick={async () => {
              try {
                const res = await fetch(`/api/laundry/${currentBag._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'returned' }) });
                if (!res.ok) throw new Error("Failed to mark returned");
                toast.success("Laundry marked as returned!");
                // Refresh data
                fetchHistory();
                fetchLaundry();
              } catch (e) {
                toast.error("Failed to return bag");
              }
            }}
            className="w-full max-w-[300px] pointer-events-auto bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-4 rounded-3xl font-semibold shadow-xl shadow-black/20 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
          >
            <Icons.Check className="w-5 h-5" />
            Mark All as Returned
          </button>
        </div>
      )}
    </div>
  );
}
