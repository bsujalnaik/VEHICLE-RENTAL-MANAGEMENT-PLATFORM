"""
Booking engine — state machine for booking lifecycle.
BOOKED → PAID → PICKED_UP → RETURNED → CLOSED
"""

# Valid transitions: current_status → set of allowed next statuses
TRANSITIONS = {
    "BOOKED":    {"PAID", "CANCELLED"},
    "PAID":      {"PICKED_UP", "CANCELLED"},
    "PICKED_UP": {"RETURNED"},
    "RETURNED":  {"CLOSED"},
    "CLOSED":    set(),        # terminal state
    "CANCELLED": set(),        # terminal state
}


def transition_status(booking, new_status: str) -> tuple:
    """
    Attempt to move a booking to a new status.

    Returns:
        (True, None) on success — booking.status is updated in-memory.
        (False, error_message) on failure.
    """
    current = booking.status
    allowed = TRANSITIONS.get(current, set())

    if new_status not in allowed:
        return False, f"Cannot transition from '{current}' to '{new_status}'"

    booking.status = new_status
    return True, None
