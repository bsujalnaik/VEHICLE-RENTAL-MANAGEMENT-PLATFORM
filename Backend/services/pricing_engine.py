"""
Pricing engine — calculates total booking cost.
Formula: base_rate × days + seasonal_multiplier + weekend_fee − coupon + late_fee
"""
from datetime import datetime, timedelta
from models import PricingRule


def calculate_price(vehicle, start: datetime, end: datetime) -> float:
    """
    Calculate the total price for a booking.

    Steps:
      1. Base cost  = price_per_day × number of days
      2. Apply seasonal multiplier if active rule matches the dates
      3. Add weekend surcharge for Saturday/Sunday days
    """
    # ── 1. Base cost ──────────────────────────
    total_days = (end - start).days
    if total_days < 1:
        total_hours = (end - start).total_seconds() / 3600
        base_cost = vehicle.price_per_hour * total_hours
    else:
        base_cost = vehicle.price_per_day * total_days

    # ── 2. Seasonal multiplier ────────────────
    seasonal_rules = PricingRule.query.filter_by(type="seasonal", active=True).all()
    for rule in seasonal_rules:
        if rule.start_date and rule.end_date:
            if rule.start_date <= start.date() <= rule.end_date:
                base_cost *= rule.multiplier
                break  # apply first matching rule

    # ── 3. Weekend surcharge ──────────────────
    weekend_rule = PricingRule.query.filter_by(type="weekend", active=True).first()
    if weekend_rule:
        weekend_days = 0
        current = start
        while current < end:
            if current.weekday() in (5, 6):  # Saturday=5, Sunday=6
                weekend_days += 1
            current += timedelta(days=1)
        if weekend_days > 0:
            weekend_surcharge = vehicle.price_per_day * weekend_days * (weekend_rule.multiplier - 1)
            base_cost += weekend_surcharge

    return round(base_cost, 2)
