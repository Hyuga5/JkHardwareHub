import React from 'react';
import { Order } from '../../types';
import { formatNPR } from '../../utils/formatters';
import { Printer, Download, X, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

interface TaxInvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const TaxInvoiceModal: React.FC<TaxInvoiceModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm tracking-wide">
              Official Nepal IRD Format Tax Invoice (कर बिजक)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="print-invoice-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Content */}
        <div className="p-8 text-slate-800 bg-white font-sans print:p-0" id="printable-tax-invoice">
          {/* Header */}
          <div className="text-center pb-4 border-b border-slate-300">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
              Government of Nepal • Inland Revenue Department (IRD)
            </p>
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight mt-1">
              TAX INVOICE (कर बिजक)
            </h1>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              {order.shopName}
            </p>
            <p className="text-xs text-slate-600">{order.shopAddress}</p>
            <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-md border border-slate-200">
              <span className="text-xs font-bold text-slate-800">
                PAN / VAT No: {order.shopPan}
              </span>
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-200">
            <div>
              <p className="text-slate-500">Invoice No / बिजक नं.:</p>
              <p className="font-bold text-slate-900 text-sm">{order.invoiceNumber}</p>
              <p className="text-slate-500 mt-2">Fiscal Year / आ.व.:</p>
              <p className="font-semibold text-slate-800">{order.fiscalYear || '2081/82'}</p>
              <p className="text-slate-500 mt-2">Transaction Date / मिति:</p>
              <p className="font-medium text-slate-800">
                {new Date(order.createdAt).toLocaleDateString('en-GB')} ({new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </p>
            </div>
            <div>
              <p className="text-slate-500">Buyer's Name / खरिदकर्ताको नाम:</p>
              <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
              <p className="text-slate-500 mt-2">Buyer's Phone / सम्पर्क नं.:</p>
              <p className="font-medium text-slate-800">{order.customerPhone}</p>
              <p className="text-slate-500 mt-2">Delivery / Site Address:</p>
              <p className="font-medium text-slate-800 truncate">{order.customerAddress}</p>
              <p className="text-slate-500 mt-2">Payment Method / भुक्तानी:</p>
              <p className="font-bold text-emerald-700 uppercase">{order.paymentMethod} ({order.paymentStatus})</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 text-slate-700">
                  <th className="py-2.5 px-3 font-semibold text-center w-10">S.N.</th>
                  <th className="py-2.5 px-3 font-semibold">Description of Goods (विवरण)</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Unit</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Qty</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Rate (Rs.)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Taxable (Rs.)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Total (Rs.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">
                      {item.productName}
                      {item.isVatExempt && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-normal">
                          VAT Exempt
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600">{item.unit}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-800">{item.quantity}</td>
                    <td className="py-2 px-3 text-right text-slate-600">{item.unitPrice.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {item.isVatExempt ? '0.00' : (item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900">
                      {item.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Summary Totals */}
          <div className="mt-4 pt-4 border-t border-slate-300 grid grid-cols-2 gap-4">
            <div className="text-xs text-slate-500 space-y-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-700 mb-1">Declaration / स्वघोषणा:</p>
                <p className="text-[11px] leading-relaxed">
                  यस बिलमा उल्लेख भएका विवरणहरू सत्य र तथ्य छन्। नेपाल सरकार, आन्तरिक राजस्व ऐन २०५८ को दफा ६ बमोजिम जारी गरिएको आधिकारिक कर बिजक हो।
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="p-2 border border-slate-300 rounded bg-white">
                  <QrCode className="w-12 h-12 text-slate-800" />
                </div>
                <div className="text-[11px]">
                  <p className="font-bold text-slate-800">IRD Verified e-Billing</p>
                  <p className="text-slate-500">Scan to verify on IRD Portal</p>
                  <p className="text-emerald-700 font-semibold mt-0.5">Status: Authorized</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-right">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Taxable Amount (करयोग्य रकम):</span>
                <span className="font-medium text-slate-800">{formatNPR(order.taxableSubtotal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">VAT Exempt Goods (कर छुट रकम):</span>
                <span className="font-medium text-slate-800">{formatNPR(order.exemptSubtotal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">13% Value Added Tax (भ्याट १३%):</span>
                <span className="font-semibold text-emerald-700">+{formatNPR(order.vatAmount)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Delivery & Freight Fee:</span>
                  <span className="font-medium text-slate-800">+{formatNPR(order.deliveryFee)}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-red-600">
                  <span>Loyalty Voucher Discount:</span>
                  <span>-{formatNPR(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-bold text-slate-900">
                <span>Grand Total (जम्मा रकम):</span>
                <span className="text-base text-slate-900">{formatNPR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Signatures */}
          <div className="mt-10 pt-6 border-t border-dashed border-slate-300 flex justify-between text-xs text-slate-600">
            <div>
              <div className="w-36 border-b border-slate-400 mb-1" />
              <p>Customer Signature</p>
            </div>
            <div className="text-right">
              <div className="w-36 border-b border-slate-400 mb-1 ml-auto" />
              <p className="font-semibold text-slate-800">{order.shopName}</p>
              <p className="text-[11px] text-slate-500">Authorized Signatory / मुद्रक</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
