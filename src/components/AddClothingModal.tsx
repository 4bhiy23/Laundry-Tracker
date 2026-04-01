"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "./ui/icons";
import { Spinner } from "./ui/Spinner";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AddClothingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  "tops", "bottoms", "dresses", "outerwear", "innerwear", "accessories", "other"
];

export default function AddClothingModal({ isOpen, onClose, onSuccess }: AddClothingModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "tops",
    color: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({ name: "", category: "tops", color: "" });
    setImagePreview(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetForm, 300); // Wait for modal animation
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      toast.error("Please add an image");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 1. Upload Image to Cloudinary via our API
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: imagePreview }),
      });
      
      if (!uploadRes.ok) throw new Error("Image upload failed");
      const { url, publicId } = await uploadRes.json();

      // 2. Save Item to Database
      const dbRes = await fetch("/api/clothes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          color: formData.color,
          imageUrl: url,
          imagePublicId: publicId,
        }),
      });

      if (!dbRes.ok) throw new Error("Failed to save clothing item");

      toast.success("Added to wardrobe!");
      onSuccess();
      handleClose();
      router.refresh();
      
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center"
          />
          
          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 sm:bottom-auto w-full max-w-md bg-[#1e1e2e] rounded-t-3xl sm:rounded-2xl z-50 overflow-hidden border-t sm:border border-[#3b3b5c] max-h-[90vh] flex flex-col shadow-2xl"
          >
            {/* Handle for mobile pull-down visual */}
            <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1.5 bg-[#3b3b5c] rounded-full" />
            </div>

            <div className="px-6 py-4 border-b border-[#3b3b5c]/50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Add New Item</h2>
              <button onClick={handleClose} className="p-2 -mr-2 text-[#9191b0] active:text-white transition-colors">
                <Icons.X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
              
              {/* Image Upload Area */}
              <div 
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className={`relative h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 overflow-hidden cursor-pointer transition-colors ${
                  imagePreview ? "border-[#6366f1]" : "border-[#3b3b5c] hover:border-[#6366f1]/50 bg-[#2a2a3e]/50"
                }`}
              >
                {imagePreview ? (
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#1e1e2e] flex items-center justify-center text-[#6366f1]">
                      <Icons.Image className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-[#9191b0]">Tap to upload photo</span>
                    <span className="text-xs text-[#9191b0]/70">Max 5MB</span>
                  </>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  capture="environment" // Suggests back camera on mobile
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#9191b0] mb-1.5">Item Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., Blue Denim Jacket"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={isSubmitting}
                    className="w-full bg-[#2a2a3e] border border-[#3b3b5c] text-white rounded-xl px-4 py-3 outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9191b0] mb-1.5">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      disabled={isSubmitting}
                      className="w-full bg-[#2a2a3e] border border-[#3b3b5c] text-white rounded-xl px-4 py-3 outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all appearance-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#9191b0] mb-1.5">Color (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Navy"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      disabled={isSubmitting}
                      className="w-full bg-[#2a2a3e] border border-[#3b3b5c] text-white rounded-xl px-4 py-3 outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-medium text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                {isSubmitting ? <Spinner className="w-6 h-6" /> : "Save to Wardrobe"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
