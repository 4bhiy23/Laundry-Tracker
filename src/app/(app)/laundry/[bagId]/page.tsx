"use client";

import { useState, useEffect } from "react";
import { type LaundryBagItem } from "@/types";
import { Icons } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ClothingCard from "@/components/ClothingCard";
import React from "react";

export default function LaundryBagDetailPage({ params }: { params: Promise<{ bagId: string }> }) {
  const router = useRouter();
  const [bag, setBag] = useState<LaundryBagItem | null>(null);
  const [loading, setLoading] = useState(true);
  const unwrappedParams = React.use(params);

  const fetchBag = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/laundry/${unwrappedParams.bagId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBag(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load laundry bag details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBag();
  }, [unwrappedParams.bagId]);

  if (loading) {
    return (
      <div className="flex justify-center mt-20 h-full bg-[#13131f]">
        <Spinner className="w-8 h-8 text-[#6366f1]" />
      </div>
    );
  }

  if (!bag) {
    return (
      <div className="h-full bg-[#13131f] flex flex-col items-center justify-center p-4">
        <h3 className="text-xl text-white">Bag not found</h3>
        <button onClick={() => router.back()} className="mt-4 text-[#6366f1] underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#13131f] pb-20">
      
      {/* Header */}
      <div className="mb-6 sticky top-0 z-10 bg-[#13131f]/90 backdrop-blur pb-2 pt-2 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[#9191b0] active:text-white p-1">
           <Icons.X className="w-6 h-6 rotate-[90deg] opacity-0" /> {/* Placeholder for alignment, I'll use simple text below */}
        </button>
        <button onClick={() => router.back()} className="absolute left-2 text-[#9191b0]">Cancel</button>
        <div className="mx-auto">
          <h1 className="text-xl font-bold text-white tracking-tight">Bag Details</h1>
        </div>
      </div>

      <div className="px-4 space-y-6">
        
        {/* Info Card */}
        <div className="bg-[#2a2a3e] p-5 rounded-2xl border border-[#3b3b5c] shadow-md">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-[#9191b0] mb-1">Status</p>
              <div className={`px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider inline-block shadow-sm`}>
                {bag.status}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#9191b0] mb-1">Items</p>
              <p className="text-xl font-bold text-white">{bag.clothes.length}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#3b3b5c]/50 flex items-center justify-center">
                <Icons.WashingMachine className="w-5 h-5 text-[#9191b0]" />
              </div>
              <div>
                <p className="text-xs text-[#9191b0]">Taken Date</p>
                <p className="text-white font-medium">{new Date(bag.takenDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#3b3b5c]/50 flex items-center justify-center">
                <Icons.Wardrobe className="w-5 h-5 text-[#9191b0]" />
              </div>
              <div>
                <p className="text-xs text-[#9191b0]">Expected Return</p>
                <p className="text-white font-medium">{new Date(bag.expectedReturnDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {bag.actualReturnDate && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Icons.Check className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-[#9191b0]">Actual Return</p>
                  <p className="text-white font-medium">{new Date(bag.actualReturnDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clothes Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Icons.Wardrobe className="w-5 h-5" /> 
              Contents
            </h2>
            {bag.status === "pending" && (
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/laundry/${bag._id}`, { method: 'PUT' });
                    if (!res.ok) throw new Error("Failed to mark returned");
                    const updatedBag = await res.json();
                    setBag(updatedBag);
                    toast.success("Bag marked as returned!");
                  } catch (e) {
                    toast.error("Failed to return bag");
                  }
                }}
                className="text-xs bg-[#6366f1] text-white px-3 py-1.5 rounded-lg active:scale-95"
              >
                Mark Returned
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {bag.clothes.map((item) => (
              <ClothingCard key={item._id} item={item} mode="wardrobe" />
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
