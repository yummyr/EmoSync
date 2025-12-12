// src/pages/consultation/components/EmergencyDialog.jsx
import React from "react";

export default function EmergencyDialog({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-semibold mb-3 text-slate-800">
          Emergency help
        </h3>

        <div className="space-y-4 text-sm text-slate-700 py-6">
          <div>
            <h4 className="font-semibold text-slate-900">
              24/7 Crisis Hotline
            </h4>
            <p className="text-xl font-bold text-red-500">400-161-9995</p>
          </div>

          <div className="rounded-md bg-red-50 text-red-600 p-3 text-xs">
            If you feel unsafe or have thoughts of self-harm, please call
            immediately.
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">
            National mental health hotline
          </h4>
          <p className="text-xl font-bold text-red-500">400-1619-995</p>
          <p className="text-xs text-slate-500">24/7 emotional support</p>
        </div>
        <div className="rounded-lg mt-4 bg-red-50 p-3 text-xs text-red-600">
          If you have thoughts of self-harm or suicide, please call the hotlines
          above or go to the nearest emergency room immediately.
        </div>
        <div className="mt-4 flex justify-end">
          <button
            className="bg-sky-500 px-4 py-1.5 rounded-lg text-white font-semibold text-sm"
            onClick={onClose}
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}
