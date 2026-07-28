import { useMemo, useState } from "react";

/**
 * Client-side search-as-you-type filter hook.
 * Filters `data` by checking whether the search term is a case-insensitive
 * substring of any of the given `keys` on each item.
 */
const UseFilter = (data = [], keys = ["name"]) => {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.trim().toLowerCase();
    return data.filter((item) =>
      keys.some((key) => String(item?.[key] ?? "").toLowerCase().includes(term)),
    );
  }, [data, search, keys]);

  return { search, setSearch, filteredData };
};

export default UseFilter;
