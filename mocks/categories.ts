import { Category } from "@/types/trek";
import { colors } from "@/constants/colors";

export const categories: Category[] = [
  {
    id: "treks",
    name: "Treks",
    icon: "Mountain",
    color: colors.primary,
  },
  {
    id: "districts",
    name: "Districts",
    icon: "Map",
    color: colors.secondary,
  },
  {
    id: "guides",
    name: "Guides",
    icon: "User",
    color: "#2ecc71",
  },
  {
    id: "photos",
    name: "Photos",
    icon: "Camera",
    color: "#9b59b6",
  },
];

export const popularDestinations = [
  {
    id: "kathmandu",
    name: "Kathmandu Valley",
    rating: 4.8,
    type: "Cultural Trek",
    image:
      "https://images.unsplash.com/photo-1605649461784-edc01e8ec95e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "pokhara",
    name: "Pokhara Region",
    rating: 4.9,
    type: "Scenic Trek",
    image:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
  },
];
