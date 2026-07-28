import { MdInbox } from "react-icons/md";

/**
 * Empty-state placeholder shown by Table (and any grid-of-cards module)
 * when there is no data to display.
 */
const NoRecords = ({ message = "No records found", height = "12rem" }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-2" style={{ height }}>
      <MdInbox className="text-4xl" style={{ color: "var(--text-light)" }} />
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
};

export default NoRecords;
