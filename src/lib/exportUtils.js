/**
 * Exports expenses dataset as CSV download file
 */
export const exportExpensesToCSV = (expensesList, filename = 'Gharkharch_Expense_Book.csv') => {
  if (!expensesList || expensesList.length === 0) {
    alert('No expense records available to export.');
    return;
  }

  const headers = ['Date', 'Category', 'Description', 'Amount (INR)', 'Payment Mode', 'Added By', 'Notes'];

  const rows = expensesList.map(exp => [
    exp.expense_date,
    `"${exp.category?.name || 'Uncategorized'}"`,
    `"${(exp.description || '').replace(/"/g, '""')}"`,
    exp.amount,
    `"${exp.payment_mode || 'Cash'}"`,
    `"${exp.profile?.full_name || 'Member'}"`,
    `"${(exp.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
