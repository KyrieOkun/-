export type OrderStatus = "pending" | "paid" | "production" | "delivered";

export interface OrderRecord {
  id: string;
  ownerId?: string;
  vehicleSlug: string;
  selection: { trimId: string; paintId: string; wheelId: string; interiorId: string; extraIds: string[] };
  buyer: { name: string; phone: string; idType: string; idLast4: string; city: string };
  deliveryStoreId: string;
  financing: "cash" | "loan" | "lease";
  payment: "wechat" | "alipay" | "card";
  quote: { subtotal: number; purchaseTax: number; total: number; deposit: number; monthly: number; deliveryWeeks: [number, number] };
  status: OrderStatus;
  timeline: { status: OrderStatus; at: string }[];
  createdAt: string;
  paidAt?: string;
}

export interface SharedKey {
  id: string;
  ownerId: string;
  garageVehicleId: string;
  holderName: string;
  holderContact: string;
  permission: "drive" | "unlock" | "valet";
  expiresAt: string;
  createdAt: string;
  code: string;
  status: "active" | "revoked" | "expired";
}
