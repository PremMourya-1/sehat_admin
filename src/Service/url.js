// Flat object of endpoint path segments. All paths are relative to
// VITE_API_BASE_URL (http://localhost:4000/api/admin) since the backend
// mounts every admin sub-resource behind a single mega-router.
const adminUrl = {
  // auth
  login: "/login",
  logout: "/logout",
  changePassword: "/change-password",

  // dashboard
  dashboard: "/dashboard",
  walletBalance: "/dashboard/wallet-balance",

  // analytics
  analyticsOverview: "/analytics/overview",
  analyticsTrends: "/analytics/trends",
  analyticsBreakdown: "/analytics/breakdown",
  analyticsBestSellers: "/analytics/best-sellers",

  // product pricing ("Manage Product Pricing" bulk/quick price adjustment tool)
  pricingPreview: "/pricing/preview",
  pricingBulkUpdate: "/pricing/bulk-update",

  // product
  product: "/products",
  productById: (id) => `/products/${id}`,

  // category
  category: "/categories",
  categoryById: (id) => `/categories/${id}`,

  // order
  order: "/orders",
  orderById: (id) => `/orders/${id}`,
  orderStatus: (id) => `/orders/${id}/status`,
  orderBulkStatus: "/orders/bulk-status",
  orderGenerateLabel: (id) => `/orders/${id}/generate-label`,
  orderDownloadLabels: "/orders/download-labels",
  orderSimulateStatus: (id) => `/orders/${id}/simulate-status`,
  orderCancel: (id) => `/orders/${id}/cancel`,

  // customer
  customer: "/customers",

  // coupon
  coupon: "/coupons",
  couponById: (id) => `/coupons/${id}`,

  // hero banner
  heroBanner: "/hero-banners",
  heroBannerById: (id) => `/hero-banners/${id}`,

  // testimonial
  testimonial: "/testimonials",
  testimonialById: (id) => `/testimonials/${id}`,

  // cms
  cms: "/cms",
  cmsById: (id) => `/cms/${id}`,

  // combo offers
  comboOffer: "/combo-offers",
  comboOfferById: (id) => `/combo-offers/${id}`,

  // blog posts
  blogPost: "/blog-posts",
  blogPostById: (id) => `/blog-posts/${id}`,

  // faqs
  faq: "/faqs",
  faqById: (id) => `/faqs/${id}`,

  // product reviews (moderation only)
  review: "/reviews",
  reviewApprove: (id) => `/reviews/${id}/approve`,
  reviewById: (id) => `/reviews/${id}`,

  // newsletter subscribers
  newsletterSubscriber: "/newsletter-subscribers",
  newsletterSubscriberById: (id) => `/newsletter-subscribers/${id}`,

  // integration settings (Shiprocket today; generic by key for future integrations)
  integrationSettings: (key) => `/integrations/${key}`,

  // web settings (site-wide business settings — COD toggle, notification delivery channels)
  webSettings: "/web-settings",

  // notifications (new-order alerts)
  notifications: "/notifications",
  notificationRead: (id) => `/notifications/${id}/read`,
  notificationMarkAllRead: "/notifications/mark-all-read",

  // shipping zones (checkout shipping charge)
  shippingZone: "/shipping-zones",
  shippingZoneById: (id) => `/shipping-zones/${id}`,

  // cart reward tiers ("spend ₹X, get a free gift")
  cartReward: "/cart-rewards",
  cartRewardById: (id) => `/cart-rewards/${id}`,

  // cart housekeeping
  cartsCleanupAbandoned: "/carts/cleanup-abandoned",

  // abandoned checkouts (prepaid checkout attempts before payment succeeds)
  abandonedCheckout: "/abandoned-checkouts",
};

export default adminUrl;
