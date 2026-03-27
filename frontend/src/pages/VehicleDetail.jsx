import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleApi, bookingApi } from '../api/api';
import { Calendar, Clock, CreditCard, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingDates, setBookingDates] = useState({ start: '', end: '' });
  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const res = await vehicleApi.getOne(id);
      setVehicle(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingDates.start && bookingDates.end) {
      calculatePrice();
    }
  }, [bookingDates]);

  const calculatePrice = async () => {
    try {
      const res = await bookingApi.calculate({
        vehicle_id: id,
        start_date: bookingDates.start,
        end_date: bookingDates.end
      });
      setPricing(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBooking = async () => {
    // Navigate to confirmation page
    navigate('/confirm', { state: { vehicle, bookingDates, pricing } });
  };

  if (loading) return <div className="container py-20 text-center">Loading vehicle details...</div>;
  if (!vehicle) return <div className="container py-20 text-center">Vehicle not found</div>;

  return (
    <div className="container py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Product Info */}
        <div className="flex-1">
          <div className="glass p-2 mb-8 overflow-hidden">
            <img 
              src={vehicle.photo_path || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200'} 
              className="w-full aspect-video object-cover rounded-xl"
            />
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={vehicle.availability_status} />
              <span className="text-sm text-primary font-bold tracking-widest uppercase">{vehicle.type}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">{vehicle.brand} {vehicle.model}</h1>
            <p className="text-text-dim leading-relaxed max-w-2xl">
              Experience the perfect blend of performance and luxury. This {vehicle.model} features a signature {vehicle.fuel_type} engine 
              delivering an unparalleled driving experience. Meticulously maintained and detailed for your arrival.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {[
              { label: 'Transmission', value: 'Automatic', icon: <Zap size={18} /> },
              { label: 'Fuel Type', value: vehicle.fuel_type, icon: <Clock size={18} /> },
              { label: 'Seating', value: `${vehicle.seating_capacity || 4} Adult Seats`, icon: <ShieldCheck size={18} /> },
              { label: 'Registration', value: vehicle.registration_number, icon: <MapPin size={18} /> },
            ].map((spec, i) => (
              <div key={i} className="glass p-4">
                <div className="text-primary mb-2">{spec.icon}</div>
                <div className="text-[10px] text-text-dim uppercase font-bold tracking-wider mb-1">{spec.label}</div>
                <div className="font-medium">{spec.value}</div>
              </div>
            ))}
          </div>

          <div className="glass p-8">
            <h3 className="text-xl mb-6 flex items-center gap-2">
              <CheckCircle2 size={24} className="text-success" />
              Included Services
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-dim">
              <li className="flex items-center gap-2">✓ 24/7 Roadside Assistance</li>
              <li className="flex items-center gap-2">✓ Comprehensive Insurance</li>
              <li className="flex items-center gap-2">✓ Sanitized Vehicle</li>
              <li className="flex items-center gap-2">✓ Professional Inspection</li>
            </ul>
          </div>
        </div>

        {/* Right: Booking Widget */}
        <aside className="w-full lg:w-[400px]">
          <div className="glass p-8 sticky top-28 border-primary/20">
            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-heading text-primary">₹{vehicle.price_per_day}</span>
                <span className="text-text-dim">/day</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2 block">Pickup Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-white/5 border border-border-glass rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  onChange={(e) => setBookingDates({...bookingDates, start: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2 block">Return Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-white/5 border border-border-glass rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  onChange={(e) => setBookingDates({...bookingDates, end: e.target.value})}
                />
              </div>
            </div>

            {pricing ? (
              <div className="space-y-3 pt-6 border-t border-border-glass mb-8 animate-fade">
                <div className="flex justify-between text-sm">
                  <span className="text-text-dim">Base Rate</span>
                  <span>₹{pricing.base_rate}</span>
                </div>
                {pricing.weekend_fee > 0 && (
                  <div className="flex justify-between text-sm text-warning">
                    <span>Weekend Surcharge</span>
                    <span>+₹{pricing.weekend_fee}</span>
                  </div>
                )}
                {pricing.seasonal_multiplier > 1 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Seasonal Factor</span>
                    <span>x{pricing.seasonal_multiplier}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-4 border-t border-border-glass text-white">
                  <span>Total Cost</span>
                  <span className="text-primary font-heading">₹{pricing.total}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white/5 rounded-xl text-center text-xs text-text-dim mb-8">
                Select dates to see price breakdown
              </div>
            )}

            <button 
              disabled={!pricing}
              onClick={handleBooking}
              className={`w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${pricing ? 'bg-primary hover:bg-primary-hover shadow-primary/20' : 'bg-white/10 text-text-dim cursor-not-allowed'}`}
            >
              <CreditCard size={20} />
              Confirm Booking
            </button>
            <p className="text-[10px] text-center text-text-dim mt-4">No payment required until the next step</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default VehicleDetail;
