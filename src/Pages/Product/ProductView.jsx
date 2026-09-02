import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import { formatCurrency, getImageUrl } from "../../Utils/utils";
import { getProductById } from "./productService";

const ProductView = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProductById(id, setProduct, setIsLoading);
  }, [id]);

  if (isLoading) return <PreLoader />;
  if (!product) return null;

  return (
    <div>
      <BreadCrumb
        title={product.name}
        items={[{ label: "Products", path: "/products" }, { label: "View Product" }]}
      />

      <div className="grid grid-cols-3 gap-5 lg:grid-cols-1">
        <div className="col-span-2 lg:col-span-1">
          <div className="card mb-5">
            <h3 className="section-title mb-3">Details</h3>
            <p className="mb-2 text-sm text-muted">Category</p>
            <p className="mb-4">{product.Category?.name || "-"}</p>
            <p className="mb-2 text-sm text-muted">Short Description</p>
            <p className="mb-4">{product.shortDescription || "-"}</p>
            <p className="mb-2 text-sm text-muted">Long Description</p>
            <div dangerouslySetInnerHTML={{ __html: product.longDescription || "-" }} />
          </div>

          <div className="card mb-5">
            <h3 className="section-title mb-3">Weight Variants</h3>
            <div className="w-full overflow-x-auto">
              <table className="customTable">
                <thead>
                  <tr>
                    <th>Weight</th>
                    <th>MRP</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {(product.variants || []).map((v) => (
                    <tr key={v.id}>
                      <td>{v.weight}</td>
                      <td>{formatCurrency(v.mrp)}</td>
                      <td>{formatCurrency(v.price)}</td>
                      <td>{v.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="card mb-5">
            <h3 className="section-title mb-3">Images</h3>
            <div className="grid grid-cols-3 gap-2">
              {(product.images || []).map((img) => (
                <div key={img.id} className="aspect-square overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
                  <img src={getImageUrl(img.image)} alt={product.name} className="h-full w-full object-cover" />
                </div>
              ))}
              {(!product.images || product.images.length === 0) && (
                <p className="text-sm text-muted">No images uploaded</p>
              )}
            </div>
          </div>

          <div className="card mb-5">
            <h3 className="section-title mb-3">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {(product.tags || []).map((tag) => (
                <span key={tag} className="badge-secondary">
                  {tag}
                </span>
              ))}
              {(!product.tags || product.tags.length === 0) && <p className="text-sm text-muted">No tags</p>}
            </div>
          </div>

          <div className="card">
            <h3 className="section-title mb-3">Status</h3>
            <div className="flex flex-col gap-2">
              <span className={product.status ? "badge-success" : "badge-danger"}>
                {product.status ? "Active" : "Inactive"}
              </span>
              {product.showOnHome && <span className="badge-accent">Featured</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
