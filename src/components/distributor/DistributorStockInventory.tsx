import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatNPR } from '../../utils/formatters';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Edit2,
  ShieldCheck,
  Building2,
  Boxes,
} from 'lucide-react';

export const DistributorStockInventory: React.FC = () => {
  const { activeDistributorId, distributors, products, updateProduct, addProduct } = useApp();

  const currentDistributor =
    distributors.find((d) => d.id === activeDistributorId) || distributors[0];

  // Distributor wholesale inventory items
  const wholesaleProducts = products.filter(
    (p) => p.shopId === activeDistributorId || p.isWholesale
  );

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockLevelFilter, setStockLevelFilter] = useState<'all' | 'low' | 'healthy'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [quickAdjustQty, setQuickAdjustQty] = useState<number>(0);
  const [successNotice, setSuccessNotice] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New SKU form state
  const [newName, setNewName] = useState('');
  const [newNepaliName, setNewNepaliName] = useState('');
  const [newBrand, setNewBrand] = useState('Jagdamba Steel');
  const [newCategory, setNewCategory] = useState<string>('cement_steel');
  const [newUnit, setNewUnit] = useState('Bag (बोरा)');
  const [newWholesaleRate, setNewWholesaleRate] = useState<number>(750);
  const [newCostRate, setNewCostRate] = useState<number>(680);
  const [newStock, setNewStock] = useState<number>(1000);
  const [newMoq, setNewMoq] = useState<number>(20);
  const [newSku, setNewSku] = useState('');

  // Total valuation
  const totalStockValuation = wholesaleProducts.reduce(
    (sum, p) => sum + p.stock * (p.costPrice || p.price * 0.9),
    0
  );
  const totalWholesaleValue = wholesaleProducts.reduce(
    (sum, p) => sum + p.stock * p.price,
    0
  );
  const lowStockItems = wholesaleProducts.filter((p) => p.stock <= p.lowStockThreshold);

  const filteredProducts = wholesaleProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.nepaliName && p.nepaliName.includes(search));

    const matchesCategory =
      selectedCategory === 'all' || p.category === selectedCategory;

    let matchesStock = true;
    if (stockLevelFilter === 'low') matchesStock = p.stock <= p.lowStockThreshold;
    if (stockLevelFilter === 'healthy') matchesStock = p.stock > p.lowStockThreshold;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updatedStock = Math.max(0, editingProduct.stock + quickAdjustQty);
    updateProduct(editingProduct.id, {
      stock: updatedStock,
      price: editingProduct.price,
      costPrice: editingProduct.costPrice,
      minWholesaleOrderQty: editingProduct.minWholesaleOrderQty,
    });

    setSuccessNotice(`Updated stock for ${editingProduct.name} to ${updatedStock} ${editingProduct.unit}`);
    setEditingProduct(null);
    setQuickAdjustQty(0);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  const handleCreateNewSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addProduct({
      shopId: activeDistributorId,
      name: newName,
      nepaliName: newNepaliName || newName,
      brand: newBrand,
      category: newCategory as any,
      description: `Factory wholesale batch direct from ${currentDistributor.name}`,
      sku: newSku || `DIST-${newBrand.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      unit: newUnit,
      nepaliUnit: newUnit,
      price: newWholesaleRate,
      mrp: Math.round(newWholesaleRate * 1.2),
      costPrice: newCostRate,
      stock: newStock,
      lowStockThreshold: Math.round(newStock * 0.1),
      isVatExempt: false,
      images: [
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
      ],
      isWholesale: true,
      minWholesaleOrderQty: newMoq,
      rating: 5.0,
      reviewsCount: 1,
    });

    setSuccessNotice(`Added new factory wholesale SKU: ${newName}`);
    setShowAddModal(false);
    setNewName('');
    setNewNepaliName('');
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Distributor Warehouse Stock & Factory Inventory (मौज्दात स्टक)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time stock valuation, lot reserves, MOQs, reorder thresholds, and bulk inventory adjustments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-orange-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Wholesale SKU</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Warehouse Valuation (Cost)</p>
          <p className="text-xl font-black text-slate-900 mt-1">{formatNPR(totalStockValuation)}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Asset in Central Yard</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wholesale Potential Realization</p>
          <p className="text-xl font-black text-blue-600 mt-1">{formatNPR(totalWholesaleValue)}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">At current dealer price</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Wholesale SKUs</p>
          <p className="text-xl font-black text-slate-900 mt-1">{wholesaleProducts.length} Factory Lines</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Direct manufacturer lots</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Low Stock Warnings</p>
          <p className={`text-xl font-black mt-1 ${lowStockItems.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {lowStockItems.length} SKUs Alert
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Below buffer safety lot</p>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search stock by product name, brand, SKU code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All Categories</option>
              <option value="cement_steel">Cement & TMT Steel</option>
              <option value="pipes_fittings">Pipes & Fittings (CPVC/PVC)</option>
              <option value="tools_machinery">Tools & Power Machinery</option>
              <option value="paints_adhesives">Paints & Adhesives</option>
              <option value="electrical_lighting">Electrical & Lighting</option>
            </select>
          </div>

          {/* Stock Level Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
            <Boxes className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={stockLevelFilter}
              onChange={(e) => setStockLevelFilter(e.target.value as any)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All Stock Status</option>
              <option value="healthy">In Stock & Ready</option>
              <option value="low">Low Buffer Alert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-3 px-4 font-bold">Item Description & Brand</th>
                <th className="py-3 px-4 font-bold">SKU Code</th>
                <th className="py-3 px-4 font-bold text-center">MOQ</th>
                <th className="py-3 px-4 font-bold text-right">Cost Rate (Rs)</th>
                <th className="py-3 px-4 font-bold text-right">Wholesale Rate (Rs)</th>
                <th className="py-3 px-4 font-bold text-center">Available Stock</th>
                <th className="py-3 px-4 font-bold text-right">Inventory Value</th>
                <th className="py-3 px-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((prod) => {
                const isLow = prod.stock <= prod.lowStockThreshold;
                const lineValuation = prod.stock * prod.price;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{prod.name}</p>
                          <p className="text-[11px] text-slate-500">
                            Brand: <strong className="text-slate-700">{prod.brand}</strong> • {prod.unit}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] font-semibold text-slate-700">
                      {prod.sku}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[11px]">
                        {prod.minWholesaleOrderQty || 1} {prod.unit.split(' ')[0]}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {formatNPR(prod.costPrice || prod.price * 0.9)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatNPR(prod.price)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                            isLow
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {prod.stock.toLocaleString()} {prod.unit.split(' ')[0]}
                        </span>
                        {isLow && (
                          <span className="text-[10px] text-amber-700 font-bold mt-0.5 flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Reorder Buffer
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      {formatNPR(lineValuation)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setQuickAdjustQty(0);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700 text-sm">No wholesale items match your search</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting the filter criteria or add a new SKU.</p>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateStock}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Adjust Wholesale Inventory</h3>
                <p className="text-xs text-slate-500 mt-0.5">{editingProduct.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <p className="text-[11px] text-slate-500">Current Stock</p>
                  <p className="text-lg font-black text-slate-900">
                    {editingProduct.stock} {editingProduct.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-500">Wholesale Price</p>
                  <p className="text-sm font-bold text-orange-600">{formatNPR(editingProduct.price)}</p>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Add or Deduct Stock Units (+/-)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={quickAdjustQty}
                    onChange={(e) => setQuickAdjustQty(Number(e.target.value))}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="e.g. +500 or -100"
                  />
                  <button
                    type="button"
                    onClick={() => setQuickAdjustQty((q) => q + 100)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700"
                  >
                    +100
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickAdjustQty((q) => q + 500)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700"
                  >
                    +500
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Resulting Stock: <strong className="text-slate-800">{Math.max(0, editingProduct.stock + quickAdjustQty)} {editingProduct.unit}</strong>
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Dealer Wholesale Rate (Rs)
                </label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Minimum Order Quantity (MOQ)
                </label>
                <input
                  type="number"
                  value={editingProduct.minWholesaleOrderQty || 1}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      minWholesaleOrderQty: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Save Stock & Rates
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add New SKU Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewSku}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Factory Wholesale Product</h3>
                <p className="text-xs text-slate-500 mt-0.5">Register new bulk stock lot from manufacturer</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Product Title (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shivam Cement OPC 53 Grade"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nepali Title (नेपाली)</label>
                  <input
                    type="text"
                    placeholder="e.g. शिवम् सिमेन्ट ओ.पि.सि."
                    value={newNepaliName}
                    onChange={(e) => setNewNepaliName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="cement_steel">Cement & TMT Steel</option>
                    <option value="pipes_fittings">Pipes & Fittings</option>
                    <option value="tools_machinery">Tools & Power Machinery</option>
                    <option value="paints_adhesives">Paints & Adhesives</option>
                    <option value="electrical_lighting">Electrical & Lighting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Unit</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Cost Rate (Rs)</label>
                  <input
                    type="number"
                    value={newCostRate}
                    onChange={(e) => setNewCostRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Wholesale Rate (Rs)</label>
                  <input
                    type="number"
                    value={newWholesaleRate}
                    onChange={(e) => setNewWholesaleRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-orange-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Initial Yard Stock</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Minimum Order Qty (MOQ)</label>
                  <input
                    type="number"
                    value={newMoq}
                    onChange={(e) => setNewMoq(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Add to Wholesale Catalog
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
