import { useState, useRef, useEffect } from 'react';
import { X, Mic, MicOff } from 'lucide-react';

const CATEGORIES = {
  'Fixed Expenses': ['Rent', 'Utilities', 'Subscriptions', 'Insurance'],
  'Daily': ['Groceries', 'Dining', 'Coffee', 'Transportation'],
  'Discretionary': ['Shopping', 'Entertainment', 'Health', 'Other'],
  'Investments': ['Stocks', 'Crypto']
};

const ExpenseForm = ({ isOpen, onClose, onSubmit, editingExpense = null }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // 'income' or 'expense'
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank'); // 'bank' or 'credit'
  const [isListening, setIsListening] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recognitionRef = useRef(null);
  const amountInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, [isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setType(editingExpense.type || 'expense');
      setCategory(editingExpense.category || '');
      setSubCategory(editingExpense.subCategory || '');
      setNote(editingExpense.note || '');
      setPaymentMethod(editingExpense.paymentMethod || 'bank');
    } else {
      // Reset form when not editing
      setAmount('');
      setType('expense');
      setCategory('');
      setSubCategory('');
      setNote('');
      setPaymentMethod('bank');
      setShowCategorySelect(false);
    }
  }, [editingExpense, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        parseVoiceInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const parseVoiceInput = (transcript) => {
    // Try to extract amount (look for numbers)
    const amountMatch = transcript.match(/\d+(\.\d+)?/);
    if (amountMatch) {
      setAmount(amountMatch[0]);
    }

    // Try to match categories
    const lowerTranscript = transcript.toLowerCase();
    let foundCategory = false;

    Object.entries(CATEGORIES).forEach(([mainCat, subCats]) => {
      subCats.forEach((subCat) => {
        if (lowerTranscript.includes(subCat.toLowerCase())) {
          setCategory(mainCat);
          setSubCategory(subCat);
          foundCategory = true;
        }
      });
    });

    // Set note as the full transcript (clean up rupees/dollars mentions)
    setNote(transcript.replace(/\s*(rupees?|dollars?|rs\.?|₹|\$)\s*/gi, ' ').trim());
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // For expenses, require category. For income, category is optional
    if (!amount || (type === 'expense' && (!category || !subCategory))) {
      alert(type === 'expense' ? 'Please fill in amount and category' : 'Please fill in amount');
      return;
    }

    if (isSubmitting) return; // Prevent double submission

    try {
      setIsSubmitting(true);

      // Wait for submission to complete before resetting form
      await onSubmit({
        amount: parseFloat(amount),
        type,
        category: type === 'expense' ? category : 'Income',
        subCategory: type === 'expense' ? subCategory : (note || 'Salary'),
        note,
        paymentMethod,
        date: new Date().toISOString()
      });

      // Only reset form after successful submission
      setAmount('');
      setType('expense');
      setCategory('');
      setSubCategory('');
      setNote('');
      setPaymentMethod('bank');
      setShowCategorySelect(false);
    } catch (error) {
      console.error('Submission error:', error);
      // Error alert is already handled in Dashboard's handleAddExpense
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto"
      onClick={(e) => {
        // Close modal if clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div
          className="bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-800 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-700 sticky top-0 bg-zinc-900 z-10">
          <h2 className="text-xl font-semibold text-white">{editingExpense ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-zinc-300" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {/* Income/Expense Toggle */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory('');
                  setSubCategory('');
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  type === 'expense'
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory('');
                  setSubCategory('');
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Income
              </button>
            </div>
          </div>
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-zinc-500">₹</span>
              <input
                ref={amountInputRef}
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-lg font-semibold border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-600 bg-black text-white"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Category Selection - Only for Expenses */}
          {type === 'expense' && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Category
              </label>
              {!showCategorySelect ? (
                <button
                  type="button"
                  onClick={() => setShowCategorySelect(true)}
                  className="w-full px-3 py-2 text-sm text-left border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-600 bg-black text-white"
                >
                  {category && subCategory ? `${category} > ${subCategory}` : 'Select category...'}
                </button>
              ) : (
                <div className="border border-zinc-700 rounded-lg overflow-hidden">
                  {Object.entries(CATEGORIES).map(([mainCat, subCats]) => (
                    <div key={mainCat}>
                      <div className="bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400">
                        {mainCat}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 p-2 bg-black">
                        {subCats.map((subCat) => (
                          <button
                            key={subCat}
                            type="button"
                            onClick={() => {
                              setCategory(mainCat);
                              setSubCategory(subCat);
                              setShowCategorySelect(false);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              category === mainCat && subCategory === subCat
                                ? 'bg-emerald-600 text-white'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            }`}
                          >
                            {subCat}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payment Method / Source */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              {type === 'income' ? 'Source' : 'Payment Method'}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  paymentMethod === 'bank'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Bank
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('credit')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  paymentMethod === 'credit'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Credit Card
              </button>
            </div>
          </div>

          {/* Note (Optional) */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              {type === 'income' ? 'Description (e.g., Salary, Freelance)' : 'Note (Optional)'}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-600 bg-black text-white"
              placeholder={type === 'income' ? 'e.g., Monthly Salary' : 'Add a note...'}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`flex-shrink-0 p-2.5 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white'
                  : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white'
              }`}
            >
              {isSubmitting ? 'Saving...' : (
                editingExpense
                  ? (type === 'income' ? 'Update Income' : 'Update Expense')
                  : (type === 'income' ? 'Add Income' : 'Add Expense')
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
