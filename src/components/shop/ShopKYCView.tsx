import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  FileCheck,
  UploadCloud,
  CheckCircle2,
  Building,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const ShopKYCView: React.FC = () => {
  const { activeShopId, shops } = useApp();
  const currentShop = shops.find((s) => s.id === activeShopId) || shops[0];
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Government of Nepal • Hardware Store KYC
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mandatory verification for legal 13% Tax Invoicing & Online Settlement in Nepal.
          </p>
        </div>

        {currentShop.isVerified ? (
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            PAN / VAT Verified
          </span>
        ) : (
          <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-xl text-xs font-bold">
            Pending Document Review
          </span>
        )}
      </div>

      {submitted && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>KYC Document update submitted for IRD registry verification.</span>
        </div>
      )}

      {/* Verified Data Details */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building className="w-4 h-4 text-amber-600" />
          Business Registry Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-slate-500 font-medium">Registered Business Name</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{currentShop.name}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-slate-500 font-medium">Inland Revenue PAN / VAT No.</p>
            <p className="text-sm font-mono font-bold text-emerald-700 mt-0.5">{currentShop.panVatNumber}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-slate-500 font-medium">Store Proprietor / Manager</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{currentShop.ownerName}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-slate-500 font-medium">Registered Physical Address</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{currentShop.address}</p>
          </div>
        </div>
      </div>

      {/* Document Verification Checklist */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          Submitted Documents
        </h2>

        <div className="space-y-3 text-xs">
          {/* PAN Cert */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                PAN
              </div>
              <div>
                <p className="font-bold text-slate-900">Inland Revenue Department (IRD) PAN Certificate</p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">✓ Verified & Active for VAT</p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Issued: 2077 BS</span>
          </div>

          {/* Trade License */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                KMC
              </div>
              <div>
                <p className="font-bold text-slate-900">Municipal Hardware Business Trade License</p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">✓ Verified Renewal 2081/82</p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Ward No. 10</span>
          </div>

          {/* Citizenship */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                NAG
              </div>
              <div>
                <p className="font-bold text-slate-900">Proprietor Nepali Citizenship Card (नागरिकता)</p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">✓ Verified National ID</p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">District: Kathmandu</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={() => setSubmitted(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition"
          >
            <UploadCloud className="w-4 h-4 text-amber-400" />
            <span>Upload Updated License Documents</span>
          </button>
        </div>
      </div>
    </div>
  );
};
