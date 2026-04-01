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
  createdAt: string;
  updatedAt: string;
}
