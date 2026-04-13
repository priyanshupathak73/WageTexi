const StatusBadge = ({ status }) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-50 text-red-600',
    paid: 'bg-green-100 text-green-700',
    unpaid: 'bg-orange-100 text-orange-700',
    refunded: 'bg-purple-100 text-purple-700',
  };

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
