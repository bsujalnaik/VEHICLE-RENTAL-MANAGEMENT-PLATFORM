import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingApi } from '../api/api';
// Stepper components removed as they are implemented inline below
import { CreditCard, Lock, ArrowRight, CheckCircle, Smartphone } from 'lucide-react';

const BookingConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { vehicle, bookingDates, pricing } = state || {};
  
  const [step, setStep] = useState(3); // Search(1) -> Book(2) -> Pay(3) -> Confirmed(4)
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '' });

  if (!vehicle) return <div className="container py-20 text-center text-text-dim">No booking data found. Please start from the Browse page.</div>;

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(r => setTimeout(r, 2000));
      await bookingApi.create({
        vehicle_id: vehicle.vehicle_id,
        start_date: bookingDates.start,
        end_date: bookingDates.end,
        total_cost: pricing.total,
        payment_mode: 'card'
      });
      setSuccess(true);
      setStep(4);
    } catch (err) {
      console.error(err);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 max-w-4xl">
      {/* Stepper */}
      <div className="flex justify-between mb-16 relative">
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-border-glass -z-10"></div>
        {[
          { icon: <CheckCircle size={16} />, label: 'Search' },
          { icon: <CheckCircle size={16} />, label: 'Select' },
          { icon: <CreditCard size={16} />, label: 'Payment' },
          { icon: <CheckCircle size={16} />, label: 'Confirmed' }
        ].map((s, i) => (
          <div key={i} className={`flex flex-col items-center gap-2 bg-bg-deep px-4 ${i + 1 <= step ? 'text-primary' : 'text-text-dim'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${i + 1 <= step ? 'border-primary bg-primary/10' : 'border-border-glass bg-bg-card'}`}>
              {s.icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{s.label}</span>
          </div>
        ))}
      </div>

      {!success ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade">
          {/* Summary */}
          <div>
            <h2 className="text-2xl font-heading mb-8">Booking Summary</h2>
            <div className="glass p-6 mb-6">
              <div className="flex gap-4 mb-6">
                <img src={vehicle.photo_path} className="w-24 h-16 object-cover rounded-lg border border-border-glass" />
                <div>
                  <h4 className="font-bold">{vehicle.brand} {vehicle.model}</h4>
                  <p className="text-xs text-text-dim uppercase tracking-wider">{vehicle.type} • {vehicle.fuel_type}</p>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between"><span className="text-text-dim">From</span><span>{new Date(bookingDates.start).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-text-dim">To</span><span>{new Date(bookingDates.end).toLocaleString()}</span></div>
                <div className="pt-4 border-t border-border-glass flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{pricing.total}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-success p-4 bg-success/5 rounded-xl border border-success/10">
              <ShieldCheck size={20} />
              <div className="text-xs">Secure transaction with 256-bit SSL encryption</div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="glass p-8">
            <h2 className="text-2xl font-heading mb-8">Payment Details</h2>
            <div className="flex gap-4 mb-8">
              <button className="flex-1 flex flex-col items-center gap-2 border-2 border-primary bg-primary/5 p-4 rounded-xl">
                <CreditCard className="text-primary" />
                <span className="text-xs font-bold">Card</span>
              </button>
              <button className="flex-1 flex flex-col items-center gap-2 border-2 border-border-glass p-4 rounded-xl hover:bg-white/5 transition-colors">
                <Smartphone className="text-text-dim" />
                <span className="text-xs font-bold">UPI</span>
              </button>
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2 block text-left">Card Number</label>
                  <input 
                    type="text" placeholder="#### #### #### ####" 
                    className="w-full bg-white/5 border border-border-glass rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2 block text-left">Expiry Date</label>
                    <input type="text" placeholder="MM/YY" className="w-full bg-white/5 border border-border-glass rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2 block text-left">CVV</label>
                    <input type="password" placeholder="***" className="w-full bg-white/5 border border-border-glass rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary" required />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-primary-hover disabled:bg-primary/50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-8"
              >
                {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : (
                  <>
                    <Lock size={18} />
                    Pay ₹{pricing.total}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="glass p-16 text-center animate-fade">
          <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-success/20">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-4xl font-heading mb-4">Booking Successful!</h2>
          <p className="text-text-dim max-w-md mx-auto mb-10">
            Your premium ride is reserved. A confirmation email has been sent to your registered address.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/my-rentals')} className="btn-primary">Track My Rental</button>
            <button onClick={() => navigate('/')} className="glass px-8 py-3 rounded-xl border-white/10 hover:bg-white/5">Back to Home</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Shield icon for safety
import { ShieldCheck } from 'lucide-react';

export default BookingConfirmation;
