import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { MdAdd, MdDeleteOutline, MdEdit } from "react-icons/md";
import Card from "../../Components/Card/Card";
import Button from "../../Components/Button/Button";
import Drawer from "../../Components/Drawer/Drawer";
import ConfirmModal from "../../Components/Modal/ConfirmModal";
import InputBox from "../../Components/Form/InputBox/InputBox";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import NoRecords from "../../Components/NoRecords/NoRecords";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import usePageReload from "../../Hooks/usePageReload";
import { INDIAN_STATES } from "../../Constant/Constant";
import { formatCurrency } from "../../Utils/utils";
import {
  getShippingZoneData,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone,
} from "./shippingZoneService";

const DEFAULT_VALUES = { zoneName: "", shippingCharge: "" };

// Zone-based checkout shipping charge (see utils/shippingZones.js
// getShippingCharge) — one row per zone, each owning a set of Indian
// states/UTs. A state isn't prevented from being assigned to more than one
// zone here — getShippingCharge() just uses whichever zone it finds first —
// so keep each state in exactly one zone to avoid ambiguity.
const ShippingZones = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [selectedStates, setSelectedStates] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  const fetchZones = useCallback(() => getShippingZoneData(setData, setIsLoading), []);
  usePageReload(fetchZones);

  const openAdd = () => {
    setEditing(null);
    setSelectedStates([]);
    reset(DEFAULT_VALUES);
    setDrawerOpen(true);
  };

  const openEdit = (zone) => {
    setEditing(zone);
    setSelectedStates(zone.states || []);
    reset({ zoneName: zone.zoneName, shippingCharge: zone.shippingCharge });
    setDrawerOpen(true);
  };

  const toggleState = (state) => {
    setSelectedStates((prev) => (prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]));
  };

  const onSubmit = (values) => {
    const payload = {
      zoneName: values.zoneName,
      shippingCharge: Number(values.shippingCharge),
      states: selectedStates,
    };
    if (editing) {
      updateShippingZone(editing.id, payload, setData, setIsSubmitting, () => setDrawerOpen(false));
    } else {
      createShippingZone(payload, setData, setIsSubmitting, () => setDrawerOpen(false));
    }
  };

  const handleConfirmDelete = () => {
    deleteShippingZone(toDelete.id, setData, setIsDeleting, () => setToDelete(null));
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">
          Shipping charge shown to the customer at checkout, based on which zone their delivery state falls into.
        </p>
        <Button icon={<MdAdd />} onClick={openAdd}>
          Add Zone
        </Button>
      </div>

      {isLoading ? (
        <PreLoader />
      ) : data.length === 0 ? (
        <NoRecords message="No shipping zones configured yet" />
      ) : (
        <Card>
          <table className="customTable">
            <thead>
              <tr>
                <th>Zone</th>
                <th>States</th>
                <th>Charge</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((zone) => (
                <tr key={zone.id}>
                  <td>{zone.zoneName}</td>
                  <td className="text-sm text-muted">{(zone.states || []).join(", ") || "-"}</td>
                  <td>{formatCurrency(zone.shippingCharge)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button type="button" className="action-icon-edit" onClick={() => openEdit(zone)} aria-label="Edit zone">
                        <MdEdit />
                      </button>
                      <button
                        type="button"
                        className="action-icon-delete"
                        onClick={() => setToDelete(zone)}
                        aria-label="Delete zone"
                      >
                        <MdDeleteOutline />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit Shipping Zone" : "Add Shipping Zone"}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <InputBox
            label="Zone Name"
            name="zoneName"
            register={register}
            rules={{ required: "Zone name is required" }}
            error={errors.zoneName}
            placeholder="e.g. Same State"
            required
          />
          <InputBox
            label="Shipping Charge (₹)"
            name="shippingCharge"
            type="number"
            step="0.01"
            register={register}
            rules={{ required: "Shipping charge is required", min: { value: 0, message: "Must be 0 or more" } }}
            error={errors.shippingCharge}
            placeholder="e.g. 40"
            required
          />

          <label className="form-label">States in this zone</label>
          <div className="mb-4 grid max-h-64 grid-cols-2 gap-1.5 overflow-y-auto rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
            {INDIAN_STATES.map((state) => (
              <label key={state} className="flex cursor-pointer items-center gap-2 text-xs" style={{ color: "var(--text)" }}>
                <input
                  type="checkbox"
                  checked={selectedStates.includes(state)}
                  onChange={() => toggleState(state)}
                  className="h-3.5 w-3.5"
                />
                {state}
              </label>
            ))}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? <LoaderSpiner size={18} /> : editing ? "Update Zone" : "Create Zone"}
          </button>
        </form>
      </Drawer>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete this shipping zone?"
        message={`"${toDelete?.zoneName}" will be permanently removed. States in this zone will fall back to the highest-priced zone until reassigned.`}
      />
    </div>
  );
};

export default ShippingZones;
