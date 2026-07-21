import { cartSnapshotSchema, type CartItemInput } from "./schema";

export function createCartSnapshot(items: CartItemInput[]) {
  return cartSnapshotSchema.parse({ items });
}

export function getCartItemCount(items: CartItemInput[]) {
  return items.reduce((count, item) => count + item.quantity, 0);
}
