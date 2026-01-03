export type Role = "BUYER" | "SELLER" | "SUPER_ADMIN";

export type User = {
  id: string;
  role: Role;
  fullName: string;
  email: string;
  tip?: string | null;
  categoryId?: string | null;

  blocked?: boolean;
  blockedReason?: string | null;
  blockedAt?: string | null;
  blockedById?: string | null;
};

export type Category = {
  id: string;
  name: string;
};

export type RequestScope = "ALL_SELLERS" | "CATEGORY_SELLERS";

export type RequestRow = {
  id: string;
  title: string;
  scope: RequestScope;
  imageUrl?: string | null;
  createdAt: string;
  category?: Category | null;
  buyer?: { id: string; fullName: string } | null;
  accepted?: any | null;
};

export type Conversation = {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: string;
  acceptedRequest?: {
    id: string;
    requestId: string;
    sellerId: string;
    conversationId: string;
    request?: {
      id: string;
      title: string;
      imageUrl?: string | null;
      category?: Category | null;
    } | null;
  } | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
};
