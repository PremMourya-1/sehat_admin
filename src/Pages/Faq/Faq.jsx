import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { MdAdd, MdDeleteOutline, MdEdit } from "react-icons/md";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Button from "../../Components/Button/Button";
import Card from "../../Components/Card/Card";
import Drawer from "../../Components/Drawer/Drawer";
import ConfirmModal from "../../Components/Modal/ConfirmModal";
import InputBox from "../../Components/Form/InputBox/InputBox";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import NoRecords from "../../Components/NoRecords/NoRecords";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import usePageReload from "../../Hooks/usePageReload";
import { createFaq, deleteFaq, getFaqData, toggleFaqStatus, updateFaq } from "./faqService";

const DEFAULT_VALUES = { question: "", answer: "" };

const Faq = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  const fetchFaqs = useCallback(() => getFaqData(setData, setIsLoading), []);
  usePageReload(fetchFaqs);

  const openAdd = () => {
    setEditing(null);
    reset(DEFAULT_VALUES);
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    reset({ question: row.question, answer: row.answer });
    setDrawerOpen(true);
  };

  const onSubmit = (values) => {
    if (editing) {
      updateFaq(editing.id, values, setData, setIsSubmitting, () => setDrawerOpen(false));
    } else {
      createFaq(values, setData, setIsSubmitting, () => setDrawerOpen(false));
    }
  };

  const handleConfirmDelete = () => {
    deleteFaq(toDelete.id, setData, setIsDeleting, () => setToDelete(null));
  };

  return (
    <div>
      <BreadCrumb title="FAQs" items={[{ label: "FAQs" }]} />

      <div className="mb-4 flex justify-end">
        <Button icon={<MdAdd />} onClick={openAdd}>
          Add FAQ
        </Button>
      </div>

      {isLoading ? (
        <PreLoader />
      ) : data.length === 0 ? (
        <NoRecords message="No FAQs found" />
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((faq) => (
            <Card key={faq.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="section-title">{faq.question}</h3>
                  <p className="mt-1 text-sm text-muted">{faq.answer}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                    <input
                      type="checkbox"
                      checked={!!faq.status}
                      onChange={(e) => toggleFaqStatus(faq.id, e.target.checked, setData)}
                      className="h-4 w-4"
                    />
                    {faq.status ? "Active" : "Inactive"}
                  </label>
                  <button type="button" className="action-icon-edit" onClick={() => openEdit(faq)} aria-label="Edit FAQ">
                    <MdEdit />
                  </button>
                  <button type="button" className="action-icon-delete" onClick={() => setToDelete(faq)} aria-label="Delete FAQ">
                    <MdDeleteOutline />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit FAQ" : "Add FAQ"}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <InputBox
            label="Question"
            name="question"
            register={register}
            rules={{ required: "Question is required" }}
            error={errors.question}
            required
          />
          <InputBox
            label="Answer"
            name="answer"
            as="textarea"
            register={register}
            rules={{ required: "Answer is required" }}
            error={errors.answer}
            required
          />
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? <LoaderSpiner size={18} /> : editing ? "Update FAQ" : "Create FAQ"}
          </button>
        </form>
      </Drawer>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete this FAQ?"
        message="This FAQ will be permanently removed."
      />
    </div>
  );
};

export default Faq;
