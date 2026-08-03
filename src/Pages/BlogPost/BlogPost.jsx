import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { MdAdd, MdDeleteOutline, MdEdit } from "react-icons/md";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Button from "../../Components/Button/Button";
import Card from "../../Components/Card/Card";
import Drawer from "../../Components/Drawer/Drawer";
import ConfirmModal from "../../Components/Modal/ConfirmModal";
import InputBox from "../../Components/Form/InputBox/InputBox";
import RichTextEditor from "../../Components/Form/RichTextEditor/RichTextEditor";
import SingleImageUpload from "../../Components/Form/FileUpload/SingleImageUpload";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import NoRecords from "../../Components/NoRecords/NoRecords";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import usePageReload from "../../Hooks/usePageReload";
import { getImageUrl } from "../../Utils/utils";
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPostData,
  toggleBlogPostStatus,
  updateBlogPost,
} from "./blogPostService";

const DEFAULT_VALUES = { title: "", excerpt: "", content: "", readTime: "" };

const BlogPost = () => {
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
    control,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  const fetchBlogPosts = useCallback(() => getBlogPostData(setData, setIsLoading), []);
  usePageReload(fetchBlogPosts);

  const openAdd = () => {
    setEditing(null);
    setImageFile(null);
    reset(DEFAULT_VALUES);
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setImageFile(null);
    reset({ title: row.title, excerpt: row.excerpt || "", content: row.content || "", readTime: row.readTime || "" });
    setDrawerOpen(true);
  };

  const onSubmit = (values) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("excerpt", values.excerpt || "");
    formData.append("content", values.content || "");
    formData.append("readTime", values.readTime || "");
    if (imageFile) formData.append("image", imageFile);

    if (editing) {
      updateBlogPost(editing.id, formData, setData, setIsSubmitting, () => setDrawerOpen(false));
    } else {
      createBlogPost(formData, setData, setIsSubmitting, () => setDrawerOpen(false));
    }
  };

  const handleConfirmDelete = () => {
    deleteBlogPost(toDelete.id, setData, setIsDeleting, () => setToDelete(null));
  };

  return (
    <div>
      <BreadCrumb title="Blog Posts" items={[{ label: "Blog Posts" }]} />

      <div className="mb-4 flex justify-end">
        <Button icon={<MdAdd />} onClick={openAdd}>
          Add Post
        </Button>
      </div>

      {isLoading ? (
        <PreLoader />
      ) : data.length === 0 ? (
        <NoRecords message="No blog posts found" />
      ) : (
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-2 xs:grid-cols-1">
          {data.map((post) => (
            <Card key={post.id} className="!p-3">
              <div className="aspect-video overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
                {post.image ? (
                  <img src={getImageUrl(post.image)} alt={post.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full" style={{ backgroundColor: "var(--background-light)" }} />
                )}
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-muted">{post.readTime}</p>
                <h3 className="section-title">{post.title}</h3>
                <p className="mt-1 text-sm text-muted line-clamp-2">{post.excerpt}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                  <input
                    type="checkbox"
                    checked={!!post.status}
                    onChange={(e) => toggleBlogPostStatus(post.id, e.target.checked, setData)}
                    className="h-4 w-4"
                  />
                  {post.status ? "Active" : "Inactive"}
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" className="action-icon-edit" onClick={() => openEdit(post)} aria-label="Edit post">
                    <MdEdit />
                  </button>
                  <button type="button" className="action-icon-delete" onClick={() => setToDelete(post)} aria-label="Delete post">
                    <MdDeleteOutline />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit Blog Post" : "Add Blog Post"}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <SingleImageUpload
            label="Cover Image (optional)"
            aspect="aspect-video"
            existingImage={editing?.image}
            onRemoveExisting={() => {}}
            file={imageFile}
            onFileChange={setImageFile}
          />
          <InputBox
            label="Title"
            name="title"
            register={register}
            rules={{ required: "Title is required" }}
            error={errors.title}
            placeholder="e.g. 5 Healthy Trail Mix Recipes"
            required
          />
          <InputBox label="Excerpt" name="excerpt" as="textarea" register={register} placeholder="Short teaser text shown on the blog list" />
          <InputBox label="Read Time" name="readTime" register={register} placeholder="e.g. 4 min read" />
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <RichTextEditor
                label="Full Article Content"
                value={field.value}
                onChange={field.onChange}
                placeholder="The full blog post shown on its detail page..."
              />
            )}
          />
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? <LoaderSpiner size={18} /> : editing ? "Update Post" : "Create Post"}
          </button>
        </form>
      </Drawer>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete this post?"
        message={`"${toDelete?.title}" will be permanently removed.`}
      />
    </div>
  );
};

export default BlogPost;
