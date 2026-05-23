import { User, Review } from "../types";

export function adaptUser(apiUser: any): User {
  return {
    _id: apiUser.id,
    name: apiUser.nome || "Usuário",
    email: apiUser.email,
    image: apiUser.foto || "https://i.pravatar.cc/150?u=" + apiUser.id,
    commentCount: 0,
    currentTitle: "Explorador de Sabores",
  };
}

export function adaptReview(apiReview: any): Review {
  return {
    _id: apiReview.id,
    userId: apiReview.idUsuario,
    place_id: apiReview.idRestaurante,
    rating: apiReview.nota,
    comment: apiReview.comentario,
    createdAt: apiReview.data,
  };
}
