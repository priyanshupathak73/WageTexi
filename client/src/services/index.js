import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

export const vehicleService = {
  getAll: (params) => api.get('/vehicles', { params }),
  getOne: (id) => api.get(`/vehicles/${id}`),
  getMy: () => api.get('/vehicles/my/list'),
  create: (data) => api.post('/vehicles', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const bookingService = {
  create: (data) => api.post('/bookings', data),
  getMy: (params) => api.get('/bookings/my', { params }),
  getRequests: (params) => api.get('/bookings/requests', { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  respond: (id, data) => api.put(`/bookings/${id}/respond`, data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  complete: (id) => api.put(`/bookings/${id}/complete`),
  updatePayment: (id, data) => api.put(`/bookings/${id}/payment`, data),
  getOwnerDashboard: () => api.get('/bookings/dashboard/owner'),
  getDriverDashboard: () => api.get('/bookings/dashboard/driver'),
};

export const reviewService = {
  create: (data) => api.post('/reviews', data),
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  verifyUser: (id) => api.put(`/admin/users/${id}/verify`),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  verifyVehicle: (id) => api.put(`/admin/vehicles/${id}/verify`),
};

export const matchService = {
  getMatchedVehicles: () => api.get('/match/vehicles'),
};

export const pricingService = {
  getDynamicPrice: (vehicleId) => api.get(`/vehicles/${vehicleId}/price`),
};

export const performanceService = {
  getPerformance: (driverId) => api.get(`/drivers/${driverId}/performance`),
};

export const contractService = {
  create: (bookingId) => api.post('/contracts/create', { bookingId }),
  getByBooking: (bookingId) => api.get(`/contracts/booking`, { params: { booking: bookingId } }),
  getById: (id) => api.get(`/contracts/${id}`),
  sign: (id) => api.patch(`/contracts/${id}/sign`),
};

export const locationService = {
  updateLocation: (data) => api.post('/location/update', data),
  getTripLocation: (bookingId) => api.get(`/location/trip/${bookingId}`),
  stopTracking: (bookingId) => api.patch(`/location/trip/${bookingId}/stop`),
};
