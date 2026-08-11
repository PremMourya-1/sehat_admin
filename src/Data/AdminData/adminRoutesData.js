import Category from "../../Pages/Category/Category";
import Cms from "../../Pages/Cms/Cms";
import Coupon from "../../Pages/Coupon/Coupon";
import Customers from "../../Pages/Customers/Customers";
import Dashboard from "../../Pages/Dashboard/Dashboard";
import HeroBanner from "../../Pages/HeroBanner/HeroBanner";
import Orders from "../../Pages/Orders/Orders";
import TodayOrders from "../../Pages/Orders/TodayOrders";
import OrderView from "../../Pages/Orders/OrderView";
import ProductAdd from "../../Pages/Product/ProductAdd";
import ProductEdit from "../../Pages/Product/ProductEdit";
import Product from "../../Pages/Product/Product";
import ProductView from "../../Pages/Product/ProductView";
import Testimonial from "../../Pages/Testimonial/Testimonial";
import ComboOffer from "../../Pages/ComboOffer/ComboOffer";
import BlogPost from "../../Pages/BlogPost/BlogPost";
import Faq from "../../Pages/Faq/Faq";
import Newsletter from "../../Pages/Newsletter/Newsletter";
import Settings from "../../Pages/Settings/Settings";

// Data-driven route table consumed by Routes/Route.jsx. Each entry is
// rendered as a nested <Route> under the ProtectedRoute > AdminLayout shell.
const adminRoutes = [
  { path: "", element: Dashboard },
  { path: "products", element: Product },
  { path: "products/add", element: ProductAdd },
  { path: "products/edit/:id", element: ProductEdit },
  { path: "products/view/:id", element: ProductView },
  { path: "categories", element: Category },
  { path: "orders", element: Orders },
  { path: "orders/today", element: TodayOrders },
  { path: "orders/:id", element: OrderView },
  { path: "customers", element: Customers },
  { path: "coupons", element: Coupon },
  { path: "hero-banners", element: HeroBanner },
  { path: "testimonials", element: Testimonial },
  { path: "cms", element: Cms },
  { path: "combo-offers", element: ComboOffer },
  { path: "blog-posts", element: BlogPost },
  { path: "faqs", element: Faq },
  { path: "newsletter-subscribers", element: Newsletter },
  { path: "settings", element: Settings },
];

export default adminRoutes;
