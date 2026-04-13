import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vehicleService } from '../services';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

const vehicleTypes = ['sedan', 'suv', 'hatchback', 'van', 'truck', 'auto', 'other'];
const fuelTypes = ['petrol', 'diesel', 'cng', 'electric', 'hybrid'];

const VehicleForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    make: '', model: '', year: '', type: 'sedan', registrationNumber: '',
    seatingCapacity: '', fuelType: 'petrol', 'pricing.daily': '', 'pricing.weekly': '',
    'location.city': '', 'location.state': '', 'location.pincode': '',
    features: '',
  });
  const [files, setFiles] = useState({ registrationDocument: null, insuranceDocument: null, images: [] });

  useEffect(() => {
    if (!isEdit) return;
    vehicleService.getOne(id).then(({ data }) => {
      const v = data.vehicle;
      setForm({
        make: v.make, model: v.model, year: v.year, type: v.type,
        registrationNumber: v.registrationNumber, seatingCapacity: v.seatingCapacity,
        fuelType: v.fuelType, 'pricing.daily': v.pricing?.daily, 'pricing.weekly': v.pricing?.weekly || '',
        'location.city': v.location?.city, 'location.state': v.location?.state || '',
        'location.pincode': v.location?.pincode || '',
        features: v.features?.join(', ') || '',
      });
    }).catch(() => toast.error('Failed to load vehicle'));
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        const body = {
          make: form.make, model: form.model, year: Number(form.year),
          type: form.type, seatingCapacity: Number(form.seatingCapacity),
          fuelType: form.fuelType,
          pricing: { daily: Number(form['pricing.daily']), weekly: Number(form['pricing.weekly']) || undefined },
          location: { city: form['location.city'], state: form['location.state'], pincode: form['location.pincode'] },
          features: form.features ? form.features.split(',').map((f) => f.trim()) : [],
        };
        await vehicleService.update(id, body);
        toast.success('Vehicle updated');
      } else {
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v !== '') formData.append(k, v); });
        if (files.registrationDocument) formData.append('registrationDocument', files.registrationDocument);
        if (files.insuranceDocument) formData.append('insuranceDocument', files.insuranceDocument);
        files.images.forEach((f) => formData.append('images', f));
        await vehicleService.create(formData);
        toast.success('Vehicle added successfully');
      }
      navigate('/my-vehicles');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Vehicle Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Make *</label>
              <input name="make" value={form.make} onChange={handleChange} required placeholder="e.g. Maruti"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Model *</label>
              <input name="model" value={form.model} onChange={handleChange} required placeholder="e.g. Swift"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Year *</label>
              <input type="number" name="year" value={form.year} onChange={handleChange} required min={1990} max={2025}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Registration No. *</label>
              <input name="registrationNumber" value={form.registrationNumber} onChange={handleChange} required disabled={isEdit}
                placeholder="e.g. MH01AB1234"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Type *</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {vehicleTypes.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Fuel Type *</label>
              <select name="fuelType" value={form.fuelType} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {fuelTypes.map((f) => <option key={f} value={f} className="capitalize">{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Seating Capacity *</label>
              <input type="number" name="seatingCapacity" value={form.seatingCapacity} onChange={handleChange} required min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Daily Rate (₹) *</label>
              <input type="number" name="pricing.daily" value={form['pricing.daily']} onChange={handleChange} required min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Weekly Rate (₹)</label>
              <input type="number" name="pricing.weekly" value={form['pricing.weekly']} onChange={handleChange} min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Location</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">City *</label>
              <input name="location.city" value={form['location.city']} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">State</label>
              <input name="location.state" value={form['location.state']} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Pincode</label>
              <input name="location.pincode" value={form['location.pincode']} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Additional</h2>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Features (comma separated)</label>
            <input name="features" value={form.features} onChange={handleChange}
              placeholder="e.g. AC, GPS, Music System"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {!isEdit && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Registration Document</label>
                <input type="file" accept="image/*,.pdf" onChange={(e) => setFiles({ ...files, registrationDocument: e.target.files[0] })}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Insurance Document</label>
                <input type="file" accept="image/*,.pdf" onChange={(e) => setFiles({ ...files, insuranceDocument: e.target.files[0] })}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Vehicle Images (up to 5)</label>
                <input type="file" accept="image/*" multiple
                  onChange={(e) => setFiles({ ...files, images: Array.from(e.target.files).slice(0, 5) })}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700" />
              </div>
            </div>
          )}
        </section>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
            <Save size={14} />
            {loading ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Add Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
