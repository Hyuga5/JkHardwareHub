import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserRole,
  Language,
  Shop,
  Distributor,
  Product,
  CartItem,
  CartShopGroup,
  Order,
  OrderStatus,
  B2BPurchaseOrder,
  AccountHead,
  JournalEntry,
  LoyaltyProfile,
  BoostCampaign,
  PaymentMethod,
} from '../types';
import {
  initialShops,
  initialDistributors,
  initialProducts,
  initialChartOfAccounts,
  initialJournalEntries,
  initialOrders,
  loyaltyRewards,
  boostPlans,
} from '../data/mockData';
import { calculateVatBreakdown, generateInvoiceNumber, generateVoucherNumber, getNepaliFiscalYear } from '../utils/formatters';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'stock' | 'points' | 'kyc' | 'b2b';
  read: boolean;
}

interface AppContextType {
  role: UserRole;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  setCurrentRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  activeShopId: string;
  currentShopId: string;
  setActiveShopId: (id: string) => void;
  activeDistributorId: string;
  currentDistributorId: string;
  setActiveDistributorId: (id: string) => void;
  fiscalYear: string;
  setFiscalYear: (fy: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  
  // Data
  shops: Shop[];
  distributors: Distributor[];
  products: Product[];
  cart: CartItem[];
  cartShopGroups: CartShopGroup[];
  orders: Order[];
  b2bOrders: B2BPurchaseOrder[];
  distributorOrders: B2BPurchaseOrder[];
  chartOfAccounts: AccountHead[];
  journalEntries: JournalEntry[];
  ledgerEntries: JournalEntry[];
  loyaltyProfile: LoyaltyProfile;
  boostCampaigns: BoostCampaign[];
  notifications: NotificationItem[];
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Customer Checkout
  placeCustomerOrder: (params: {
    deliveryType: 'delivery' | 'pickup';
    customerAddress: string;
    paymentMethod: PaymentMethod;
    appliedVoucherCode?: string;
  }) => Promise<Order[]>;

  // Shop Owner Actions
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  createQuickPOSSale: (params: {
    shopId: string;
    customerName: string;
    customerPhone: string;
    customerPan?: string;
    paymentMethod: 'cash' | 'bank' | 'credit';
    items: { productId: string; quantity: number; unitPrice: number; isVatExempt: boolean }[];
  }) => Order;
  createPurchaseVoucher: (params: {
    shopId: string;
    supplierName: string;
    supplierPan: string;
    invoiceRef: string;
    date: string;
    items: { productId?: string; productName: string; quantity: number; unitPrice: number; isVatExempt: boolean }[];
    paymentType: 'cash' | 'bank' | 'credit';
  }) => JournalEntry;
  createJournalVoucher: (entry: Omit<JournalEntry, 'id' | 'voucherNo'>) => JournalEntry;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  boostEntity: (params: {
    shopId: string;
    entityType: 'shop' | 'product';
    entityId: string;
    planId: string;
    paymentMethod: 'esewa' | 'khalti';
  }) => void;

  // B2B Actions
  placeB2BPurchaseOrder: (params: {
    shopId: string;
    distributorId: string;
    items: { productId: string; quantity: number; unitPrice: number }[];
    creditDays: number;
  }) => B2BPurchaseOrder;
  createDistributorOrder: (params: {
    distributorId: string;
    shopId: string;
    items: { productId: string; quantity: number }[];
    paymentTerms?: string;
    notes?: string;
  }) => B2BPurchaseOrder;
  updateDistributorOrderStatus: (poId: string, status: 'submitted' | 'accepted' | 'dispatched' | 'delivered' | 'rejected') => void;
  fulfillB2BPurchaseOrder: (poId: string) => void;
  rejectB2BPurchaseOrder: (poId: string, reason?: string) => void;

  // Loyalty & Rewards
  redeemLoyaltyReward: (rewardId: string) => boolean;

  // Admin Actions
  verifyShop: (shopId: string, status: 'verified' | 'rejected') => void;
  verifyDistributor: (distributorId: string, status: 'verified' | 'rejected') => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('customer');
  const [language, setLanguage] = useState<Language>('en');
  const [activeShopId, setActiveShopId] = useState<string>('shop_ktm_1');
  const [activeDistributorId, setActiveDistributorId] = useState<string>('dist_jagdamba');
  const [fiscalYear, setFiscalYear] = useState<string>(getNepaliFiscalYear());
  const [customerPhone, setCustomerPhone] = useState<string>('9841234567');
  const [customerName, setCustomerName] = useState<string>('Santosh Sharma');

  // Primary State
  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem('jkhub_shops');
    return saved ? JSON.parse(saved) : initialShops;
  });

  const [distributors, setDistributors] = useState<Distributor[]>(() => {
    const saved = localStorage.getItem('jkhub_distributors');
    return saved ? JSON.parse(saved) : initialDistributors;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('jkhub_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('jkhub_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('jkhub_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [b2bOrders, setB2bOrders] = useState<B2BPurchaseOrder[]>(() => {
    const saved = localStorage.getItem('jkhub_b2b_orders');
    return saved ? JSON.parse(saved) : [
      {
        id: 'b2b_001',
        poNumber: 'PO-2081-82-401',
        shopId: 'shop_ktm_1',
        shopName: 'Kathmandu Hardware & Sanitation Centre',
        shopPan: '601245890',
        distributorId: 'dist_jagdamba',
        distributorName: 'Jagdamba & Panchakanya National Wholesale Depot',
        distributorPan: '300456123',
        items: [
          {
            productId: 'b2b_shivam_bulk',
            productName: 'Shivam Cement OPC 53 Grade (Wholesale Lot)',
            unit: 'Bag (बोरा)',
            quantity: 100,
            unitPrice: 685,
            totalAmount: 68500,
          },
        ],
        subtotal: 68500,
        vatAmount: 8905,
        totalAmount: 77405,
        creditDays: 21,
        dueDate: '2026-09-05',
        status: 'fulfilled',
        createdAt: '2026-08-10',
        fulfilledAt: '2026-08-10',
        linkedDistributorSaleInvoiceNo: 'INV-DIST-2081-99',
        linkedShopPurchaseVoucherNo: 'PUR-2081-008',
      },
    ];
  });

  const [chartOfAccounts, setChartOfAccounts] = useState<AccountHead[]>(() => {
    const saved = localStorage.getItem('jkhub_coa');
    return saved ? JSON.parse(saved) : initialChartOfAccounts;
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('jkhub_journal');
    return saved ? JSON.parse(saved) : initialJournalEntries;
  });

  const [loyaltyProfile, setLoyaltyProfile] = useState<LoyaltyProfile>(() => {
    const saved = localStorage.getItem('jkhub_loyalty');
    return saved ? JSON.parse(saved) : {
      customerPhone: '9841234567',
      pointsBalance: 320,
      totalEarned: 650,
      totalRedeemed: 330,
      tier: 'Silver',
      history: [
        { id: 'lh_1', type: 'earned', points: 120, description: 'Order #INV-2081-82-1044', date: '2026-08-14' },
        { id: 'lh_2', type: 'redeemed', points: 150, description: 'Redeemed Free Delivery Pass', date: '2026-08-10' },
        { id: 'lh_3', type: 'earned', points: 200, description: 'Order #INV-2081-82-0899', date: '2026-08-01' },
      ],
      activeVouchers: [],
    };
  });

  const [boostCampaigns, setBoostCampaigns] = useState<BoostCampaign[]>(() => {
    const saved = localStorage.getItem('jkhub_boosts');
    return saved ? JSON.parse(saved) : [
      {
        id: 'boost_camp_1',
        shopId: 'shop_ktm_1',
        entityType: 'shop',
        entityId: 'shop_ktm_1',
        entityName: 'Kathmandu Hardware & Sanitation Centre',
        planId: 'boost_7day',
        costNPR: 999,
        startDate: '2026-08-15',
        endDate: '2026-08-22',
        impressions: 3420,
        clicks: 284,
        status: 'active',
      },
    ];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_1',
      title: 'Low Stock Alert ⚠️',
      message: 'Bosch Impact Drill GSB 550 stock is down to 18 units at Kathmandu Hardware.',
      time: '10m ago',
      type: 'stock',
      read: false,
    },
    {
      id: 'notif_2',
      title: 'Nepal IRD Tax Reminder 🇳🇵',
      message: 'Monthly VAT Annex 13 returns for Shrawan 2081 ready for export and e-filing.',
      time: '1h ago',
      type: 'order',
      read: false,
    },
    {
      id: 'notif_3',
      title: 'Loyalty Bonus Active 🎁',
      message: 'Earn 2x Loyalty Points on CPVC pipes and sanitary fittings this week.',
      time: '3h ago',
      type: 'points',
      read: true,
    },
  ]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('jkhub_shops', JSON.stringify(shops));
  }, [shops]);
  useEffect(() => {
    localStorage.setItem('jkhub_distributors', JSON.stringify(distributors));
  }, [distributors]);
  useEffect(() => {
    localStorage.setItem('jkhub_products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem('jkhub_cart', JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem('jkhub_orders', JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem('jkhub_b2b_orders', JSON.stringify(b2bOrders));
  }, [b2bOrders]);
  useEffect(() => {
    localStorage.setItem('jkhub_coa', JSON.stringify(chartOfAccounts));
  }, [chartOfAccounts]);
  useEffect(() => {
    localStorage.setItem('jkhub_journal', JSON.stringify(journalEntries));
  }, [journalEntries]);
  useEffect(() => {
    localStorage.setItem('jkhub_loyalty', JSON.stringify(loyaltyProfile));
  }, [loyaltyProfile]);
  useEffect(() => {
    localStorage.setItem('jkhub_boosts', JSON.stringify(boostCampaigns));
  }, [boostCampaigns]);

  // Derive Cart split by Shop
  const cartShopGroups = useMemo(() => {
    const groupsMap = new Map<string, { shop: Shop; items: CartItem[] }>();

    for (const item of cart) {
      const shop = item.shop || shops.find((s) => s.id === item.product.shopId) || initialShops[0];
      if (!groupsMap.has(shop.id)) {
        groupsMap.set(shop.id, { shop, items: [] });
      }
      groupsMap.get(shop.id)!.items.push(item);
    }

    return Array.from(groupsMap.values()).map(({ shop, items }) => {
      let taxableSubtotal = 0;
      let exemptSubtotal = 0;

      for (const it of items) {
        const lineTotal = it.product.price * it.quantity;
        if (it.product.isVatExempt) {
          exemptSubtotal += lineTotal;
        } else {
          taxableSubtotal += lineTotal;
        }
      }

      const vatAmount = Math.round(taxableSubtotal * 0.13 * 100) / 100;
      const subtotal = taxableSubtotal + exemptSubtotal;
      const deliveryFee = subtotal >= shop.minOrderForFreeDelivery ? 0 : shop.deliveryFee;
      const total = subtotal + vatAmount + deliveryFee;

      return {
        shop,
        items,
        subtotal,
        vatAmount,
        deliveryFee,
        discount: 0,
        total,
      };
    });
  }, [cart, shops]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    const shop = shops.find((s) => s.id === product.shopId) || initialShops[0];
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, shop }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  // Place Customer Order - Splits by shop and atomically creates orders + invoices + ledger postings
  const placeCustomerOrder = async ({
    deliveryType,
    customerAddress,
    paymentMethod,
    appliedVoucherCode,
  }: {
    deliveryType: 'delivery' | 'pickup';
    customerAddress: string;
    paymentMethod: PaymentMethod;
    appliedVoucherCode?: string;
  }): Promise<Order[]> => {
    const newOrders: Order[] = [];
    const now = new Date().toISOString();
    let totalSpentAcrossOrders = 0;

    // Process each shop group
    for (const group of cartShopGroups) {
      const shop = group.shop;
      const invoiceNumber = generateInvoiceNumber('INV');

      let taxableSubtotal = 0;
      let exemptSubtotal = 0;

      const orderItems = group.items.map((item) => {
        const lineTotal = item.product.price * item.quantity;
        let itemTaxable = 0;
        let itemVat = 0;

        if (item.product.isVatExempt) {
          exemptSubtotal += lineTotal;
        } else {
          taxableSubtotal += lineTotal;
          itemTaxable = lineTotal;
          itemVat = Math.round(lineTotal * 0.13 * 100) / 100;
        }

        return {
          productId: item.product.id,
          productName: item.product.name,
          unit: item.product.unit,
          quantity: item.quantity,
          unitPrice: item.product.price,
          isVatExempt: item.product.isVatExempt,
          taxableAmount: itemTaxable,
          vatAmount: itemVat,
          totalAmount: lineTotal + itemVat,
        };
      });

      const vatAmount = Math.round(taxableSubtotal * 0.13 * 100) / 100;
      const deliveryFee = deliveryType === 'pickup' ? 0 : group.deliveryFee;
      let discountAmount = 0;

      if (appliedVoucherCode) {
        discountAmount = 500; // Applied coupon
      }

      const totalAmount = Math.max(0, taxableSubtotal + exemptSubtotal + vatAmount + deliveryFee - discountAmount);
      const pointsEarned = Math.floor(totalAmount / 100); // 1 point per 100 NPR
      totalSpentAcrossOrders += totalAmount;

      const order: Order = {
        id: `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        invoiceNumber,
        shopId: shop.id,
        shopName: shop.name,
        shopPan: shop.panVatNumber,
        shopAddress: shop.address,
        customerName: customerName || 'Guest Hardware Buyer',
        customerPhone: customerPhone || '9841000000',
        customerAddress: deliveryType === 'pickup' ? `Store Pickup: ${shop.address}` : customerAddress,
        deliveryType,
        items: orderItems,
        taxableSubtotal,
        exemptSubtotal,
        vatAmount,
        deliveryFee,
        discountAmount,
        totalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        orderStatus: 'placed',
        timeline: [
          {
            status: 'placed',
            timestamp: now,
            note: `Order placed via ${paymentMethod.toUpperCase()}`,
          },
        ],
        pointsEarned,
        createdAt: now,
        fiscalYear,
      };

      newOrders.push(order);

      // Deduct inventory stock
      setProducts((prev) =>
        prev.map((prod) => {
          const matchedItem = group.items.find((i) => i.product.id === prod.id);
          if (matchedItem) {
            const remaining = Math.max(0, prod.stock - matchedItem.quantity);
            return { ...prod, stock: remaining };
          }
          return prod;
        })
      );

      // Post to Shop's Double-Entry BusyWin Ledger
      const journalLines = [
        {
          accountCode: paymentMethod === 'cod' ? '1010' : '1002', // Debtors or Bank
          accountName: paymentMethod === 'cod' ? 'Sundry Debtors (Customer COD)' : 'Nabil Bank / eSewa Escrow',
          debit: totalAmount,
          credit: 0,
          particulars: `Sales revenue received for Invoice ${invoiceNumber}`,
        },
        {
          accountCode: '4001',
          accountName: 'Hardware Sales (हार्डवेयर बिक्री)',
          debit: 0,
          credit: taxableSubtotal + exemptSubtotal,
          particulars: `Taxable & exempt sales credit`,
        },
      ];

      if (vatAmount > 0) {
        journalLines.push({
          accountCode: '2010',
          accountName: 'VAT Payable (बिक्री भ्याट दायित्व)',
          debit: 0,
          credit: vatAmount,
          particulars: `13% IRD Sales VAT collected`,
        });
      }

      const journalEntry: JournalEntry = {
        id: `jrn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        shopId: shop.id,
        voucherNo: generateVoucherNumber('SAL'),
        voucherType: 'sales',
        date: new Date().toISOString().split('T')[0],
        fiscalYear,
        narration: `Online Marketplace order from ${customerPhone} (Inv: ${invoiceNumber})`,
        partyName: customerName || 'Marketplace Customer',
        referenceNo: invoiceNumber,
        totalAmount,
        lines: journalLines,
      };

      setJournalEntries((prev) => [journalEntry, ...prev]);
    }

    // Add to orders
    setOrders((prev) => [...newOrders, ...prev]);

    // Update Loyalty Points
    const earnedPoints = Math.floor(totalSpentAcrossOrders / 100);
    setLoyaltyProfile((prev) => {
      const newBal = prev.pointsBalance + earnedPoints;
      let newTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' = prev.tier;
      if (newBal >= 1000) newTier = 'Platinum';
      else if (newBal >= 500) newTier = 'Gold';
      else if (newBal >= 200) newTier = 'Silver';

      return {
        ...prev,
        pointsBalance: newBal,
        totalEarned: prev.totalEarned + earnedPoints,
        tier: newTier,
        history: [
          {
            id: `lh_${Date.now()}`,
            type: 'earned',
            points: earnedPoints,
            description: `Order Placed (${newOrders.length} shops)`,
            date: new Date().toISOString().split('T')[0],
          },
          ...prev.history,
        ],
      };
    });

    // Add Notification
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: 'Order Confirmed 🎉',
        message: `${newOrders.length} shop order(s) placed totaling Rs. ${totalSpentAcrossOrders.toLocaleString()}. Earned ${earnedPoints} loyalty points.`,
        time: 'Just now',
        type: 'order',
        read: false,
      },
      ...prev,
    ]);

    clearCart();
    return newOrders;
  };

  // Update order status (Shop owner pipeline)
  const updateOrderStatus = (orderId: string, status: OrderStatus, note = '') => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const timeline = [
            ...ord.timeline,
            {
              status,
              timestamp: new Date().toISOString(),
              note: note || `Status updated to ${status.toUpperCase()}`,
            },
          ];
          return {
            ...ord,
            orderStatus: status,
            paymentStatus: status === 'delivered' && ord.paymentMethod === 'cod' ? 'paid' : ord.paymentStatus,
            timeline,
          };
        }
        return ord;
      })
    );
  };

  // Quick Counter POS Sale for Walk-in Customers
  const createQuickPOSSale = ({
    shopId,
    customerName,
    customerPhone,
    customerPan,
    paymentMethod,
    items,
  }: {
    shopId: string;
    customerName: string;
    customerPhone: string;
    customerPan?: string;
    paymentMethod: 'cash' | 'bank' | 'credit';
    items: { productId: string; quantity: number; unitPrice: number; isVatExempt: boolean }[];
  }): Order => {
    const shop = shops.find((s) => s.id === shopId) || initialShops[0];
    const invoiceNumber = generateInvoiceNumber('POS');

    let taxableSubtotal = 0;
    let exemptSubtotal = 0;

    const orderItems = items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      const lineTotal = it.unitPrice * it.quantity;
      let itemTaxable = 0;
      let itemVat = 0;

      if (it.isVatExempt) {
        exemptSubtotal += lineTotal;
      } else {
        taxableSubtotal += lineTotal;
        itemTaxable = lineTotal;
        itemVat = Math.round(lineTotal * 0.13 * 100) / 100;
      }

      return {
        productId: it.productId,
        productName: prod ? prod.name : 'Hardware Item',
        unit: prod ? prod.unit : 'Pcs',
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        isVatExempt: it.isVatExempt,
        taxableAmount: itemTaxable,
        vatAmount: itemVat,
        totalAmount: lineTotal + itemVat,
      };
    });

    const vatAmount = Math.round(taxableSubtotal * 0.13 * 100) / 100;
    const totalAmount = taxableSubtotal + exemptSubtotal + vatAmount;

    const newOrder: Order = {
      id: `pos_${Date.now()}`,
      invoiceNumber,
      shopId: shop.id,
      shopName: shop.name,
      shopPan: shop.panVatNumber,
      shopAddress: shop.address,
      customerName: customerName || 'Walk-in Counter Buyer',
      customerPhone: customerPhone || '9800000000',
      customerAddress: 'Counter Walk-in Sale',
      deliveryType: 'pickup',
      items: orderItems,
      taxableSubtotal,
      exemptSubtotal,
      vatAmount,
      deliveryFee: 0,
      discountAmount: 0,
      totalAmount,
      paymentMethod: paymentMethod === 'bank' ? 'khalti' : paymentMethod === 'credit' ? 'credit' : 'cod',
      paymentStatus: paymentMethod === 'credit' ? 'credit_due' : 'paid',
      orderStatus: 'delivered',
      timeline: [
        { status: 'delivered', timestamp: new Date().toISOString(), note: 'Counter POS sale completed' },
      ],
      pointsEarned: 0,
      createdAt: new Date().toISOString(),
      isWalkIn: true,
      fiscalYear,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Deduct stock
    setProducts((prev) =>
      prev.map((p) => {
        const item = items.find((i) => i.productId === p.id);
        if (item) {
          return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        }
        return p;
      })
    );

    // Ledger posting
    let debitAccountCode = '1001'; // Cash
    let debitAccountName = 'Cash in Hand (काउन्टर नगद)';
    if (paymentMethod === 'bank') {
      debitAccountCode = '1002';
      debitAccountName = 'Nabil Bank Current A/c';
    } else if (paymentMethod === 'credit') {
      debitAccountCode = '1010';
      debitAccountName = `Sundry Debtors (${customerName || 'Party'})`;
    }

    const journalLines = [
      {
        accountCode: debitAccountCode,
        accountName: debitAccountName,
        debit: totalAmount,
        credit: 0,
        particulars: `POS invoice collection (${paymentMethod.toUpperCase()})`,
      },
      {
        accountCode: '4001',
        accountName: 'Hardware Sales (हार्डवेयर बिक्री)',
        debit: 0,
        credit: taxableSubtotal + exemptSubtotal,
        particulars: `Taxable & exempt sales revenue`,
      },
    ];

    if (vatAmount > 0) {
      journalLines.push({
        accountCode: '2010',
        accountName: 'VAT Payable (बिक्री भ्याट दायित्व)',
        debit: 0,
        credit: vatAmount,
        particulars: `13% Sales VAT on Invoice ${invoiceNumber}`,
      });
    }

    const journalEntry: JournalEntry = {
      id: `jrn_pos_${Date.now()}`,
      shopId: shop.id,
      voucherNo: generateVoucherNumber('SAL'),
      voucherType: 'sales',
      date: new Date().toISOString().split('T')[0],
      fiscalYear,
      narration: `Counter POS walk-in sale to ${customerName || 'Customer'} (Inv: ${invoiceNumber})`,
      partyName: customerName,
      partyPan: customerPan,
      referenceNo: invoiceNumber,
      totalAmount,
      lines: journalLines,
    };

    setJournalEntries((prev) => [journalEntry, ...prev]);

    return newOrder;
  };

  // Purchase Voucher (Shop Owner recording external purchase)
  const createPurchaseVoucher = ({
    shopId,
    supplierName,
    supplierPan,
    invoiceRef,
    date,
    items,
    paymentType,
  }: {
    shopId: string;
    supplierName: string;
    supplierPan: string;
    invoiceRef: string;
    date: string;
    items: { productId?: string; productName: string; quantity: number; unitPrice: number; isVatExempt: boolean }[];
    paymentType: 'cash' | 'bank' | 'credit';
  }): JournalEntry => {
    let taxable = 0;
    let exempt = 0;

    for (const item of items) {
      const line = item.quantity * item.unitPrice;
      if (item.isVatExempt) exempt += line;
      else taxable += line;
    }

    const vatInput = Math.round(taxable * 0.13 * 100) / 100;
    const totalAmount = taxable + exempt + vatInput;

    let creditAccountCode = '1001';
    let creditAccountName = 'Cash in Hand (काउन्टर नगद)';
    if (paymentType === 'bank') {
      creditAccountCode = '1002';
      creditAccountName = 'Nabil Bank Current A/c';
    } else if (paymentType === 'credit') {
      creditAccountCode = '2001';
      creditAccountName = `Sundry Creditors (${supplierName})`;
    }

    const lines = [
      {
        accountCode: '5001',
        accountName: 'Hardware Purchases (सामग्री खरिद)',
        debit: taxable + exempt,
        credit: 0,
        particulars: `Purchase from ${supplierName} Ref: ${invoiceRef}`,
      },
    ];

    if (vatInput > 0) {
      lines.push({
        accountCode: '1030',
        accountName: 'VAT Receivable (खरिद भ्याट इनपुट)',
        debit: vatInput,
        credit: 0,
        particulars: '13% Input VAT claimable on purchase',
      });
    }

    lines.push({
      accountCode: creditAccountCode,
      accountName: creditAccountName,
      debit: 0,
      credit: totalAmount,
      particulars: `Payment via ${paymentType}`,
    });

    const entry: JournalEntry = {
      id: `jrn_pur_${Date.now()}`,
      shopId,
      voucherNo: generateVoucherNumber('PUR'),
      voucherType: 'purchase',
      date: date || new Date().toISOString().split('T')[0],
      fiscalYear,
      narration: `Hardware purchase from ${supplierName} (Supp Inv: ${invoiceRef})`,
      partyName: supplierName,
      partyPan: supplierPan,
      referenceNo: invoiceRef,
      totalAmount,
      lines,
    };

    setJournalEntries((prev) => [entry, ...prev]);

    // Update stock if matched products
    for (const item of items) {
      if (item.productId) {
        setProducts((prev) =>
          prev.map((p) => (p.id === item.productId ? { ...p, stock: p.stock + item.quantity } : p))
        );
      }
    }

    return entry;
  };

  // General Journal Voucher (Manual double-entry)
  const createJournalVoucher = (entryData: Omit<JournalEntry, 'id' | 'voucherNo'>): JournalEntry => {
    const entry: JournalEntry = {
      ...entryData,
      id: `jrn_${Date.now()}`,
      voucherNo: generateVoucherNumber(entryData.voucherType),
    };
    setJournalEntries((prev) => [entry, ...prev]);
    return entry;
  };

  // Product Catalog CRUD
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Boost Store / Product
  const boostEntity = ({
    shopId,
    entityType,
    entityId,
    planId,
  }: {
    shopId: string;
    entityType: 'shop' | 'product';
    entityId: string;
    planId: string;
    paymentMethod: 'esewa' | 'khalti';
  }) => {
    const plan = boostPlans.find((p) => p.id === planId) || boostPlans[0];
    const shop = shops.find((s) => s.id === shopId);
    const prod = products.find((p) => p.id === entityId);
    const name = entityType === 'shop' ? (shop ? shop.name : 'Hardware Store') : (prod ? prod.name : 'Hardware Product');

    const startDate = new Date().toISOString().split('T')[0];
    const end = new Date();
    end.setDate(end.getDate() + plan.durationDays);
    const endDate = end.toISOString().split('T')[0];

    const campaign: BoostCampaign = {
      id: `boost_${Date.now()}`,
      shopId,
      entityType,
      entityId,
      entityName: name,
      planId,
      costNPR: plan.costNPR,
      startDate,
      endDate,
      impressions: 0,
      clicks: 0,
      status: 'active',
    };

    setBoostCampaigns((prev) => [campaign, ...prev]);

    // Mark entity as boosted
    if (entityType === 'shop') {
      setShops((prev) =>
        prev.map((s) => (s.id === entityId ? { ...s, isBoosted: true, boostExpiry: endDate } : s))
      );
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === entityId ? { ...p, isBoosted: true } : p))
      );
    }

    // Ledger entry for advertising expense
    const journalEntry: JournalEntry = {
      id: `jrn_adv_${Date.now()}`,
      shopId,
      voucherNo: generateVoucherNumber('PAY'),
      voucherType: 'payment',
      date: startDate,
      fiscalYear,
      narration: `Paid for ${plan.name} store promotion campaign via Digital Wallet`,
      referenceNo: campaign.id,
      totalAmount: plan.costNPR,
      lines: [
        {
          accountCode: '5005',
          accountName: 'Promotions & Store Boosting',
          debit: plan.costNPR,
          credit: 0,
          particulars: `${plan.name} visibility campaign`,
        },
        {
          accountCode: '1002',
          accountName: 'Nabil Bank Current A/c',
          debit: 0,
          credit: plan.costNPR,
          particulars: 'Digital wallet checkout',
        },
      ],
    };

    setJournalEntries((prev) => [journalEntry, ...prev]);
  };

  // B2B Wholesale Purchasing (Shop Owner -> Distributor)
  const placeB2BPurchaseOrder = ({
    shopId,
    distributorId,
    items,
    creditDays,
  }: {
    shopId: string;
    distributorId: string;
    items: { productId: string; quantity: number; unitPrice: number }[];
    creditDays: number;
  }): B2BPurchaseOrder => {
    const shop = shops.find((s) => s.id === shopId) || initialShops[0];
    const dist = distributors.find((d) => d.id === distributorId) || initialDistributors[0];

    const poNumber = `PO-${getNepaliFiscalYear().replace('/', '-')}-${Math.floor(100 + Math.random() * 900)}`;

    let subtotal = 0;
    const poItems = items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      const line = it.quantity * it.unitPrice;
      subtotal += line;
      return {
        productId: it.productId,
        productName: prod ? prod.name : 'Wholesale Hardware Goods',
        unit: prod ? prod.unit : 'Lot',
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalAmount: line,
      };
    });

    const vatAmount = Math.round(subtotal * 0.13 * 100) / 100;
    const totalAmount = subtotal + vatAmount;

    const due = new Date();
    due.setDate(due.getDate() + creditDays);
    const dueDate = due.toISOString().split('T')[0];

    const po: B2BPurchaseOrder = {
      id: `b2b_po_${Date.now()}`,
      poNumber,
      shopId: shop.id,
      shopName: shop.name,
      shopPan: shop.panVatNumber,
      distributorId: dist.id,
      distributorName: dist.name,
      distributorPan: dist.panVatNumber,
      items: poItems,
      subtotal,
      vatAmount,
      totalAmount,
      creditDays,
      dueDate,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setB2bOrders((prev) => [po, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif_b2b_${Date.now()}`,
        title: 'New B2B Purchase Order 🚚',
        message: `${shop.name} placed Purchase Order ${poNumber} of Rs. ${totalAmount.toLocaleString()} to ${dist.name}.`,
        time: 'Just now',
        type: 'b2b',
        read: false,
      },
      ...prev,
    ]);

    return po;
  };

  // Fulfill B2B PO: Atomically updates Distributor Sales + Shop Owner Purchases + Inventory + Double Entry Ledgers!
  const fulfillB2BPurchaseOrder = (poId: string) => {
    const po = b2bOrders.find((o) => o.id === poId);
    if (!po) return;

    const distSaleInv = generateInvoiceNumber('DIST-SAL');
    const shopPurVoucher = generateVoucherNumber('PUR');
    const dateStr = new Date().toISOString().split('T')[0];

    // 1. Update PO status
    setB2bOrders((prev) =>
      prev.map((o) =>
        o.id === poId
          ? {
              ...o,
              status: 'fulfilled',
              fulfilledAt: dateStr,
              linkedDistributorSaleInvoiceNo: distSaleInv,
              linkedShopPurchaseVoucherNo: shopPurVoucher,
            }
          : o
      )
    );

    // 2. Add Stock to Shop Owner inventory
    for (const item of po.items) {
      // Find matching retail product in shop
      setProducts((prev) => {
        const existing = prev.find((p) => p.shopId === po.shopId && (p.sku.includes('SHV') || p.name.includes(item.productName.split(' ')[0])));
        if (existing) {
          return prev.map((p) => (p.id === existing.id ? { ...p, stock: p.stock + item.quantity } : p));
        }
        return prev;
      });
    }

    // 3. Atomically Post Purchase Entry to Shop Owner's Ledger
    const shopJournal: JournalEntry = {
      id: `jrn_shop_b2b_${Date.now()}`,
      shopId: po.shopId,
      voucherNo: shopPurVoucher,
      voucherType: 'purchase',
      date: dateStr,
      fiscalYear,
      narration: `Wholesale purchase from ${po.distributorName} on ${po.creditDays}-day credit (Ref: ${po.poNumber})`,
      partyName: po.distributorName,
      partyPan: po.distributorPan,
      referenceNo: po.poNumber,
      totalAmount: po.totalAmount,
      lines: [
        {
          accountCode: '5001',
          accountName: 'Hardware Purchases (सामग्री खरिद)',
          debit: po.subtotal,
          credit: 0,
          particulars: `Purchase of wholesale hardware items`,
        },
        {
          accountCode: '1030',
          accountName: 'VAT Receivable (खरिद भ्याट इनपुट)',
          debit: po.vatAmount,
          credit: 0,
          particulars: '13% Input VAT claimable',
        },
        {
          accountCode: '2001',
          accountName: `Sundry Creditors (${po.distributorName})`,
          debit: 0,
          credit: po.totalAmount,
          particulars: `Credit term due on ${po.dueDate}`,
        },
      ],
    };

    // 4. Atomically Post Sales Entry to Distributor's Books
    const distJournal: JournalEntry = {
      id: `jrn_dist_b2b_${Date.now()}`,
      shopId: po.distributorId,
      voucherNo: generateVoucherNumber('SAL'),
      voucherType: 'sales',
      date: dateStr,
      fiscalYear,
      narration: `B2B Wholesale sale to dealer ${po.shopName} (Ref: ${po.poNumber})`,
      partyName: po.shopName,
      partyPan: po.shopPan,
      referenceNo: distSaleInv,
      totalAmount: po.totalAmount,
      lines: [
        {
          accountCode: '1010',
          accountName: `Sundry Debtors (${po.shopName})`,
          debit: po.totalAmount,
          credit: 0,
          particulars: `Dealer receivable due on ${po.dueDate}`,
        },
        {
          accountCode: '4001',
          accountName: 'Hardware Sales (हार्डवेयर बिक्री)',
          debit: 0,
          credit: po.subtotal,
          particulars: 'Wholesale hardware revenue',
        },
        {
          accountCode: '2010',
          accountName: 'VAT Payable (बिक्री भ्याट दायित्व)',
          debit: 0,
          credit: po.vatAmount,
          particulars: '13% IRD Sales VAT',
        },
      ],
    };

    setJournalEntries((prev) => [shopJournal, distJournal, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif_ful_${Date.now()}`,
        title: 'B2B PO Dispatched & Fulfilled ✅',
        message: `Order ${po.poNumber} fulfilled. Inventory & double-entry ledgers automatically updated for both parties!`,
        time: 'Just now',
        type: 'b2b',
        read: false,
      },
      ...prev,
    ]);
  };

  const rejectB2BPurchaseOrder = (poId: string, reason = 'Out of Stock') => {
    setB2bOrders((prev) =>
      prev.map((o) => (o.id === poId ? { ...o, status: 'rejected' } : o))
    );
    setNotifications((prev) => [
      {
        id: `notif_rej_${Date.now()}`,
        title: 'B2B PO Rejected',
        message: `Purchase Order was rejected by distributor. Reason: ${reason}`,
        time: 'Just now',
        type: 'b2b',
        read: false,
      },
      ...prev,
    ]);
  };

  // Loyalty rewards redemption
  const redeemLoyaltyReward = (rewardId: string): boolean => {
    const reward = loyaltyRewards.find((r) => r.id === rewardId);
    if (!reward || loyaltyProfile.pointsBalance < reward.pointsCost) {
      return false;
    }

    const exp = new Date();
    exp.setDate(exp.getDate() + reward.expiryDays);

    const voucherCode = `JK-${reward.type.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setLoyaltyProfile((prev) => ({
      ...prev,
      pointsBalance: prev.pointsBalance - reward.pointsCost,
      totalRedeemed: prev.totalRedeemed + reward.pointsCost,
      history: [
        {
          id: `lh_${Date.now()}`,
          type: 'redeemed',
          points: reward.pointsCost,
          description: `Redeemed ${reward.title} (Code: ${voucherCode})`,
          date: new Date().toISOString().split('T')[0],
        },
        ...prev.history,
      ],
      activeVouchers: [
        {
          id: `vouch_${Date.now()}`,
          rewardId: reward.id,
          code: voucherCode,
          discountNpr: reward.discountNpr,
          type: reward.type,
          expiryDate: exp.toISOString().split('T')[0],
          isUsed: false,
        },
        ...prev.activeVouchers,
      ],
    }));

    return true;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ne' : 'en'));
  };

  const createDistributorOrder = (params: {
    distributorId: string;
    shopId: string;
    items: { productId: string; quantity: number }[];
    paymentTerms?: string;
    notes?: string;
  }) => {
    const dist = distributors.find((d) => d.id === params.distributorId);
    const shop = shops.find((s) => s.id === params.shopId);

    const orderItems = params.items.map((it) => {
      const p = products.find((prod) => prod.id === it.productId);
      const unitPrice = p ? p.price : 1000;
      const totalAmount = unitPrice * it.quantity;
      return {
        productId: it.productId,
        productName: p ? p.name : 'Hardware Wholesale Lot',
        brand: p?.brand,
        unit: p?.unit || 'Pcs',
        quantity: it.quantity,
        unitPrice,
        isVatExempt: p?.isVatExempt ?? false,
        taxableAmount: p?.isVatExempt ? 0 : totalAmount,
        vatAmount: p?.isVatExempt ? 0 : totalAmount * 0.13,
        totalAmount: p?.isVatExempt ? totalAmount : totalAmount * 1.13,
      };
    });

    const subtotal = orderItems.reduce((s, i) => s + (i.isVatExempt ? i.totalAmount : i.taxableAmount), 0);
    const vatAmount = orderItems.reduce((s, i) => s + i.vatAmount, 0);
    const totalAmount = subtotal + vatAmount;

    const newOrder: B2BPurchaseOrder = {
      id: `b2b_${Date.now()}`,
      poNumber: `PO-${getNepaliFiscalYear()}-${Math.floor(100 + Math.random() * 900)}`,
      shopId: params.shopId,
      shopName: shop?.name || 'Kathmandu Hardware & Sanitation Centre',
      shopPan: shop?.panVatNumber || '601245890',
      distributorId: params.distributorId,
      distributorName: dist?.name || 'Jagdamba & Panchakanya National Wholesale Depot',
      distributorPan: dist?.panVatNumber || '300456123',
      items: orderItems,
      subtotal,
      vatAmount,
      totalAmount,
      creditDays: dist?.creditPeriodDays || 30,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      paymentTerms: params.paymentTerms || 'credit_30',
      notes: params.notes,
      status: 'submitted',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setB2bOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateDistributorOrderStatus = (
    poId: string,
    status: 'submitted' | 'accepted' | 'dispatched' | 'delivered' | 'rejected'
  ) => {
    if (status === 'delivered') {
      fulfillB2BPurchaseOrder(poId);
    } else {
      setB2bOrders((prev) =>
        prev.map((o) => (o.id === poId ? { ...o, status } : o))
      );
    }
  };

  // Admin Verification
  const verifyShop = (shopId: string, status: 'verified' | 'rejected') => {
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, verificationStatus: status, isVerified: status === 'verified' } : s))
    );
  };

  const verifyDistributor = (distributorId: string, status: 'verified' | 'rejected') => {
    setDistributors((prev) =>
      prev.map((d) => (d.id === distributorId ? { ...d, verificationStatus: status, isVerified: status === 'verified' } : d))
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => setNotifications([]);

  const resetAllData = () => {
    localStorage.clear();
    setShops(initialShops);
    setDistributors(initialDistributors);
    setProducts(initialProducts);
    setCart([]);
    setOrders(initialOrders);
    setChartOfAccounts(initialChartOfAccounts);
    setJournalEntries(initialJournalEntries);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        currentRole: role,
        setRole,
        setCurrentRole: setRole,
        language,
        setLanguage,
        toggleLanguage,
        activeShopId,
        currentShopId: activeShopId,
        setActiveShopId,
        activeDistributorId,
        currentDistributorId: activeDistributorId,
        setActiveDistributorId,
        fiscalYear,
        setFiscalYear,
        customerPhone,
        setCustomerPhone,
        customerName,
        setCustomerName,
        shops,
        distributors,
        products,
        cart,
        cartShopGroups,
        orders,
        b2bOrders,
        distributorOrders: b2bOrders,
        chartOfAccounts,
        journalEntries,
        ledgerEntries: journalEntries,
        loyaltyProfile,
        boostCampaigns,
        notifications,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        placeCustomerOrder,
        updateOrderStatus,
        createQuickPOSSale,
        createPurchaseVoucher,
        createJournalVoucher,
        addProduct,
        updateProduct,
        deleteProduct,
        boostEntity,
        placeB2BPurchaseOrder,
        createDistributorOrder,
        updateDistributorOrderStatus,
        fulfillB2BPurchaseOrder,
        rejectB2BPurchaseOrder,
        redeemLoyaltyReward,
        verifyShop,
        verifyDistributor,
        markNotificationAsRead,
        clearAllNotifications,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
