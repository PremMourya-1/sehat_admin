import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Button from "../../Components/Button/Button";
import Table from "../../Components/Table/Table";
import Drawer from "../../Components/Drawer/Drawer";
import ConfirmModal from "../../Components/Modal/ConfirmModal";
import InputBox from "../../Components/Form/InputBox/InputBox";
import SingleImageUpload from "../../Components/Form/FileUpload/SingleImageUpload";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import UseFilter from "../../Hooks/UseFilter";
import useCategoryColumns from "./CategoryTable";
import { createCategory, deleteCategory, getCategoryData, updateCategory } from "./categoryService";

const Category = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const { search, setSearch, filteredData } = UseFilter(data, ["name"]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { name: "", shortDescription: "", status: true } });

  useEffect(() => {
    getCategoryData(setData, setIsLoading);
  }, []);

  const openAdd = () => {
    setEditing(null);
    setImageFile(null);
    setRemoveImage(false);
    reset({ name: "", shortDescription: "", status: true });
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setImageFile(null);
    setRemoveImage(false);
    reset({ name: row.name, shortDescription: row.shortDescription || "", status: row.status });
    setDrawerOpen(true);
  };

  const columns = useCategoryColumns({ onEdit: openEdit, onDelete: (row) => setToDelete(row) });

  const onSubmit = (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("shortDescription", values.shortDescription || "");
    formData.append("status", values.status ? "1" : "0");
    if (imageFile) formData.append("image", imageFile);
    if (editing && removeImage) formData.append("removeImage", "1");

    if (editing) {
      updateCategory(editing.id, formData, setData, setIsSubmitting, () => setDrawerOpen(false));
    } else {
      createCategory(formData, setData, setIsSubmitting, () => setDrawerOpen(false));
    }
  };

  const handleConfirmDelete = () => {
    deleteCategory(toDelete.id, setData, setIsDeleting, () => setToDelete(null));
  };

  return (
    <div>
      <BreadCrumb title="Categories" items={[{ label: "Categories" }]} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories by name..."
          className="inputBox max-w-xs"
        />
        <Button icon={<MdAdd />} onClick={openAdd}>
          Add Category
        </Button>
      </div>

      <Table columns={columns} data={filteredData} isLoading={isLoading} emptyMessage="No categories found" />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <SingleImageUpload
            label="Category Image"
            rounded
            existingImage={!removeImage ? editing?.image : null}
            onRemoveExisting={() => setRemoveImage(true)}
            file={imageFile}
            onFileChange={(file) => {
              setImageFile(file);
              if (file) setRemoveImage(false);
            }}
          />

          <InputBox
            label="Category Name"
            name="name"
            register={register}
            rules={{ required: "Category name is required" }}
            error={errors.name}
            placeholder="e.g. Almonds"
            required
          />

          <InputBox
            label="Short Description"
            name="shortDescription"
            as="textarea"
            register={register}
            placeholder="Shown under the category on the storefront's Shop by Type section"
          />

          <label className="mb-4 flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
            <input type="checkbox" {...register("status")} className="h-4 w-4" />
            Active
          </label>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
              {isSubmitting ? <LoaderSpiner size={18} /> : editing ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      </Drawer>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete this category?"
        message={`"${toDelete?.name}" will be permanently removed.`}
      />
    </div>
  );
};

export default Category;
