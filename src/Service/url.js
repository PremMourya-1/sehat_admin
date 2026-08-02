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

  // newsletter subscribers
  newsletterSubscriber: "/newsletter-subscribers",
  newsletterSubscriberById: (id) => `/newsletter-subscribers/${id}`,

  // integration settings (Shiprocket today; generic by key for future integrations)
  integrationSettings: (key) => `/integrations/${key}`,

  // web settings (site-wide business settings — COD toggle today)
  webSettings: "/web-settings",
};

export default adminUrl;
