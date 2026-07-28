import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { MdEdit } from "react-icons/md";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Card from "../../Components/Card/Card";
import Drawer from "../../Components/Drawer/Drawer";
import InputBox from "../../Components/Form/InputBox/InputBox";
import RichTextEditor from "../../Components/Form/RichTextEditor/RichTextEditor";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import { CMS_PAGES } from "../../Constant/Constant";
import { truncateText } from "../../Utils/utils";
import { getCmsData, updateCmsPage } from "./cmsService";

const Cms = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { title: "", content: "" } });

  useEffect(() => {
    getCmsData(setData, setIsLoading);
  }, []);

  const getPage = (slug) => data.find((item) => item.slug === slug);

  const openEdit = (slug, label) => {
    const page = getPage(slug);
    setEditing({ id: page?.id, label });
    reset({ title: page?.title || label, content: page?.content || "" });
    setDrawerOpen(true);
  };

  const onSubmit = (values) => {
    updateCmsPage(editing.id, values, setData, setIsSubmitting, () => setDrawerOpen(false));
  };

  return (
    <div>
      <BreadCrumb title="CMS Pages" items={[{ label: "CMS Pages" }]} />

      {isLoading ? (
        <PreLoader />
      ) : (
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-2 xs:grid-cols-1">
          {CMS_PAGES.map(({ slug, label }) => {
            const page = getPage(slug);
            return (
              <Card key={slug}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="section-title">{page?.title || label}</h3>
                  <button type="button" className="action-icon-edit" onClick={() => openEdit(slug, label)} aria-label="Edit page">
                    <MdEdit />
                  </button>
                </div>
                <p className="text-sm text-muted">{truncateText(page?.content, 140) || "No content yet."}</p>
              </Card>
            );
          })}
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={`Edit ${editing?.label || ""}`} size="md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <InputBox
            label="Page Title"
            name="title"
            register={register}
            rules={{ required: "Title is required" }}
            error={errors.title}
            required
          />
          <Controller
            control={control}
            name="content"
            rules={{ required: "Content is required" }}
            render={({ field, fieldState }) => (
              <RichTextEditor label="Content" value={field.value} onChange={field.onChange} error={fieldState.error} />
            )}
          />
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? <LoaderSpiner size={18} /> : "Update Page"}
          </button>
        </form>
      </Drawer>
    </div>
  );
};

export default Cms;
