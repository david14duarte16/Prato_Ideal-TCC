import { Favorite, Review, User } from "../types";

export const mockUsers: User[] = [
  {
    _id: "64a2b3c4d5e6f7g8h9i0j111",
    googleId: "109876543212345678901",
    name: "Usuário Teste",
    email: "teste@saborcia.com",
  }
];

export const mockFavoritesAPIResponse: Favorite[] = [
  {
    _id: "fav001",
    userId: "64a2b3c4d5e6f7g8h9i0j111",
    place_id: "mock-1", // O id original que está no mock do restaurante
    createdAt: new Date().toISOString(),
  },
  {
    _id: "fav002",
    userId: "64a2b3c4d5e6f7g8h9i0j111",
    place_id: "mock-3",
    createdAt: new Date().toISOString(),
  }
];

export const mockReviewsAPIResponse: Review[] = [
  {
    _id: "rev001",
    userId: "64a2b3c4d5e6f7g8h9i0j111",
    place_id: "mock-1",
    rating: 5,
    comment: "Lugar excelente e comida deliciosa!",
    createdAt: new Date().toISOString(),
  }
];
