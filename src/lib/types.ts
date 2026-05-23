export interface User {
  _id?: string;
  googleId?: string;
  name: string;
  email: string;
  image?: string;
  commentCount: number;
  currentTitle: string;
}

export interface Favorite {
  _id?: string;
  userId: string;
  place_id: string; // Used to fetch from Google Places
  createdAt: string;
}

export interface Review {
  _id?: string;
  userId: string;
  place_id: string;
  rating: number;
  comment: string;
  createdAt: string;
}
