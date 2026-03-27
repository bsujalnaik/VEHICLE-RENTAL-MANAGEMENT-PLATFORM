import React from 'react';
import { Search, Shield, Zap, Headphones } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';

const Home = () => {
  const featuredVehicles = [
    { vehicle_id: 1, brand: 'Mercedes-Benz', model: 'S-Class', type: 'car', fuel_type: 'petrol', price_per_day: 5000, availability_status: 'available', photo_path: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800' },
    { vehicle_id: 2, brand: 'BMW', model: 'M4 Competition', type: 'car', fuel_type: 'petrol', price_per_day: 6500, availability_status: 'available', photo_path: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800' },
    { vehicle_id: 3, brand: 'Ducati', model: 'Panigale V4', type: 'bike', fuel_type: 'petrol', price_per_day: 3000, availability_status: 'available', photo_path: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800' },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000" 
            alt="Luxury Car"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-deep via-bg-deep/80 to-transparent"></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-2xl animate-fade">
            <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6">
              Drive in Style. <br />
              <span className="text-primary italic">Book in Seconds.</span>
            </h1>
            <p className="text-lg text-text-dim mb-10 max-w-lg">
              Experience the pinnacle of luxury mobility. From high-performance sportscars to executive sedans, your premium journey starts here.
            </p>

            {/* Search Widget */}
            <div className="glass p-2 max-w-3xl flex flex-col md:flex-row gap-2">
              <div className="flex-1 px-4 py-3 flex flex-col border-r border-border-glass">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Vehicle Type</span>
                <select className="bg-transparent border-none text-white focus:outline-none">
                  <option value="car">Luxury Cars</option>
                  <option value="bike">Sport Bikes</option>
                  <option value="van">Premium Vans</option>
                </select>
              </div>
              <div className="flex-1 px-4 py-3 flex flex-col border-r border-border-glass">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Pickup Date</span>
                <input type="date" className="bg-transparent border-none text-white focus:outline-none text-sm" />
              </div>
              <button className="bg-primary hover:bg-primary-hover px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all">
                <Search size={20} />
                Find Vehicles
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-20 bg-bg-card/30">
        <div className="container flex flex-wrap gap-8 justify-between">
          {[
            { icon: <Zap size={24} />, title: 'Instant Booking', desc: 'Secure your ride in under 60 seconds with our seamless flow.' },
            { icon: <Shield size={24} />, title: 'Flexible Pricing', desc: 'Custom rates for hours, days or weeks. No hidden costs.' },
            { icon: <Headphones size={24} />, title: '24/7 Support', desc: 'Our dedicated fleet team is always a call away for assistance.' }
          ].map((feature, i) => (
            <div key={i} className="flex gap-4 max-w-sm">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg mb-1">{feature.title}</h3>
                <p className="text-sm text-text-dim leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Fleet */}
      <section className="py-24">
        <div className="container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase block mb-3">Our Core Fleet</span>
              <h2 className="text-4xl">Featured <span className="text-text-dim">Vehicles</span></h2>
            </div>
            <button className="text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all hover:text-primary-hover">
              Browse Full Fleet <ArrowRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVehicles.map((v) => (
              <VehicleCard key={v.vehicle_id} vehicle={v} onBook={() => {}} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

// Internal icon for the browse button
import { ArrowRight } from 'lucide-react';

export default Home;
