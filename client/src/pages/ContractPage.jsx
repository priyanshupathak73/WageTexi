import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { contractService } from '../services';
import { useAuth } from '../context/AuthContext';
import { FileText, CheckCircle, Clock, User, Car, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

const ContractPage = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    contractService.getByBooking(bookingId)
      .then(({ data }) => setContract(data.contract))
      .catch(() => toast.error('Contract not found'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleSign = async () => {
    setSigning(true);
    try {
      const { data } = await contractService.sign(contract._id);
      setContract((prev) => ({
        ...prev,
        signedByDriver: data.signedByDriver,
        signedByOwner: data.signedByOwner,
      }));
      toast.success('Contract signed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to sign contract');
    } finally {
      setSigning(false);
    }
  };

  const isDriver = user?.role === 'driver';
  const isOwner = user?.role === 'owner';

  const mySignStatus = contract
    ? isDriver ? contract.signedByDriver : isOwner ? contract.signedByOwner : true
    : false;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-3">📄</p>
        <p className="font-medium">Contract not found</p>
        <p className="text-sm mt-1">It may not have been generated yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2.5 rounded-xl">
          <FileText className="text-blue-600" size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Digital Rental Contract</h1>
          <p className="text-sm text-gray-500">Generated on {new Date(contract.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
        </div>
      </div>

      {/* Signing status banner */}
      <div className={`flex items-center gap-3 rounded-xl p-4 mb-6 ${
        contract.signedByDriver && contract.signedByOwner
          ? 'bg-green-50 border border-green-200'
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        {contract.signedByDriver && contract.signedByOwner ? (
          <><CheckCircle className="text-green-600" size={20} /><span className="text-sm font-medium text-green-700">Fully executed — signed by both parties</span></>
        ) : (
          <><Clock className="text-yellow-600" size={20} /><span className="text-sm font-medium text-yellow-700">Awaiting signatures from both parties</span></>
        )}
      </div>

      <div className="space-y-5">
        {/* Driver details */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-blue-500" />
            <h2 className="font-semibold text-gray-800">Driver Information</h2>
            {contract.signedByDriver && <CheckCircle size={14} className="text-green-500 ml-auto" />}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-400 text-xs">Name</p><p className="font-medium">{contract.driverSnapshot?.name}</p></div>
            <div><p className="text-gray-400 text-xs">License</p><p className="font-medium">{contract.driverSnapshot?.licenseNumber || 'N/A'}</p></div>
            <div><p className="text-gray-400 text-xs">Phone</p><p className="font-medium">{contract.driverSnapshot?.phone || 'N/A'}</p></div>
            <div><p className="text-gray-400 text-xs">Experience</p><p className="font-medium">{contract.driverSnapshot?.experienceYears || 0} years</p></div>
          </div>
        </div>

        {/* Vehicle details */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Car size={16} className="text-purple-500" />
            <h2 className="font-semibold text-gray-800">Vehicle Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-400 text-xs">Vehicle</p><p className="font-medium">{contract.vehicleSnapshot?.make} {contract.vehicleSnapshot?.model} ({contract.vehicleSnapshot?.year})</p></div>
            <div><p className="text-gray-400 text-xs">Registration</p><p className="font-medium font-mono">{contract.vehicleSnapshot?.registrationNumber}</p></div>
            <div><p className="text-gray-400 text-xs">Type</p><p className="font-medium capitalize">{contract.vehicleSnapshot?.type}</p></div>
            <div><p className="text-gray-400 text-xs">Fuel</p><p className="font-medium capitalize">{contract.vehicleSnapshot?.fuelType}</p></div>
          </div>
        </div>

        {/* Rental terms */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee size={16} className="text-green-500" />
            <h2 className="font-semibold text-gray-800">Rental Terms</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-400 text-xs">Start Date</p><p className="font-medium">{new Date(contract.terms?.startDate).toLocaleDateString('en-IN')}</p></div>
            <div><p className="text-gray-400 text-xs">End Date</p><p className="font-medium">{new Date(contract.terms?.endDate).toLocaleDateString('en-IN')}</p></div>
            <div><p className="text-gray-400 text-xs">Total Days</p><p className="font-medium">{contract.terms?.totalDays} days</p></div>
            <div><p className="text-gray-400 text-xs">Daily Rate</p><p className="font-medium">₹{contract.terms?.dailyRate?.toLocaleString()}</p></div>
            {contract.terms?.surgeMultiplier > 1 && (
              <div><p className="text-gray-400 text-xs">Surge Applied</p><p className="font-medium text-orange-600">{contract.terms.surgeMultiplier}×</p></div>
            )}
            <div><p className="text-gray-400 text-xs">Total Amount</p><p className="text-lg font-bold text-gray-900">₹{contract.terms?.totalAmount?.toLocaleString()}</p></div>
          </div>
        </div>

        {/* Clauses */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Terms & Conditions</h2>
          <ol className="space-y-2">
            {contract.clauses?.map((clause, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-600">
                <span className="text-blue-500 font-bold shrink-0">{i + 1}.</span>
                {clause}
              </li>
            ))}
          </ol>
        </div>

        {/* Sign button */}
        {!mySignStatus && (
          <button
            onClick={handleSign}
            disabled={signing}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {signing ? 'Signing...' : '✍️ Sign Contract'}
          </button>
        )}

        {mySignStatus && !(contract.signedByDriver && contract.signedByOwner) && (
          <p className="text-center text-sm text-gray-500">
            ✅ You have signed. Waiting for the other party.
          </p>
        )}
      </div>
    </div>
  );
};

export default ContractPage;
