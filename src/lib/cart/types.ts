export type CartItem = {
  productId: string;
  quantity: number;
};

export type CartSnapshot = {
  items: CartItem[];
};
