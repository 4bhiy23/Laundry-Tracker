export interface ClothingItem {
  _id: string;
  userId: string;
  name: string;
  imageUrl: string;
  imagePublicId: string;
  category: string;
  color?: string;
  status: "wardrobe" | "laundry";
  expectedReturnDate?: string;
  isInLaundry: boolean;
  currentLaundryBag?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LaundryBagItem {
  _id: string;
  user: string;
  clothes: ClothingItem[];
  takenDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: "pending" | "returned" | "late";
  createdAt: string;
  updatedAt: string;
}
