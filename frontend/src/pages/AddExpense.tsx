import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Loader2, Receipt } from 'lucide-react';
import { useTeamStore, useTransactionStore } from '../store';
import { receiptsApi } from '../lib/api';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@teambudget/shared';

export default function AddExpense() {
  const navigate = useNavigate();
  const { currentTeam, fetchDashboard } = useTeamStore();
  const { createTransaction } = useTransactionStore();

  const [formData, setFormData] = useState({
    type: 'expense' as 'expense' | 'income',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'type' ? { category: '' } : {}),
    }));
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Receipt file must be less than 5MB');
        return;
      }
      setReceipt(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const removeReceipt = () => {
    setReceipt(null);
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
      setReceiptPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam) return;

    setError('');
    setIsLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Create transaction
      await createTransaction({
        teamId: currentTeam.id,
        type: formData.type,
        amount,
        category: formData.category,
        description: formData.description,
        date: formData.date,
        notes: formData.notes || undefined,
      });

      // Upload receipt if provided (would need transaction ID from response)
      // For now, we'll skip this and improve later

      // Refresh dashboard
      await fetchDashboard(currentTeam.id);

      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { message?: string; response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || error.message || 'Failed to create transaction');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentTeam) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Add {formData.type === 'expense' ? 'Expense' : 'Income'}
        </h1>
        <p className="text-gray-500">Record a new transaction for {currentTeam.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Transaction Type */}
        <div>
          <label className="label">Transaction Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
              className={`p-4 rounded-lg border-2 transition-colors ${
                formData.type === 'expense'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">Expense</span>
              <p className="text-sm opacity-75">Money going out</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
              className={`p-4 rounded-lg border-2 transition-colors ${
                formData.type === 'income'
                  ? 'border-success-500 bg-success-50 text-success-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">Income</span>
              <p className="text-sm opacity-75">Money coming in</p>
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="label">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={formData.amount}
              onChange={handleChange}
              className="input pl-8"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="label">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="label">
            Description
          </label>
          <input
            id="description"
            name="description"
            type="text"
            required
            value={formData.description}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Tournament registration fee"
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="label">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="label">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="input"
            placeholder="Add any additional notes..."
          />
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="label">Receipt (optional)</label>
          {!receipt ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
              <Upload size={24} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload receipt</span>
              <span className="text-xs text-gray-400 mt-1">JPG, PNG, PDF up to 5MB</span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleReceiptChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative border border-gray-200 rounded-lg p-4">
              <button
                type="button"
                onClick={removeReceipt}
                className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-3">
                {receiptPreview && receipt.type.startsWith('image/') ? (
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Receipt size={32} className="text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 truncate max-w-xs">{receipt.name}</p>
                  <p className="text-sm text-gray-500">
                    {(receipt.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 btn-secondary py-3"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 py-3 ${
              formData.type === 'expense' ? 'btn-danger' : 'btn-success'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              `Add ${formData.type === 'expense' ? 'Expense' : 'Income'}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
