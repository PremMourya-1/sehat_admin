import { MdDashboard, MdOutlineLocalOffer, MdOutlineQuestionAnswer, MdOutlineMailOutline } from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { FaBoxOpen, FaUsers, FaTags, FaRegImages, FaRegCommentDots, FaFileAlt, FaBlog } from "react-icons/fa";
import { HiOutlineClipboardList } from "react-icons/hi";

// Sidebar navigation data consumed by Components/Common/SideBar/SideBar.jsx.
const adminSideBarData = [
  { label: "Dashboard", path: "/", icon: <MdDashboard /> },
  { label: "Products", path: "/products", icon: <FaBoxOpen /> },
  { label: "Categories", path: "/categories", icon: <BiCategory /> },
  { label: "Orders", path: "/orders", icon: <HiOutlineClipboardList /> },
  { label: "Customers", path: "/customers", icon: <FaUsers /> },
  { label: "Coupons", path: "/coupons", icon: <FaTags /> },
  { label: "Hero Banners", path: "/hero-banners", icon: <FaRegImages /> },
  { label: "Testimonials", path: "/testimonials", icon: <FaRegCommentDots /> },
  { label: "Combo Offers", path: "/combo-offers", icon: <MdOutlineLocalOffer /> },
  { label: "Blog Posts", path: "/blog-posts", icon: <FaBlog /> },
  { label: "FAQs", path: "/faqs", icon: <MdOutlineQuestionAnswer /> },
  { label: "Newsletter", path: "/newsletter-subscribers", icon: <MdOutlineMailOutline /> },
  { label: "CMS Pages", path: "/cms", icon: <FaFileAlt /> },
];

export default adminSideBarData;
