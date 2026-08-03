import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { MdAdd, MdDeleteOutline, MdEdit, MdStar } from "react-icons/md";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Button from "../../Components/Button/Button";
import Card from "../../Components/Card/Card";
import Drawer from "../../Components/Drawer/Drawer";
import ConfirmModal from "../../Components/Modal/ConfirmModal";
import InputBox from "../../Components/Form/InputBox/InputBox";
import SingleImageUpload from "../../Components/Form/FileUpload/SingleImageUpload";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import NoRecords from "../../Components/NoRecords/NoRecords";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import usePageReload from "../../Hooks/usePageReload";
import { getImageUrl } from "../../Utils/utils";
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonialData,
  toggleTestimonialStatus,
  updateTestimonial,
} from "./testimonialService";

const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5" style={{ color: "var(--accent)" }}>
    {Array.from({ length: 5 }, (_, i) => (
      <MdStar key={i} className={i < rating ? "" : "opacity-25"} />
    ))}
  </div>
);

const Testimonial = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { name: "", designation: "", message: "", rating: 5, status: true } });

  const fetchTestimonials = useCallback(() => getTestimonialData(setData, setIsLoading), []);
  usePageReload(fetchTestimonials);

  const openAdd = () => {
    setEditing(null);
    setImageFile(null);
    reset({ name: "", designation: "", message: "", rating: 5, status: true });
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setImageFile(null);
    reset({
      name: row.name,
      designation: row.designation || "",
      message: row.message,
      rating: row.rating || 5,
      status: row.status,
    });
    setDrawerOpen(true);
  };

  const onSubmit = (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("designation", values.designation || "");
    formData.append("message", values.message);
    formData.append("rating", values.rating);
    formData.append("status", values.status ? "1" : "0");
    if (imageFile) formData.append("image", imageFile);

    if (editing) {
      updateTestimonial(editing.id, formData, setData, setIsSubmitting, () => setDrawerOpen(false));
    } else {
      createTestimonial(formData, setData, setIsSubmitting, () => setDrawerOpen(false));
    }
  };

  const handleConfirmDelete = () => {
    deleteTestimonial(toDelete.id, setData, setIsDeleting, () => setToDelete(null));
  };

  return (
    <div>
      <BreadCrumb title="Testimonials" items={[{ label: "Testimonials" }]} />

      <div className="mb-4 flex justify-end">
        <Button icon={<MdAdd />} onClick={openAdd}>
          Add Testimonial
        </Button>
      </div>

      {isLoading ? (
        <PreLoader />
      ) : data.length === 0 ? (
        <NoRecords message="No testimonials found" />
      ) : (
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-2 xs:grid-cols-1">
          {data.map((item) => (
            <Card key={item.id}>
              <div className="flex items-center gap-3">
                {item.image ? (
                  <img src={getImageUrl(item.image)} alt={item.name} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-full" style={{ backgroundColor: "var(--background-light)" }} />
                )}
                <div>
                  <p className="font-semibold" style={{ color: "var(--text)" }}>
                    {item.name}
                  </p>
                  <p className="text-xs text-muted">{item.designation || "-"}</p>
                </div>
              </div>
              <StarRating rating={item.rating} />
              <p className="mt-2 text-sm text-muted">{item.message}</p>
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                  <input
                    type="checkbox"
                    checked={!!item.status}
                    onChange={(e) => toggleTestimonialStatus(item.id, e.target.checked, setData)}
                    className="h-4 w-4"
                  />
                  {item.status ? "Active" : "Inactive"}
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" className="action-icon-edit" onClick={() => openEdit(item)} aria-label="Edit testimonial">
                    <MdEdit />
                  </button>
                  <button
                    type="button"
                    className="action-icon-delete"
                    onClick={() => setToDelete(item)}
                    aria-label="Delete testimonial"
                  >
                    <MdDeleteOutline />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit Testimonial" : "Add Testimonial"}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <SingleImageUpload
            label="Photo"
            rounded
            existingImage={editing?.image}
            onRemoveExisting={() => {}}
            file={imageFile}
            onFileChange={setImageFile}
          />
          <InputBox label="Name" name="name" register={register} rules={{ required: "Name is required" }} error={errors.name} required />
          <InputBox label="Designation" name="designation" register={register} placeholder="e.g. Verified Buyer" />
          <InputBox
            label="Message"
            name="message"
            as="textarea"
            register={register}
            rules={{ required: "Message is required" }}
            error={errors.message}
            required
          />
          <InputBox
            label="Rating"
            name="rating"
            as="select"
            register={register}
            options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: `${n} Star${n > 1 ? "s" : ""}` }))}
          />
          <label className="mb-4 flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
            <input type="checkbox" {...register("status")} className="h-4 w-4" />
            Active
          </label>
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? <LoaderSpiner size={18} /> : editing ? "Update Testimonial" : "Create Testimonial"}
          </button>
        </form>
      </Drawer>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete this testimonial?"
        message={`Testimonial from "${toDelete?.name}" will be permanently removed.`}
      />
    </div>
  );
};

export default Testimonial;
