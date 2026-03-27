import React, { useEffect, useState } from "react";
import { api } from "./api";

function LoginScreen({ onLogin, onRegister, creds, loading, error }) {
  const [loginForm, setLoginForm] = useState({ email: "customer1@rental.com", password: "cust123" });
  const [reg, setReg] = useState({ name: "", email: "", password: "", driving_license_number: "", phone: "" });
  const [regMsg, setRegMsg] = useState("");

  const register = async () => {
    setRegMsg("");
    try {
      await onRegister(reg);
      setRegMsg("Registration successful. You can login now.");
      setReg({ name: "", email: "", password: "", driving_license_number: "", phone: "" });
    } catch (e) {
      setRegMsg(e.message);
    }
  };

  return (
    <div className="container">
      <h1>Vehicle Rental Management Platform</h1>
      <div className="card">
        <h3>Login</h3>
        <label>Email</label>
        <input value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
        <label>Password</label>
        <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
        <button onClick={() => onLogin(loginForm.email, loginForm.password)} disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="card">
        <h3>Register as Customer</h3>
        <label>Name</label>
        <input value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} />
        <label>Email</label>
        <input value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} />
        <label>Password</label>
        <input type="password" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} />
        <label>Driving License Number</label>
        <input value={reg.driving_license_number} onChange={(e) => setReg({ ...reg, driving_license_number: e.target.value })} />
        <label>Phone</label>
        <input value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} />
        <button onClick={register}>Register</button>
        {regMsg && <p className={regMsg.includes("successful") ? "success" : "error"}>{regMsg}</p>}
      </div>
      <div className="card">
        <h3>Test Credentials</h3>
        <p>Admin: {creds?.admin?.email} / {creds?.admin?.password}</p>
        <p>Fleet Manager: {creds?.fleet_manager?.email} / {creds?.fleet_manager?.password}</p>
        <p>Customer: {creds?.customer?.email} / {creds?.customer?.password}</p>
      </div>
    </div>
  );
}

function CustomerPanel({ token }) {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [msg, setMsg] = useState("");
  const [availability, setAvailability] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [form, setForm] = useState({ vehicle_id: "", start_datetime: "", end_datetime: "", payment_mode: "cash", coupon_code: "" });

  const load = async () => {
    const [v, b] = await Promise.all([api.vehicles(token), api.myBookings(token)]);
    setVehicles(v);
    setBookings(b);
  };
  useEffect(() => { load().catch((e) => setMsg(e.message)); }, []);

  const checkAvailability = async () => {
    try {
      const res = await api.vehicleAvailability(token, form.vehicle_id, form.start_datetime, form.end_datetime);
      setAvailability(res);
      setMsg(res.available ? "Vehicle available in selected calendar slot." : "Vehicle is not available.");
    } catch (e) {
      setMsg(e.message);
    }
  };
  const runEstimate = async () => {
    try {
      setEstimate(await api.estimateBooking(token, form));
      setMsg("");
    } catch (e) {
      setMsg(e.message);
    }
  };
  const createBooking = async () => {
    try {
      const data = await api.createBooking(token, form);
      setMsg(`Booking created. Amount payable: Rs ${data.total_cost}`);
      setEstimate(null);
      await load();
    } catch (e) {
      setMsg(e.message);
    }
  };
  const cancelBooking = async (id) => {
    try {
      await api.cancelBooking(token, id);
      setMsg("Booking cancelled");
      await load();
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <div className="container">
      <h2>Customer Dashboard</h2>
      <div className="card">
        <h3>Vehicles</h3>
        <table><thead><tr><th>ID</th><th>Vehicle</th><th>Type</th><th>Status</th><th>Price/day</th></tr></thead><tbody>
          {vehicles.map((v) => <tr key={v.vehicle_id}><td>{v.vehicle_id}</td><td>{v.brand} {v.model}</td><td>{v.type}</td><td>{v.availability_status}</td><td>{v.price_per_day}</td></tr>)}
        </tbody></table>
      </div>
      <div className="card">
        <h3>Calendar Booking</h3>
        <label>Vehicle ID</label><input value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })} />
        <label>Start</label><input type="datetime-local" value={form.start_datetime} onChange={(e) => setForm({ ...form, start_datetime: e.target.value })} />
        <label>End</label><input type="datetime-local" value={form.end_datetime} onChange={(e) => setForm({ ...form, end_datetime: e.target.value })} />
        <label>Payment Mode</label><select value={form.payment_mode} onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}><option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option></select>
        <label>Coupon (optional)</label><input value={form.coupon_code} onChange={(e) => setForm({ ...form, coupon_code: e.target.value })} />
        <div className="row"><button onClick={checkAvailability}>Check Availability</button><button onClick={runEstimate}>Estimate</button></div>
        <button onClick={createBooking}>Book Now</button>
        {availability && !availability.available && <p className="error">Conflicts: {availability.conflicts.map((c) => `#${c.rental_id} (${c.start_datetime} to ${c.end_datetime})`).join(", ")}</p>}
        {estimate && <p className="success">Estimated amount: Rs {estimate.estimated_total}</p>}
      </div>
      <div className="card">
        <h3>My Bookings</h3>
        <table><thead><tr><th>ID</th><th>Vehicle</th><th>Status</th><th>Payment</th><th>Total</th><th>Action</th></tr></thead><tbody>
          {bookings.map((b) => <tr key={b.rental_id}><td>{b.rental_id}</td><td>{b.brand} {b.model}</td><td>{b.rental_status}</td><td>{b.payment_status}</td><td>{b.total_cost}</td><td>{b.rental_status === "booked" ? <button onClick={() => cancelBooking(b.rental_id)}>Cancel</button> : "-"}</td></tr>)}
        </tbody></table>
      </div>
      {msg && <p className={msg.includes("created") || msg.includes("available") || msg.includes("cancelled") ? "success" : "error"}>{msg}</p>}
    </div>
  );
}

function FleetPanel({ token }) {
  const [bookings, setBookings] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [msg, setMsg] = useState("");
  const [statusForm, setStatusForm] = useState({ rentalId: "", rental_status: "", payment_status: "" });
  const [maintForm, setMaintForm] = useState({ vehicle_id: "", maintenance_type: "routine", description: "", cost: "", maintenance_date: "", next_due_date: "" });

  const load = async () => {
    const [b, m] = await Promise.all([api.assignedBookings(token), api.maintenance(token)]);
    setBookings(b);
    setMaintenance(m);
  };
  useEffect(() => { load().catch((e) => setMsg(e.message)); }, []);
  const updateStatus = async () => {
    try {
      await api.updateBookingStatus(token, statusForm.rentalId, { rental_status: statusForm.rental_status || undefined, payment_status: statusForm.payment_status || undefined });
      setMsg("Booking updated");
      await load();
    } catch (e) { setMsg(e.message); }
  };
  const addMaintenance = async () => {
    try {
      await api.createMaintenance(token, maintForm);
      setMsg("Maintenance added");
      await load();
    } catch (e) { setMsg(e.message); }
  };
  const deleteLog = async (id) => {
    try {
      await api.deleteMaintenance(token, id);
      setMsg("Maintenance log deleted");
      await load();
    } catch (e) { setMsg(e.message); }
  };

  return (
    <div className="container">
      <h2>Fleet Manager Dashboard</h2>
      <div className="card">
        <h3>Assigned Rentals</h3>
        <table><thead><tr><th>ID</th><th>Customer</th><th>Vehicle</th><th>Status</th><th>Payment</th><th>Total</th></tr></thead><tbody>
          {bookings.map((b) => <tr key={b.rental_id}><td>{b.rental_id}</td><td>{b.customer_name}</td><td>{b.brand} {b.model}</td><td>{b.rental_status}</td><td>{b.payment_status}</td><td>{b.total_cost}</td></tr>)}
        </tbody></table>
      </div>
      <div className="card">
        <h3>Update Booking Status/Payment</h3>
        <label>Rental ID</label><input value={statusForm.rentalId} onChange={(e) => setStatusForm({ ...statusForm, rentalId: e.target.value })} />
        <label>Rental Status</label><select value={statusForm.rental_status} onChange={(e) => setStatusForm({ ...statusForm, rental_status: e.target.value })}><option value="">No change</option><option value="picked_up">picked_up</option><option value="returned">returned</option><option value="cancelled">cancelled</option></select>
        <label>Payment Status</label><select value={statusForm.payment_status} onChange={(e) => setStatusForm({ ...statusForm, payment_status: e.target.value })}><option value="">No change</option><option value="pending">pending</option><option value="paid">paid</option><option value="refunded">refunded</option></select>
        <button onClick={updateStatus}>Update</button>
      </div>
      <div className="card">
        <h3>Maintenance CRUD</h3>
        <label>Vehicle ID</label><input value={maintForm.vehicle_id} onChange={(e) => setMaintForm({ ...maintForm, vehicle_id: e.target.value })} />
        <label>Type</label><select value={maintForm.maintenance_type} onChange={(e) => setMaintForm({ ...maintForm, maintenance_type: e.target.value })}><option value="routine">routine</option><option value="repair">repair</option><option value="inspection">inspection</option><option value="cleaning">cleaning</option></select>
        <label>Description</label><input value={maintForm.description} onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })} />
        <label>Cost</label><input value={maintForm.cost} onChange={(e) => setMaintForm({ ...maintForm, cost: e.target.value })} />
        <label>Maintenance Date</label><input type="date" value={maintForm.maintenance_date} onChange={(e) => setMaintForm({ ...maintForm, maintenance_date: e.target.value })} />
        <label>Next Due Date</label><input type="date" value={maintForm.next_due_date} onChange={(e) => setMaintForm({ ...maintForm, next_due_date: e.target.value })} />
        <button onClick={addMaintenance}>Add Maintenance</button>
        <table><thead><tr><th>Log ID</th><th>Vehicle</th><th>Type</th><th>Date</th><th>Action</th></tr></thead><tbody>
          {maintenance.map((m) => <tr key={m.log_id}><td>{m.log_id}</td><td>{m.registration_number}</td><td>{m.maintenance_type}</td><td>{m.maintenance_date}</td><td><button onClick={() => deleteLog(m.log_id)}>Delete</button></td></tr>)}
        </tbody></table>
      </div>
      {msg && <p className={msg.includes("updated") || msg.includes("added") || msg.includes("deleted") ? "success" : "error"}>{msg}</p>}
    </div>
  );
}

function AdminPanel({ token }) {
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [msg, setMsg] = useState("");
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "fleet_manager", driving_license_number: "", assigned_zone: "" });
  const [vehicleForm, setVehicleForm] = useState({ type: "car", brand: "", model: "", fuel_type: "petrol", seating_capacity: 4, price_per_hour: 100, price_per_day: 1000, availability_status: "available", registration_number: "" });
  const [assignForm, setAssignForm] = useState({ fleet_manager_id: "", vehicle_id: "" });

  const load = async () => {
    const [u, v, a] = await Promise.all([api.users(token), api.adminVehicles(token), api.assignments(token)]);
    setUsers(u); setVehicles(v); setAssignments(a);
  };
  useEffect(() => { load().catch((e) => setMsg(e.message)); }, []);
  const createUser = async () => { try { await api.adminCreateUser(token, userForm); setMsg("User created"); await load(); } catch (e) { setMsg(e.message); } };
  const deleteUser = async (id) => { try { await api.adminDeleteUser(token, id); setMsg("User deleted"); await load(); } catch (e) { setMsg(e.message); } };
  const createVehicle = async () => { try { await api.adminCreateVehicle(token, vehicleForm); setMsg("Vehicle created"); await load(); } catch (e) { setMsg(e.message); } };
  const deleteVehicle = async (id) => { try { await api.adminDeleteVehicle(token, id); setMsg("Vehicle deleted"); await load(); } catch (e) { setMsg(e.message); } };
  const assign = async () => { try { await api.assignVehicle(token, assignForm); setMsg("Vehicle assigned"); await load(); } catch (e) { setMsg(e.message); } };
  const unassign = async (id) => { try { await api.unassignVehicle(token, id); setMsg("Assignment removed"); await load(); } catch (e) { setMsg(e.message); } };

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <div className="card">
        <h3>Create Admin/Fleet Manager/Customer</h3>
        <label>Name</label><input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
        <label>Email</label><input value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
        <label>Password</label><input value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
        <label>Role</label><select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}><option value="admin">admin</option><option value="fleet_manager">fleet_manager</option><option value="customer">customer</option></select>
        <label>Driving License (for customer)</label><input value={userForm.driving_license_number} onChange={(e) => setUserForm({ ...userForm, driving_license_number: e.target.value })} />
        <label>Assigned Zone (for fleet manager)</label><input value={userForm.assigned_zone} onChange={(e) => setUserForm({ ...userForm, assigned_zone: e.target.value })} />
        <button onClick={createUser}>Create User</button>
      </div>
      <div className="card">
        <h3>Users (delete customer/fleet manager)</h3>
        <table><thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Email</th><th>Action</th></tr></thead><tbody>
          {users.map((u) => <tr key={u.user_id}><td>{u.user_id}</td><td>{u.name}</td><td>{u.role}</td><td>{u.email}</td><td>{u.role !== "admin" ? <button onClick={() => deleteUser(u.user_id)}>Delete</button> : "-"}</td></tr>)}
        </tbody></table>
      </div>
      <div className="card">
        <h3>Vehicle CRUD</h3>
        <label>Type</label><select value={vehicleForm.type} onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}><option value="car">car</option><option value="bike">bike</option><option value="van">van</option></select>
        <label>Brand</label><input value={vehicleForm.brand} onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })} />
        <label>Model</label><input value={vehicleForm.model} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })} />
        <label>Fuel</label><select value={vehicleForm.fuel_type} onChange={(e) => setVehicleForm({ ...vehicleForm, fuel_type: e.target.value })}><option value="petrol">petrol</option><option value="diesel">diesel</option><option value="electric">electric</option><option value="cng">cng</option></select>
        <label>Seats</label><input value={vehicleForm.seating_capacity} onChange={(e) => setVehicleForm({ ...vehicleForm, seating_capacity: Number(e.target.value) })} />
        <label>Price/Hour</label><input value={vehicleForm.price_per_hour} onChange={(e) => setVehicleForm({ ...vehicleForm, price_per_hour: Number(e.target.value) })} />
        <label>Price/Day</label><input value={vehicleForm.price_per_day} onChange={(e) => setVehicleForm({ ...vehicleForm, price_per_day: Number(e.target.value) })} />
        <label>Registration Number</label><input value={vehicleForm.registration_number} onChange={(e) => setVehicleForm({ ...vehicleForm, registration_number: e.target.value })} />
        <button onClick={createVehicle}>Add Vehicle</button>
        <table><thead><tr><th>ID</th><th>Vehicle</th><th>Status</th><th>Reg No</th><th>Action</th></tr></thead><tbody>
          {vehicles.map((v) => <tr key={v.vehicle_id}><td>{v.vehicle_id}</td><td>{v.brand} {v.model}</td><td>{v.availability_status}</td><td>{v.registration_number}</td><td><button onClick={() => deleteVehicle(v.vehicle_id)}>Delete</button></td></tr>)}
        </tbody></table>
      </div>
      <div className="card">
        <h3>Assign Vehicles to Fleet Manager</h3>
        <label>Fleet Manager ID</label><input value={assignForm.fleet_manager_id} onChange={(e) => setAssignForm({ ...assignForm, fleet_manager_id: e.target.value })} />
        <label>Vehicle ID</label><input value={assignForm.vehicle_id} onChange={(e) => setAssignForm({ ...assignForm, vehicle_id: e.target.value })} />
        <button onClick={assign}>Assign</button>
        <table><thead><tr><th>ID</th><th>Manager</th><th>Vehicle</th><th>Active</th><th>Action</th></tr></thead><tbody>
          {assignments.map((a) => <tr key={a.assignment_id}><td>{a.assignment_id}</td><td>{a.fleet_manager_name}</td><td>{a.registration_number}</td><td>{String(a.is_active)}</td><td><button onClick={() => unassign(a.assignment_id)}>Unassign</button></td></tr>)}
        </tbody></table>
      </div>
      {msg && <p className={msg.toLowerCase().includes("error") ? "error" : "success"}>{msg}</p>}
    </div>
  );
}

export default function App() {
  const [creds, setCreds] = useState(null);
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { api.credentials().then(setCreds).catch(() => {}); }, []);

  const onLogin = async (email, password) => {
    setLoading(true); setError("");
    try {
      const data = await api.login(email, password);
      setToken(data.token); setUser(data.user);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  const onRegister = async (payload) => api.register(payload);
  const logout = async () => {
    try { await api.logout(token); } catch (_) {}
    setUser(null); setToken("");
  };

  if (!user) return <LoginScreen onLogin={onLogin} onRegister={onRegister} creds={creds} loading={loading} error={error} />;
  return (
    <>
      <div className="topbar"><span>{user.name} ({user.role})</span><button onClick={logout}>Logout</button></div>
      {user.role === "customer" && <CustomerPanel token={token} />}
      {user.role === "fleet_manager" && <FleetPanel token={token} />}
      {user.role === "admin" && <AdminPanel token={token} />}
    </>
  );
}
