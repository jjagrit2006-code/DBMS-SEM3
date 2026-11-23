import React from 'react';

export default function StatusBadge({ status, size = 'sm' }) {
  const norm = String(status || '').toUpperCase();

  const configs = {
    AVAILABLE: { bg: 'bg-[#064E3B]/40 border-[#065F46]/50 text-emerald-400', dot: 'bg-emerald-400', label: 'AVAILABLE' },
    OCCUPIED: { bg: 'bg-[#1E3A8A]/35 border-[#1E40AF]/50 text-blue-300', dot: 'bg-blue-400', label: 'IN SESSION' },
    RESERVED: { bg: 'bg-[#78350F]/35 border-[#92400E]/50 text-amber-300', dot: 'bg-amber-400', label: 'RESERVED' },
    MAINTENANCE: { bg: 'bg-[#4C0519]/35 border-[#881337]/50 text-rose-300', dot: 'bg-rose-400', label: 'SERVICE' },
    ACTIVE: { bg: 'bg-[#1E3A8A]/40 border-[#2563EB]/50 text-blue-300', dot: 'bg-emerald-400', label: 'LIVE SESSION' },
    COMPLETED: { bg: 'bg-[#1E293B]/40 border-[#334155]/50 text-slate-400', dot: 'bg-slate-400', label: 'COMPLETED' },
    PLACED: { bg: 'bg-[#78350F]/35 border-[#92400E]/50 text-amber-300', dot: 'bg-amber-400', label: 'ORDER PLACED' },
    PREPARING: { bg: 'bg-[#1E3A8A]/35 border-[#1E40AF]/50 text-cyan-300', dot: 'bg-cyan-400', label: 'PREPARING' },
    SERVED: { bg: 'bg-[#064E3B]/40 border-[#065F46]/50 text-emerald-400', dot: 'bg-emerald-400', label: 'DELIVERED' },
    ON_DUTY: { bg: 'bg-[#064E3B]/40 border-[#065F46]/50 text-emerald-400', dot: 'bg-emerald-400', label: 'ON DUTY' },
    SCHEDULED: { bg: 'bg-[#1E293B]/40 border-[#334155]/50 text-slate-400', dot: 'bg-slate-400', label: 'SCHEDULED' },
    APPROVED: { bg: 'bg-[#064E3B]/40 border-[#065F46]/50 text-emerald-400', dot: 'bg-emerald-400', label: 'APPROVED' },
    DISBURSED: { bg: 'bg-[#1E3A8A]/40 border-[#1E40AF]/50 text-blue-300', dot: 'bg-blue-400', label: 'DISBURSED' },
    PENDING: { bg: 'bg-[#78350F]/35 border-[#92400E]/50 text-amber-300', dot: 'bg-amber-400', label: 'PENDING' }
  };

  const current = configs[norm] || {
    bg: 'bg-[#1E293B]/40 border-[#334155]/50 text-slate-400',
    dot: 'bg-slate-400',
    label: norm
  };

  const sizeClasses = size === 'xs' ? 'text-[9px] px-2 py-0.5' : 'text-[11px] px-2.5 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded ${current.bg} border ${sizeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
}
