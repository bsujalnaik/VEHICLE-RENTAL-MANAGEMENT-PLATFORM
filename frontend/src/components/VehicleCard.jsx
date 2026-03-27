import React from 'react';
import { Fuel, Users, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

const VehicleCard = ({ vehicle, onBook }) => {
  return (
    <div className="glass glass-hover p-4 group flex flex-col h-full">
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4">
        <img 
          src={vehicle.photo_path || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'} 
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <StatusBadge status={vehicle.availability_status} />
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className="text-xs text-text-dim uppercase tracking-widest font-heading mb-1 block">{vehicle.brand}</span>
            <h3 className="text-lg font-heading">{vehicle.model}</h3>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-heading text-primary">₹{vehicle.price_per_day}</span>
            <span className="text-xs text-text-dim block">/day</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5 text-text-dim">
            <Fuel size={14} className="text-primary" />
            <span className="text-xs">{vehicle.fuel_type}</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-dim">
            <Users size={14} className="text-primary" />
            <span className="text-xs">{vehicle.seating_capacity || 4} Seats</span>
          </div>
        </div>
      </div>

      <button 
        onClick={() => onBook(vehicle)}
        className="w-full h-12 glass border-primary/20 hover:bg-primary transition-all flex items-center justify-center gap-2 font-semibold text-sm group/btn"
      >
        View Details
        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default VehicleCard;
