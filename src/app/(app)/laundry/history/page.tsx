"use client";

import { useState, useEffect } from "react";
import { type LaundryBagItem } from "@/types";
import { Icons } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LaundryHistoryPage() {
  const router = useRouter();
  const [bags, setBags] = useState<LaundryBagItem[]>([]);
  const [loading, setLoading] = useState(true);

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


  return (
    <div className="flex flex-col h-full bg-[#13131f] pb-20">
      
      {/* Header */}
      <div className="mb-6 sticky top-0 z-10 bg-[#13131f]/90 backdrop-blur pb-2 pt-2 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[#9191b0] active:text-white p-1">
          <Icons.X className="w-6 h-6 rotate-[-90deg]" /> {/* Roughly back arrow */}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Laundry History</h1>
          <p className="text-sm text-[#9191b0] mt-0.5">
            {bags.length} {bags.length === 1 ? 'bag' : 'bags'} in records
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center mt-20">
          <Spinner className="w-8 h-8 text-[#6366f1]" />
        </div>
      ) : bags.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-20">
          <div className="w-20 h-20 rounded-full glass flex items-center justify-center mb-4 text-[#3b3b5c]">
            <Icons.WashingMachine className="w-10 h-10 opacity-50" />
          </div>
          <h3 className="text-lg font-semibold text-white">No history yet</h3>
          <p className="text-sm text-[#9191b0] mt-2 max-w-xs">
            Send clothes to laundry to see your history here.
          </p>
        </div>
      ) : (
        <div className="space-y-4 px-2">
          {bags.map((bag) => (
            <Link key={bag._id} href={`/laundry/${bag._id}`}>
              <div className="bg-[#2a2a3e] p-4 rounded-2xl flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform cursor-pointer border border-transparent hover:border-[#3b3b5c]">
                <div>
                  <h3 className="text-white font-medium text-lg mb-1">
                    {new Date(bag.takenDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-[#9191b0] text-sm">
                    {bag.clothes.length} items
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold capitalize tracking-wide`}>
                    {bag.status}
                  </span>
                  <Icons.Check className="w-5 h-5 text-[#9191b0] opacity-50 rotate-[225deg]" /> {/* Roughly chevron right */}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
