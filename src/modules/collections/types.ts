export type CollectionSummary = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "active" | "hidden" | "archived";
  sortOrder: number;
};
