import React, { useState, useEffect } from 'react';
import { bookingApi } from '../api/api';
import StatusBadge from '../components/StatusBadge';
import { Calendar, MapPin, Receipt, Clock, ChevronRight } from 'lucide-react';

const MyRentals = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingApi.getMy();
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'active', label: 'Active' },
    { id: 'past', label: 'Past' }
  ];

  return (
    <div className="container py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold font-heading mb-2">My Rentals</h1>
        <p className="text-text-dim">Track your reservations and rental history</p>
      </div>

      <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-dim hover:text-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-6">
          {[1, 2].map(i => <div key={i} className="glass h-48 skeleton"></div>)}
        </div>
      ) : bookings.length > 0 ? (
        <div className="grid gap-6">
          {bookings.map(b => (
            <div key={b.rental_id} className="glass p-6 group">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="w-full lg:w-64 aspect-video rounded-xl overflow-hidden border border-border-glass">
                  <img src={b.vehicle?.photo_path} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>

                <div className="flex-1 w-full">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">{b.vehicle?.brand}</div>
                      <h3 className="text-xl font-heading mb-2">{b.vehicle?.model}</h3>
                      <div className="flex items-center gap-4 text-xs text-text-dim">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(b.start_datetime).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} /> PICKUP: HQ STATION</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={b.rental_status} />
                      <div className="mt-2 text-sm font-bold text-white">#RENT-{b.rental_id.toString().padStart(4, '0')}</div>
                    </div>
                  </div>

                  {/* Progress Pill Bar */}
                  <div className="relative h-1 bg-white/5 rounded-full mb-8 mt-12 overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000"
                      style={{ width: b.rental_status === 'booked' ? '25%' : b.rental_status === 'picked_up' ? '50%' : b.rental_status === 'returned' ? '75%' : '100%' }}
                    ></div>
                    <div className="absolute top-0 left-0 w-full h-full flex justify-between -translate-y-[6px]">
                      {['Booked', 'Picked Up', 'Returned', 'Closed'].map((step, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full border-2 bg-bg-deep border-border-glass ${i === 0 || (i === 1 && (b.rental_status === 'picked_up' || b.rental_status === 'returned' || b.rental_status === 'closed')) ? 'border-primary' : ''}`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-48 lg:border-l border-border-glass lg:pl-8 flex flex-col gap-3">
                  <div className="text-right mb-2">
                    <span className="text-xs text-text-dim block">Total Paid</span>
                    <span className="text-xl font-bold font-heading">₹{b.total_cost}</span>
                  </div>
                  <button className="w-full py-2.5 rounded-xl border border-border-glass text-xs font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                    <Receipt size={14} />
                    View Receipt
                  </button>
                  <button className="w-full py-2.5 rounded-xl bg-white/5 text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-text-dim">
                    Details <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass p-20 text-center">
          <Clock size={48} className="mx-auto text-text-dim mb-6 opacity-20" />
          <h3 className="text-xl font-heading mb-2">No rentals in this category</h3>
          <p className="text-text-dim mb-8">Ready for your next premium journey?</p>
          <button onClick={() => window.location.href='/browse'} className="btn-primary">Browse Fleet</button>
        </div>
      )}
    </div>
  );
};

export default MyRentals;
