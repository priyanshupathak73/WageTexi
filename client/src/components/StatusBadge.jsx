const STATUS_CONFIG = {
  pending:   { bg: 'bg-amber-100',   text: 'text-amber-800',   dot: 'bg-amber-500'   },
  approved:  { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  rejected:  { bg: 'bg-red-100',     text: 'text-red-800',     dot: 'bg-red-500'     },
  active:    { bg: 'bg-blue-100',    text: 'text-blue-800',    dot: 'bg-blue-500'    },
  completed: { bg: 'bg-gray-100',    text: 'text-gray-700',    dot: 'bg-gray-400'    },
  cancelled: { bg: 'bg-red-50',      text: 'text-red-600',     dot: 'bg-red-400'     },
  paid:      { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  unpaid:    { bg: 'bg-orange-100',  text: 'text-orange-700',  dot: 'bg-orange-400'  },
  refunded:  { bg: 'bg-purple-100',  text: 'text-purple-700',  dot: 'bg-purple-400'  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
      {status}
    </span>
  );
};

export default StatusBadge;
