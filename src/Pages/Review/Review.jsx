import { useCallback, useEffect, useState } from "react";
import { MdCheck, MdDeleteOutline, MdStar } from "react-icons/md";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Card from "../../Components/Card/Card";
import ConfirmModal from "../../Components/Modal/ConfirmModal";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import NoRecords from "../../Components/NoRecords/NoRecords";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import usePageReload from "../../Hooks/usePageReload";
import { formatDate } from "../../Utils/utils";
import { approveReview, deleteReview, getReviewData } from "./reviewService";

const StarRating = ({ rating = 0 }) => (
  <div className="flex text-yellow-500">
    {[0, 1, 2, 3, 4].map((i) => (
      <MdStar key={i} className={i < rating ? "" : "opacity-25"} />
    ))}
  </div>
);

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "all", label: "All" },
];

const Review = () => {
  const [status, setStatus] = useState("pending");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = useCallback(() => getReviewData(status, setData, setIsLoading), [status]);
  usePageReload(fetchReviews);
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApprove = (id) => {
    const setSubmitting = (val) => setApprovingId(val ? id : null);
    approveReview(id, setData, setSubmitting);
  };

  const handleConfirmDelete = () => {
    deleteReview(toDelete.id, setData, setIsDeleting, () => setToDelete(null));
  };

  return (
    <div>
      <BreadCrumb title="Product Reviews" items={[{ label: "Reviews" }]} />

      <div className="mb-4 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
            style={{
              backgroundColor: status === tab.value ? "var(--primary)" : "var(--primary-tp)",
              color: status === tab.value ? "#fff" : "var(--primary)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PreLoader />
      ) : data.length === 0 ? (
        <NoRecords message={`No ${status === "all" ? "" : status} reviews found`} />
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((review) => (
            <Card key={review.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="section-title">{review.Product?.name || "Unknown product"}</h3>
                    <StarRating rating={review.rating} />
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: review.isApproved ? "var(--success-tp, #dcfce7)" : "var(--warning-tp, #fef3c7)",
                        color: review.isApproved ? "#15803d" : "#a16207",
                      }}
                    >
                      {review.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {review.Customer?.name || "Unknown customer"} ({review.Customer?.email}) · Order{" "}
                    {review.Order?.orderNumber || "—"} · {formatDate(review.createdAt)}
                  </p>
                  <p className="mt-2 text-sm" style={{ color: "var(--text)" }}>
                    {review.comment}
                  </p>
                  {review.photos?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {review.photos.map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          alt={`${i + 1} of ${review.photos.length}`}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  {!review.isApproved && (
                    <button
                      type="button"
                      className="action-icon-edit"
                      onClick={() => handleApprove(review.id)}
                      disabled={approvingId === review.id}
                      aria-label="Approve review"
                    >
                      {approvingId === review.id ? <LoaderSpiner size={16} /> : <MdCheck />}
                    </button>
                  )}
                  <button
                    type="button"
                    className="action-icon-delete"
                    onClick={() => setToDelete(review)}
                    aria-label={review.isApproved ? "Delete review" : "Reject review"}
                  >
                    <MdDeleteOutline />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title={toDelete?.isApproved ? "Delete this review?" : "Reject this review?"}
        message="This review will be permanently removed."
      />
    </div>
  );
};

export default Review;
