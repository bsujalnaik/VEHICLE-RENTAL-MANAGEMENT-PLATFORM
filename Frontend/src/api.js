const API_BASE = "/api";
const DEFAULT_CREDS = {
  admin: { email: "admin@rental.com", password: "admin123" },
  fleet_manager: { email: "fleet1@rental.com", password: "fleet123" },
  customer: { email: "customer1@rental.com", password: "cust123" },
};

async function request(path, method = "GET", token = "", body = null) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  const raw = await res.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    const message = data.error || `${method} ${API_BASE}${path} failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", "POST", "", payload),
  login: (email, password) => request("/auth/login", "POST", "", { email, password }),
  logout: (token) => request("/auth/logout", "POST", token),
  vehicles: (token, typeFilter = "") =>
    request(`/vehicles${typeFilter ? `?type=${encodeURIComponent(typeFilter)}` : ""}`, "GET", token),
  vehicleAvailability: (token, vehicleId, startDatetime, endDatetime) =>
    request(
      `/vehicles/${vehicleId}/availability?start_datetime=${encodeURIComponent(startDatetime)}&end_datetime=${encodeURIComponent(endDatetime)}`,
      "GET",
      token
    ),
  estimateBooking: (token, payload) => request("/bookings/estimate", "POST", token, payload),
  createBooking: (token, payload) => request("/bookings", "POST", token, payload),
  cancelBooking: (token, rentalId) => request(`/bookings/${rentalId}/cancel`, "PATCH", token),
  myBookings: (token) => request("/bookings/me", "GET", token),
  assignedBookings: (token) => request("/bookings/assigned", "GET", token),
  updateBookingStatus: (token, rentalId, payload) =>
    request(`/bookings/${rentalId}/status`, "PATCH", token, payload),
  users: (token) => request("/admin/users", "GET", token),
  adminCreateUser: (token, payload) => request("/admin/users", "POST", token, payload),
  adminDeleteUser: (token, userId) => request(`/admin/users/${userId}`, "DELETE", token),
  adminVehicles: (token) => request("/admin/vehicles", "GET", token),
  adminCreateVehicle: (token, payload) => request("/admin/vehicles", "POST", token, payload),
  adminUpdateVehicle: (token, vehicleId, payload) => request(`/admin/vehicles/${vehicleId}`, "PUT", token, payload),
  adminDeleteVehicle: (token, vehicleId) => request(`/admin/vehicles/${vehicleId}`, "DELETE", token),
  assignments: (token) => request("/admin/fleet-assignments", "GET", token),
  assignVehicle: (token, payload) => request("/admin/fleet-assignments", "POST", token, payload),
  unassignVehicle: (token, assignmentId) => request(`/admin/fleet-assignments/${assignmentId}`, "DELETE", token),
  maintenance: (token) => request("/maintenance", "GET", token),
  createMaintenance: (token, payload) => request("/maintenance", "POST", token, payload),
  updateMaintenance: (token, logId, payload) => request(`/maintenance/${logId}`, "PUT", token, payload),
  deleteMaintenance: (token, logId) => request(`/maintenance/${logId}`, "DELETE", token),
  credentials: async () => DEFAULT_CREDS,
};
