import {
  MdDashboard,
  MdOutlineLocalOffer,
  MdOutlineQuestionAnswer,
  MdOutlineMailOutline,
  MdOutlineSettings,
  MdToday,
  MdCardGiftcard,
} from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { FaBoxOpen, FaUsers, FaTags, FaRegImages, FaRegCommentDots, FaFileAlt, FaBlog } from "react-icons/fa";
import { HiOutlineClipboardList } from "react-icons/hi";

// Sidebar navigation data consumed by Components/Common/SideBar/SideBar.jsx.
const adminSideBarData = [
  { label: "Dashboard", path: "/", icon: <MdDashboard /> },
  { label: "Products", path: "/products", icon: <FaBoxOpen /> },
  { label: "Categories", path: "/categories", icon: <BiCategory /> },
  {
    label: "Orders",
    icon: <HiOutlineClipboardList />,
    children: [
      { label: "All Orders", path: "/orders", icon: <HiOutlineClipboardList /> },
      { label: "Today's Orders", path: "/orders/today", icon: <MdToday /> },
    ],
  },
  { label: "Customers", path: "/customers", icon: <FaUsers /> },
  { label: "Coupons", path: "/coupons", icon: <FaTags /> },
  { label: "Hero Banners", path: "/hero-banners", icon: <FaRegImages /> },
  { label: "Testimonials", path: "/testimonials", icon: <FaRegCommentDots /> },
  { label: "Combo Offers", path: "/combo-offers", icon: <MdOutlineLocalOffer /> },
  { label: "Cart Rewards", path: "/cart-rewards", icon: <MdCardGiftcard /> },
  { label: "Blog Posts", path: "/blog-posts", icon: <FaBlog /> },
  { label: "FAQs", path: "/faqs", icon: <MdOutlineQuestionAnswer /> },
  { label: "Newsletter", path: "/newsletter-subscribers", icon: <MdOutlineMailOutline /> },
  { label: "CMS Pages", path: "/cms", icon: <FaFileAlt /> },
  { label: "Settings", path: "/settings", icon: <MdOutlineSettings /> },
];

export default adminSideBarData;
