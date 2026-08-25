import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, HardwareCategory } from '../../types';
import { formatNPR } from '../../utils/formatters';
import { categoryLabels } from '../../utils/translations';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Tag,
  Boxes,
} from 'lucide-react';

export const ShopCatalogManager: React.FC = () => {
  const { activeShopId, products, addProduct, updateProductStock, toggleProductBoost } = useApp();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Product Form State
  const [newName, setNewName] = useState('');
  const [newNepaliName, setNewNepaliName] = useState('');
  const [newCategory, setNewCategory] = useState<HardwareCategory>('cement_steel');
  const [newBrand, setNewBrand] = useState('Shivam / Arghakhanchi');
  const [newPrice, setNewPrice] = useState(700);
  const [newUnit, setNewUnit] = useState('Bags');
  const [newStock, setNewStock] = useState(100);
  const [newThreshold, setNewThreshold] = useState(20);
  const [newIsVatExempt, setNewIsVatExempt] = useState(false);
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80');

  const shopProducts = products.filter((p) => p.shopId === activeShopId && !p.isWholesale);
  const filtered = shopProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newProd: Product = {
      id: `prod-shop-${Date.now()}`,
      shopId: activeShopId,
      name: newName,
      nepaliName: newNepaliName || newName,
      category: newCategory,
      brand: newBrand,
      description: `${newName} from certified retail stock`,
      price: newPrice,
      mrp: Math.round(newPrice * 1.15),
      costPrice: Math.round(newPrice * 0.8),
      unit: newUnit,
      nepaliUnit: newUnit,
      stock: newStock,
      lowStockThreshold: newThreshold,
      isVatExempt: newIsVatExempt,
      images: [newImage],
      sku: `JK-${Math.floor(1000 + Math.random() * 9000)}`,
      specs: { Grade: 'Commercial Standard', Origin: 'Nepal' },
      isBoosted: false,
    };

    addProduct(newProd);
    setShowAddModal(false);
    setNewName('');
    setNewNepaliName('');
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Hardware Inventory & Catalog ({shopProducts.length} Items)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage stock levels, retail pricing, 13% VAT exemption status, and featured boosts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hardware SKU</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by SKU, name, or brand..."
          className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Price (Rs)</th>
                <th className="py-3 px-4 text-center">VAT (13%)</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-center">Featured</th>
                <th className="py-3 px-4 text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((prod) => {
                const isLow = prod.stock <= prod.lowStockThreshold;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-contain bg-slate-100 border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{prod.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {prod.sku} • {prod.brand}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">
                        {categoryLabels[prod.category]?.en || prod.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      {formatNPR(prod.price)}
                      <span className="text-[10px] text-slate-400 block font-normal">/{prod.unit}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {prod.isVatExempt ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] font-bold">
                          0% Exempt
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                          13% Taxable
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isLow ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {prod.stock} {prod.unit}
                      </span>
                      {isLow && (
                        <span className="text-[9px] text-red-600 font-bold block mt-0.5">Low Stock</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleProductBoost(prod.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          prod.isBoosted
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title="Toggle Boost Spotlight"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => updateProductStock(prod.id, Math.max(0, prod.stock - 10))}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-[10px] font-bold"
                          title="Reduce 10"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => updateProductStock(prod.id, prod.stock + 50)}
                          className="px-2 py-1 bg-amber-100 hover:bg-amber-200 rounded text-amber-900 text-[10px] font-bold"
                          title="Add 50"
                        >
                          +50
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Add New Hardware SKU</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name (English)</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Astral CPVC Pipe 1 inch 10ft"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name (Nepali - ऐच्छिक)</label>
                <input
                  type="text"
                  value={newNepaliName}
                  onChange={(e) => setNewNepaliName(e.target.value)}
                  placeholder="e.g. आस्ट्राल सिपिभिसि पाइप १ इन्च"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                  >
                    {(Object.keys(categoryLabels) as HardwareCategory[]).map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryLabels[cat].en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Retail Price (Rs)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="Bags, Pcs, Mtr"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Opening Stock</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={newIsVatExempt}
                    onChange={(e) => setNewIsVatExempt(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>0% Nepal VAT Exempt Item</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
