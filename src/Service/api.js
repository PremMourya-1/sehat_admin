import { apiJson, apiMultipart } from "./service";
import adminUrl from "./url";

// Single object grouping every admin endpoint by resource. Content-type
// (JSON vs multipart) is chosen per-call depending on whether the payload
// includes file uploads.
const adminApi = {
  // ---- auth ----
  adminLogin: (data) => apiJson.post(adminUrl.login, data),
  adminLogout: () => apiJson.post(adminUrl.logout),
  changePassword: (data) => apiJson.put(adminUrl.changePassword, data),

  // ---- dashboard ----
  getDashboardStats: () => apiJson.get(adminUrl.dashboard),
  getWalletBalance: () => apiJson.get(adminUrl.walletBalance),

  // ---- analytics ----
  getAnalyticsOverview: () => apiJson.get(adminUrl.analyticsOverview),
  getAnalyticsTrends: (days) => apiJson.get(adminUrl.analyticsTrends, { params: { days } }),
  getAnalyticsBreakdown: (params) => apiJson.get(adminUrl.analyticsBreakdown, { params }),
  getBestSellers: (params) => apiJson.get(adminUrl.analyticsBestSellers, { params }),

  // ---- inventory > sales reports ---- params: { startDate, endDate, productId?, categoryId?, sortBy?, sortDir? }
  getSalesReportByProduct: (params) => apiJson.get(adminUrl.salesReportByProduct, { params }),
  getSalesReportByDate: (params) => apiJson.get(adminUrl.salesReportByDate, { params }),

  // ---- product pricing ----
  // Also called directly by the product edit page's quick-adjust widget
  // (Pages/Product/ProductForm.jsx) with a single-item productIds array —
  // same endpoint, no separate one for the single-product case.
  getPricingPreview: (params) => apiJson.get(adminUrl.pricingPreview, { params }),
  bulkUpdatePricing: (data) => apiJson.post(adminUrl.pricingBulkUpdate, data),

  // ---- product ----
  getProducts: () => apiJson.get(adminUrl.product),
  getProductById: (id) => apiJson.get(adminUrl.productById(id)),
  createProduct: (formData) => apiMultipart.post(adminUrl.product, formData),
  updateProduct: (id, formData) => apiMultipart.put(adminUrl.productById(id), formData),
  deleteProduct: (id) => apiJson.delete(adminUrl.productById(id)),

  // ---- category ----
  getCategories: () => apiJson.get(adminUrl.category),
  createCategory: (formData) => apiMultipart.post(adminUrl.category, formData),
  updateCategory: (id, formData) => apiMultipart.put(adminUrl.categoryById(id), formData),
  deleteCategory: (id) => apiJson.delete(adminUrl.categoryById(id)),

  // ---- order ----
  getOrders: () => apiJson.get(adminUrl.order),
  getOrderById: (id) => apiJson.get(adminUrl.orderById(id)),
  updateOrderStatus: (id, status) => apiJson.put(adminUrl.orderStatus(id), { status }),
  bulkUpdateOrderStatus: (orderIds, status) => apiJson.put(adminUrl.orderBulkStatus, { orderIds, status }),
  generateOrderLabel: (id) => apiJson.post(adminUrl.orderGenerateLabel(id)),
  downloadOrderLabels: (orderIds) =>
    apiJson.post(adminUrl.orderDownloadLabels, { orderIds }, { responseType: "blob" }),
  simulateOrderStatus: (id, status) => apiJson.post(adminUrl.orderSimulateStatus(id), { status }),
  cancelOrder: (id, reason) => apiJson.post(adminUrl.orderCancel(id), { reason }),

  // ---- customer ----
  getCustomers: () => apiJson.get(adminUrl.customer),
  impersonateCustomer: (id) => apiJson.post(adminUrl.customerImpersonate(id)),

  // ---- coupon ----
  getCoupons: () => apiJson.get(adminUrl.coupon),
  createCoupon: (data) => apiJson.post(adminUrl.coupon, data),
  updateCoupon: (id, data) => apiJson.put(adminUrl.couponById(id), data),
  deleteCoupon: (id) => apiJson.delete(adminUrl.couponById(id)),

  // ---- hero banner ----
  getHeroBanners: () => apiJson.get(adminUrl.heroBanner),
  createHeroBanner: (formData) => apiMultipart.post(adminUrl.heroBanner, formData),
  updateHeroBanner: (id, formData) => apiMultipart.put(adminUrl.heroBannerById(id), formData),
  deleteHeroBanner: (id) => apiJson.delete(adminUrl.heroBannerById(id)),
  updateHeroBannerStatus: (id, status) => apiJson.put(adminUrl.heroBannerById(id), { status }),

  // ---- testimonial ----
  getTestimonials: () => apiJson.get(adminUrl.testimonial),
  createTestimonial: (formData) => apiMultipart.post(adminUrl.testimonial, formData),
  updateTestimonial: (id, formData) => apiMultipart.put(adminUrl.testimonialById(id), formData),
  deleteTestimonial: (id) => apiJson.delete(adminUrl.testimonialById(id)),
  updateTestimonialStatus: (id, status) => apiJson.put(adminUrl.testimonialById(id), { status }),

  // ---- cms ----
  getCmsPages: () => apiJson.get(adminUrl.cms),
  getCmsPageById: (id) => apiJson.get(adminUrl.cmsById(id)),
  updateCmsPage: (id, data) => apiJson.put(adminUrl.cmsById(id), data),

  // ---- combo offers ----
  getComboOffers: () => apiJson.get(adminUrl.comboOffer),
  createComboOffer: (data) => apiJson.post(adminUrl.comboOffer, data),
  updateComboOffer: (id, data) => apiJson.put(adminUrl.comboOfferById(id), data),
  deleteComboOffer: (id) => apiJson.delete(adminUrl.comboOfferById(id)),

  // ---- blog posts ----
  getBlogPosts: () => apiJson.get(adminUrl.blogPost),
  createBlogPost: (formData) => apiMultipart.post(adminUrl.blogPost, formData),
  updateBlogPost: (id, formData) => apiMultipart.put(adminUrl.blogPostById(id), formData),
  updateBlogPostStatus: (id, status) => apiJson.put(adminUrl.blogPostById(id), { status }),
  deleteBlogPost: (id) => apiJson.delete(adminUrl.blogPostById(id)),

  // ---- faqs ----
  getFaqs: () => apiJson.get(adminUrl.faq),
  createFaq: (data) => apiJson.post(adminUrl.faq, data),
  updateFaq: (id, data) => apiJson.put(adminUrl.faqById(id), data),
  deleteFaq: (id) => apiJson.delete(adminUrl.faqById(id)),

  // ---- product reviews (moderation only) ----
  getReviews: (status) => apiJson.get(adminUrl.review, { params: status ? { status } : undefined }),
  approveReview: (id) => apiJson.put(adminUrl.reviewApprove(id)),
  deleteReview: (id) => apiJson.delete(adminUrl.reviewById(id)),

  // ---- newsletter subscribers ----
  getNewsletterSubscribers: () => apiJson.get(adminUrl.newsletterSubscriber),
  deleteNewsletterSubscriber: (id) => apiJson.delete(adminUrl.newsletterSubscriberById(id)),

  // ---- integration settings ----
  getIntegrationSettings: (key) => apiJson.get(adminUrl.integrationSettings(key)),
  updateIntegrationSettings: (key, data) => apiJson.put(adminUrl.integrationSettings(key), data),
  sendTestWhatsappTemplate: (data) => apiJson.post(adminUrl.whatsappTestSend, data),

  // ---- web settings ----
  getWebSettings: () => apiJson.get(adminUrl.webSettings),
  updateWebSettings: (data) => apiJson.put(adminUrl.webSettings, data),

  // ---- notifications ----
  getNotifications: (params) => apiJson.get(adminUrl.notifications, { params }),
  markNotificationRead: (id) => apiJson.patch(adminUrl.notificationRead(id)),
  markAllNotificationsRead: () => apiJson.patch(adminUrl.notificationMarkAllRead),

  // ---- shipping zones ----
  getShippingZones: () => apiJson.get(adminUrl.shippingZone),
  createShippingZone: (data) => apiJson.post(adminUrl.shippingZone, data),
  updateShippingZone: (id, data) => apiJson.put(adminUrl.shippingZoneById(id), data),
  deleteShippingZone: (id) => apiJson.delete(adminUrl.shippingZoneById(id)),

  // ---- cart reward tiers ----
  getCartRewards: () => apiJson.get(adminUrl.cartReward),
  createCartReward: (data) => apiJson.post(adminUrl.cartReward, data),
  updateCartReward: (id, data) => apiJson.put(adminUrl.cartRewardById(id), data),
  deleteCartReward: (id) => apiJson.delete(adminUrl.cartRewardById(id)),

  // ---- cart housekeeping ----
  cleanupAbandonedCarts: () => apiJson.post(adminUrl.cartsCleanupAbandoned),

  // ---- abandoned checkouts (read-only) ----
  getAbandonedCheckouts: () => apiJson.get(adminUrl.abandonedCheckout),
};

export default adminApi;
