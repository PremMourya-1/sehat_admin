import { useCallback, useState } from "react";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Table from "../../Components/Table/Table";
import ConfirmModal from "../../Components/Modal/ConfirmModal";
import UseFilter from "../../Hooks/UseFilter";
import usePageReload from "../../Hooks/usePageReload";
import useNewsletterColumns from "./NewsletterTable";
import { deleteSubscriber, getSubscriberData } from "./newsletterService";

const Newsletter = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const { search, setSearch, filteredData } = UseFilter(data, ["email"]);

  const fetchSubscribers = useCallback(() => getSubscriberData(setData, setIsLoading), []);
  usePageReload(fetchSubscribers);

  const columns = useNewsletterColumns({ onDelete: (row) => setToDelete(row) });

  const handleConfirmDelete = () => {
    deleteSubscriber(toDelete.id, setData, setIsDeleting, () => setToDelete(null));
  };

  return (
    <div>
      <BreadCrumb title="Newsletter Subscribers" items={[{ label: "Newsletter Subscribers" }]} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email..."
          className="inputBox max-w-xs"
        />
        <p className="text-sm text-muted">{data.length} total subscriber{data.length === 1 ? "" : "s"}</p>
      </div>

      <Table columns={columns} data={filteredData} isLoading={isLoading} emptyMessage="No subscribers yet" />

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Remove this subscriber?"
        message={`"${toDelete?.email}" will be permanently removed.`}
      />
    </div>
  );
};

export default Newsletter;
