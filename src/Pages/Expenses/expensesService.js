import toast from "react-hot-toast";
import expensesApi from "../../Service/expensesApi";

// GET — server does the filtering/sorting/totaling (see
// controllers/expensesController.js), so this always replaces the whole
// { expenses, total, count } state rather than patching it locally.
export async function getExpensesData(filters, setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await expensesApi.getExpenses(filters);
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load expenses");
  } finally {
    setIsLoading(false);
  }
}

export async function createExpense(data, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await expensesApi.createExpense(data);
    if (res.data.action) {
      toast.success(res.data.message || "Expense added successfully");
      onDone?.();
      return true;
    }
    toast.error(res.data.message);
    return false;
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to add expense");
    return false;
  } finally {
    setIsSubmitting(false);
  }
}

export async function updateExpense(id, data, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await expensesApi.updateExpense(id, data);
    if (res.data.action) {
      toast.success(res.data.message || "Expense updated successfully");
      onDone?.();
      return true;
    }
    toast.error(res.data.message);
    return false;
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update expense");
    return false;
  } finally {
    setIsSubmitting(false);
  }
}

export async function deleteExpense(id, setIsDeleting, onDone) {
  try {
    setIsDeleting(true);
    const res = await expensesApi.deleteExpense(id);
    if (res.data.action) {
      toast.success(res.data.message || "Expense deleted successfully");
      onDone?.();
      return true;
    }
    toast.error(res.data.message);
    return false;
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to delete expense");
    return false;
  } finally {
    setIsDeleting(false);
  }
}
