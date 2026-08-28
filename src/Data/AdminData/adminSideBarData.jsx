import {
  MdDashboard,
  MdOutlineLocalOffer,
  MdOutlineQuestionAnswer,
  MdOutlineMailOutline,
  MdOutlineSettings,
  MdToday,
  MdCardGiftcard,
  MdOutlineSell,
  MdOutlineRemoveShoppingCart,
} from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import {
  FaBoxOpen,
  FaUsers,
  FaTags,
  FaRegImages,
  FaRegCommentDots,
  FaFileAlt,
  FaBlog,
  FaRegStar,
  FaMoneyBillWave,
} from "react-icons/fa";
import { HiOutlineClipboardList } from "react-icons/hi";

// Sidebar navigation data consumed by Components/Common/SideBar/SideBar.jsx.
// `group` renders a small uppercase label above the first item that
// carries it — items sharing the same group string are visually clustered
// together. Dashboard has no group (sits alone at the top); everything
// else is bucketed so a 15-item flat list doesn't read as one undifferentiated
// wall of links.
const adminSideBarData = [
  { label: "Dashboard", path: "/", icon: <MdDashboard /> },

  {
    label: "Products",
    icon: <FaBoxOpen />,
    group: "Catalog",
    children: [
      { label: "Products", path: "/products", icon: <FaBoxOpen /> },
      { label: "Pricing", path: "/products/pricing", icon: <MdOutlineSell /> },
    ],
  },
  { label: "Categories", path: "/categories", icon: <BiCategory />, group: "Catalog" },
  { label: "Combo Offers", path: "/combo-offers", icon: <MdOutlineLocalOffer />, group: "Catalog" },
  { label: "Cart Rewards", path: "/cart-rewards", icon: <MdCardGiftcard />, group: "Catalog" },

  {
    label: "Orders",
    icon: <HiOutlineClipboardList />,
    group: "Sales",
    children: [
      { label: "All Orders", path: "/orders", icon: <HiOutlineClipboardList /> },
      { label: "Today's Orders", path: "/orders/today", icon: <MdToday /> },
    ],
  },
  {
    label: "Abandoned Checkouts",
    path: "/abandoned-checkouts",
    icon: <MdOutlineRemoveShoppingCart />,
    group: "Sales",
  },
  { label: "Coupons", path: "/coupons", icon: <FaTags />, group: "Sales" },
  { label: "Customers", path: "/customers", icon: <FaUsers />, group: "Sales" },

  { label: "Hero Banners", path: "/hero-banners", icon: <FaRegImages />, group: "Content" },
  { label: "Testimonials", path: "/testimonials", icon: <FaRegCommentDots />, group: "Content" },
  { label: "Reviews", path: "/reviews", icon: <FaRegStar />, group: "Content" },
  { label: "Blog Posts", path: "/blog-posts", icon: <FaBlog />, group: "Content" },
  { label: "FAQs", path: "/faqs", icon: <MdOutlineQuestionAnswer />, group: "Content" },
  { label: "CMS Pages", path: "/cms", icon: <FaFileAlt />, group: "Content" },
  { label: "Newsletter", path: "/newsletter-subscribers", icon: <MdOutlineMailOutline />, group: "Content" },

  // Finance (Expenses + Sales tracking) is a completely separate mini-app
  // with its own login (see Pages/Finance/ and Routes/Route.jsx) — this
  // link just makes it reachable from here instead of only via a direct
  // URL. Clicking it navigates away from AdminLayout entirely (Finance
  // pages render their own FinanceHeader, not this sidebar) — /finance
  // itself redirects to /finance/expenses.
  { label: "Finance", path: "/finance", icon: <FaMoneyBillWave />, group: "Finance" },

  { label: "Settings", path: "/settings", icon: <MdOutlineSettings />, group: "System" },
];

export default adminSideBarData;
