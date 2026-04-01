"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "./ui/icons";
import { Spinner } from "./ui/Spinner";
import { ClothingItem } from "@/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface GiveLaundrySheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: ClothingItem[];
  onSuccess: () => void;
}

export default function GiveLaundrySheet({ isOpen, onClose, selectedItems, onSuccess }: GiveLaundrySheetProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Default expected return date: 3 days from now
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 3);
  const [expectedDate, setExpectedDate] = useState(defaultDate.toISOString().split('T')[0]);

  const handleSubmit = async () => {
    if (selectedItems.length === 0) return;

    try {
      setIsSubmitting(true);
      
      // Update each item in parallel
      await Promise.all(
        selectedItems.map((item) =>
          fetch(`/api/clothes/${item._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "laundry",
              expectedReturnDate: new Date(expectedDate).toISOString(),
            }),
          })
        )
      );

      toast.success(`Sent ${selectedItems.length} items to laundry!`);
      onSuccess();
      onClose();
      router.refresh();
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-[#1e1e2e] rounded-t-3xl z-50 flex flex-col shadow-2xl pb-safe border-t border-[#3b3b5c]"
          >
            {/* Handle */}
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-[#3b3b5c] rounded-full" />
            </div>

            <div className="px-6 py-4 border-b border-[#3b3b5c]/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Give to Laundry</h2>
                <p className="text-xs text-[#9191b0] leading-none mt-1">
                  {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                </p>
              </div>
              <button onClick={onClose} className="p-2 -mr-2 text-[#9191b0] active:text-white transition-colors">
                <Icons.X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Selected Items Preview Horizontal Scroll */}
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar -mx-6 px-6">
                {selectedItems.map((item) => (
                  <div key={item._id} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden snap-start shadow-sm outline outline-1 outline-[#3b3b5c]">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </div>
                ))}
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-[#9191b0] mb-2">Expected Return Date</label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full bg-[#2a2a3e] border border-[#3b3b5c] text-white rounded-xl px-4 py-3 outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
                  style={{ colorScheme: "dark" }}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-medium text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                {isSubmitting ? (
                  <Spinner className="w-6 h-6" />
                ) : (
                  <>
                    <Icons.WashingMachine className="w-5 h-5" />
                    <span>Send to Laundry</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
