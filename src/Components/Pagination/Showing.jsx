/**
 * "Showing X-Y of Z entries" label used alongside Pagination.
 */
const Showing = ({ page, pageSize, total }) => {
  if (!total) return <p className="text-sm text-muted">No entries</p>;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <p className="text-sm text-muted">
      Showing {start}-{end} of {total} entries
    </p>
  );
};

export default Showing;
