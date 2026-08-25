export type UserRole = 'customer' | 'shop_owner' | 'distributor' | 'admin';

export type Language = 'en' | 'ne';

export interface GeoLocation {
  city: string;
  district: string;
  area: string;
  lat: number;
  lng: number;
  deliveryRadiusKm: number;
}

export interface Shop {
  id: string;
  name: string;
  nepaliName: string;
  ownerName: string;
  phone: string;
  panVatNumber: string;
  location: GeoLocation;
  address: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  documents: {
    tradeLicenseUrl: string;
    panDocUrl: string;
    citizenshipUrl: string;
    shopPhotoUrl: string;
  };
  bannerImage: string;
  logoImage: string;
  openingHours: string;
  isOpen: boolean;
  deliveryFee: number;
  minOrderForFreeDelivery: number;
  isBoosted: boolean;
  boostExpiry?: string;
  totalSalesCount: number;
}

export interface Distributor {
  id: string;
  name: string;
  nepaliName: string;
  contactPerson: string;
  phone: string;
  panVatNumber: string;
  location: GeoLocation;
  address: string;
  isVerified: boolean;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  minOrderValueNPR: number;
  creditPeriodDays: number;
  categories: string[];
  bannerImage: string;
}

export type HardwareCategory = 
  | 'cement_steel'
  | 'pipes_fittings'
  | 'sanitaryware'
  | 'electrical_lighting'
  | 'tools_machinery'
  | 'paints_adhesives'
  | 'fasteners_safety'
  | 'roofing_timber';

export interface TieredPrice {
  minQty: number;
  unitPrice: number;
}

export interface Product {
  id: string;
  shopId: string; // or distributorId
  name: string;
  nepaliName: string;
  brand: string;
  category: HardwareCategory;
  description: string;
  sku: string;
  unit: string; // e.g., 'Bag', 'Piece', 'Meter', 'Kg', 'Bundle', 'Liter', 'Roll', 'Packet'
  nepaliUnit: string;
  price: number; // Selling price in NPR (before or incl VAT)
  mrp: number;
  costPrice: number; // For accounting
  stock: number;
  lowStockThreshold: number;
  isVatExempt: boolean; // false = 13% VAT, true = 0% VAT exempt
  images: string[];
  specs: Record<string, string>;
  isBoosted?: boolean;
  rating?: number;
  reviewsCount?: number;
  // Distributor B2B fields
  isWholesale?: boolean;
  tieredPricing?: TieredPrice[];
  minWholesaleOrderQty?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  shop: Shop;
}

export interface CartShopGroup {
  shop: Shop;
  items: CartItem[];
  subtotal: number;
  vatAmount: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export type PaymentMethod = 'esewa' | 'khalti' | 'cod' | 'credit';
export type PaymentStatus = 'paid' | 'pending' | 'credit_due';
export type OrderStatus = 'placed' | 'accepted' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  isVatExempt: boolean;
  taxableAmount: number;
  vatAmount: number;
  totalAmount: number;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  shopId: string;
  shopName: string;
  shopPan: string;
  shopAddress: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryType: 'delivery' | 'pickup';
  items: OrderItem[];
  taxableSubtotal: number;
  exemptSubtotal: number;
  vatAmount: number; // 13% of taxableSubtotal
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
  pointsEarned: number;
  createdAt: string;
  isWalkIn?: boolean;
  fiscalYear: string; // e.g. "2081/82"
}

// B2B Wholesale Purchase Order (Shop Owner to Distributor)
export type DistributorOrder = B2BPurchaseOrder;
export type WholesaleItem = Product;

export interface B2BPurchaseOrder {
  id: string;
  poNumber: string;
  shopId: string;
  shopName: string;
  shopPan: string;
  distributorId: string;
  distributorName: string;
  distributorPan: string;
  items: {
    productId: string;
    productName: string;
    brand?: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    isVatExempt?: boolean;
    taxableAmount?: number;
    vatAmount?: number;
    totalAmount: number;
  }[];
  subtotal?: number;
  vatAmount?: number;
  totalAmount: number;
  creditDays?: number;
  dueDate?: string;
  paymentTerms?: 'credit_30' | 'credit_60' | 'advance_bank' | 'cod' | string;
  notes?: string;
  status: 'submitted' | 'pending' | 'accepted' | 'dispatched' | 'fulfilled' | 'delivered' | 'rejected';
  createdAt: string;
  fulfilledAt?: string;
  linkedDistributorSaleInvoiceNo?: string;
  linkedShopPurchaseVoucherNo?: string;
}

// ==================== ACCOUNTING ("Busy Win" Engine) ====================
export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';

export interface AccountHead {
  code: string; // e.g. "1001", "2001"
  name: string;
  nepaliName: string;
  type: AccountType;
  group: string; // e.g. "Current Assets", "Direct Expenses", "Sales", "Sundry Debtors"
  balance: number; // Positive = Debit normal for Assets/Expenses, Credit normal for Liabilities/Equity/Income
}

export interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  particulars?: string;
}

export interface JournalEntry {
  id: string;
  shopId: string;
  voucherNo: string;
  voucherType: 'sales' | 'purchase' | 'journal' | 'payment' | 'receipt' | 'contra' | 'debit_note' | 'credit_note';
  date: string; // YYYY-MM-DD or Nepali BS date
  fiscalYear: string;
  narration: string;
  lines: JournalLine[];
  partyName?: string;
  partyPan?: string;
  referenceNo?: string;
  totalAmount: number;
}

export interface IRDVatRecord {
  id: string;
  shopId: string;
  fiscalYear: string;
  month: string; // e.g. 'Shrawan', 'Bhadra', 'Ashwin', etc.
  type: 'sales' | 'purchase';
  invoiceNo: string;
  date: string;
  partyName: string;
  partyPan: string;
  totalAmount: number;
  exemptAmount: number;
  taxableAmount: number;
  vatAmount: number;
}

export interface LoyaltyReward {
  id: string;
  title: string;
  nepaliTitle: string;
  pointsCost: number;
  discountNpr: number;
  type: 'voucher' | 'free_delivery' | 'cashback';
  description: string;
  expiryDays: number;
}

export interface LoyaltyProfile {
  customerPhone: string;
  pointsBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  history: {
    id: string;
    type: 'earned' | 'redeemed' | 'expired';
    points: number;
    description: string;
    date: string;
  }[];
  activeVouchers: {
    id: string;
    rewardId: string;
    code: string;
    discountNpr: number;
    type: 'voucher' | 'free_delivery' | 'cashback';
    expiryDate: string;
    isUsed: boolean;
  }[];
}

export interface BoostPlan {
  id: string;
  name: string;
  durationDays: number;
  costNPR: number;
  expectedViews: string;
  badgeText: string;
}

export interface BoostCampaign {
  id: string;
  shopId: string;
  entityType: 'shop' | 'product';
  entityId: string;
  entityName: string;
  planId: string;
  costNPR: number;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  status: 'active' | 'expired';
}
