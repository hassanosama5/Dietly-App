// src/services/adminService.js
import api from "./api"; //ZOOOMAA

export const adminService = {
  /** ======================
   *   DASHBOARD STATISTICS
   *  ====================== */

  // GET /api/v1/admin/stats
  getDashboardStats: () => api.get("/admin/stats"),

  /** ======================
   *        USERS
   *  ====================== */

  // GET /api/v1/admin/users
  getUsers: () => api.get("/admin/users"),

  // GET /api/v1/admin/users/:id
  getUserById: (id) => api.get(`/admin/users/${id}`),

  // PUT /api/v1/admin/users/:id
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),

  // DELETE /api/v1/admin/users/:id
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // GET /api/v1/admin/users/:id/stats
  getUserStats: (id) => api.get(`/admin/users/${id}/stats`),

  /** ======================
   *        MEALS
   *  ====================== */

  // GET /api/v1/admin/meals
  getAllMeals: () => api.get("/admin/meals"),

  // PUT /api/v1/admin/meals/:id/restore
  restoreMeal: (id) => api.put(`/admin/meals/${id}/restore`),

  /** ======================
   *      MEAL PLANS
   *  ====================== */

  // GET /api/v1/admin/meal-plans
  getAllMealPlans: () => api.get("/admin/meal-plans"),

  /** ======================
   *    RECOMMENDATIONS
   *  ====================== */

  // GET /api/v1/admin/recommendations
  getAllRecommendations: () => api.get("/admin/recommendations"),
};
