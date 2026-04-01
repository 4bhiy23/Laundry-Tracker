"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/ui/icons";
import { useState } from "react";
import AddClothingModal from "@/components/AddClothingModal";

export default function BottomNav() {
  const pathname = usePathname();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-[#1e1e2e]/90 backdrop-blur-lg border-t border-[#3b3b5c]">
        <div className="flex justify-around items-center h-16 px-6 max-w-md mx-auto relative">
          
          <Link
            href="/wardrobe"
            className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
              pathname === "/wardrobe" ? "text-[#6366f1]" : "text-[#9191b0]"
            }`}
          >
            <Icons.Wardrobe className="w-6 h-6" />
            <span className="text-[10px] font-medium">Wardrobe</span>
          </Link>

          {/* Center FAB */}
          <div className="relative -top-5 flex justify-center">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg shadow-[#6366f1]/30 transition-transform active:scale-95"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <Icons.Plus className="w-8 h-8" />
            </button>
          </div>

          <Link
            href="/laundry"
            className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
              pathname === "/laundry" ? "text-[#6366f1]" : "text-[#9191b0]"
            }`}
          >
            <Icons.WashingMachine className="w-6 h-6" />
            <span className="text-[10px] font-medium">Laundry</span>
          </Link>

        </div>
      </div>

      <AddClothingModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          // You might want to refresh data here, or let SWR/ReactQuery handle it
          // We'll rely on router.refresh() inside the modal or optimistic UI
        }}
      />
    </>
  );
}
