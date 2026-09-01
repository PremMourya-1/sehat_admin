import { useState } from "react";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import ProductWiseReport from "./ProductWiseReport";
import DateWiseReport from "./DateWiseReport";

const TABS = [
  { key: "product", label: "Product-wise" },
  { key: "date", label: "Date-wise" },
];

// First page under the new Inventory sidebar section (see
// adminSideBarData.jsx / adminRoutesData.js) — two independent report
// views, each with its own filters/state (switching tabs doesn't lose or
// share state between them, so flipping back to a tab you already applied
// filters on shows what you left it at).
const SalesReports = () => {
  const [activeTab, setActiveTab] = useState("product");

  return (
    <div>
      <BreadCrumb title="Sales Reports" items={[{ label: "Inventory" }, { label: "Sales Reports" }]} />

      <div className="mb-5 flex overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)", width: "fit-content" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className="px-5 py-2 text-sm font-medium transition-colors"
            style={activeTab === tab.key ? { backgroundColor: "var(--primary)", color: "#fff" } : { color: "var(--text)" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "product" ? <ProductWiseReport /> : <DateWiseReport />}
    </div>
  );
};

export default SalesReports;
