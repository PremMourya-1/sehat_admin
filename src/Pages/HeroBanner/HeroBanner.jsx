import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { MdAdd, MdDeleteOutline, MdEdit } from "react-icons/md";
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
  createHeroBanner,
  deleteHeroBanner,
  getHeroBannerData,
  toggleHeroBannerStatus,
  updateHeroBanner,
} from "./heroBannerService";

const HeroBanner = () => {
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
  } = useForm({ defaultValues: { title: "", description: "" } });

  const fetchHeroBanners = useCallback(() => getHeroBannerData(setData, setIsLoading), []);
  usePageReload(fetchHeroBanners);

  const openAdd = () => {
    setEditing(null);
    setImageFile(null);
    reset({ title: "", description: "" });
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setImageFile(null);
    reset({ title: row.title || "", description: row.description || "" });
    setDrawerOpen(true);
  };

  const onSubmit = (values) => {
    if (!imageFile && !editing) return;
    const formData = new FormData();
    formData.append("title", values.title || "");
    formData.append("description", values.description || "");
    if (imageFile) formData.append("image", imageFile);

    if (editing) {
      updateHeroBanner(editing.id, formData, setData, setIsSubmitting, () => setDrawerOpen(false));
    } else {
      createHeroBanner(formData, setData, setIsSubmitting, () => setDrawerOpen(false));
    }
  };

  const handleConfirmDelete = () => {
    deleteHeroBanner(toDelete.id, setData, setIsDeleting, () => setToDelete(null));
  };

  return (
    <div>
      <BreadCrumb title="Hero Banners" items={[{ label: "Hero Banners" }]} />

      <div className="mb-4 flex justify-end">
        <Button icon={<MdAdd />} onClick={openAdd}>
          Add Banner
        </Button>
      </div>

      {isLoading ? (
        <PreLoader />
      ) : data.length === 0 ? (
        <NoRecords message="No hero banners found" />
      ) : (
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-2 xs:grid-cols-1">
          {data.map((banner) => (
            <Card key={banner.id} className="!p-3">
              <div className="aspect-[21/9] overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
                <img src={getImageUrl(banner.image)} alt="Hero banner" className="h-full w-full object-cover" />
              </div>
              {(banner.title || banner.description) && (
                <div className="mt-2">
                  {banner.title && (
                    <p className="font-semibold" style={{ color: "var(--text)" }}>
                      {banner.title}
                    </p>
                  )}
                  {banner.description && <p className="text-xs text-muted line-clamp-2">{banner.description}</p>}
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                  <input
                    type="checkbox"
                    checked={!!banner.status}
                    onChange={(e) => toggleHeroBannerStatus(banner.id, e.target.checked, setData)}
                    className="h-4 w-4"
                  />
                  {banner.status ? "Active" : "Inactive"}
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" className="action-icon-edit" onClick={() => openEdit(banner)} aria-label="Edit banner">
                    <MdEdit />
                  </button>
                  <button
                    type="button"
                    className="action-icon-delete"
                    onClick={() => setToDelete(banner)}
                    aria-label="Delete banner"
                  >
                    <MdDeleteOutline />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit Hero Banner" : "Add Hero Banner"}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <SingleImageUpload
            label="Banner Image (21:9)"
            aspect="aspect-[21/9]"
            existingImage={editing?.image}
            onRemoveExisting={() => {}}
            file={imageFile}
            onFileChange={setImageFile}
          />
          <InputBox
            label="Title"
            name="title"
            register={register}
            placeholder="e.g. Pure Nutrition, Perfected for You"
          />
          <InputBox
            label="Description"
            name="description"
            as="textarea"
            register={register}
            placeholder="Short line shown under the title on the banner"
          />
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? <LoaderSpiner size={18} /> : editing ? "Update Banner" : "Create Banner"}
          </button>
        </form>
      </Drawer>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete this banner?"
        message="This hero banner will be permanently removed."
      />
    </div>
  );
};

export default HeroBanner;
