import { BRAND_NAME } from "../../../Constant/Constant";

const SideBarHeader = ({ collapsed }) => {
  return (
    <div className="sidebar-header">
      <span className="text-2xl">🌰</span>
      {!collapsed && <span className="brand-logo">{BRAND_NAME}</span>}
    </div>
  );
};

export default SideBarHeader;
