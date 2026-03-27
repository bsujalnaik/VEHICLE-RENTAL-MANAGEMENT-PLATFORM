"""
Availability service — checks for date conflicts on a vehicle.
"""
from models import Booking


def check_availability(vehicle_id, start, end):
    """
    Returns True if there IS a conflict (vehicle already booked),
    False if the vehicle is free for the given dates.
    """
    conflict = Booking.query.filter(
        Booking.vehicle_id == vehicle_id,
        Booking.status.in_(["BOOKED", "PAID", "PICKED_UP"]),
        Booking.start_date < end,
        Booking.end_date > start,
    ).first()

    return conflict is not None
