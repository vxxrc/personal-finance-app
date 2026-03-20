import { useState, useRef, useEffect } from 'react';
import { X, Mic, MicOff } from 'lucide-react';

const CATEGORIES = {
  'Fixed Expenses': ['Rent', 'Utilities', 'Subscriptions', 'Insurance'],
  'Daily': ['Groceries', 'Dining', 'Coffee', 'Transportation'],
  'Discretionary': ['Shopping', 'Entertainment', 'Health', 'Other'],
  'Investments': ['Stocks', 'Crypto']
};

const ExpenseForm = ({ isOpen, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank'); // 'bank' or 'credit'
  const [isListening, setIsListening] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);

  const recognitionRef = useRef(null);
  const amountInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && amountInputRef.current) {
      amountInputRef.current.focus();
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category || !subCategory) {
      alert('Please fill in amount and category');
      return;
    }

    onSubmit({
      amount: parseFloat(amount),
      category,
      subCategory,
      note,
      paymentMethod,
      date: new Date().toISOString()
    });

    // Reset form
    setAmount('');
    setCategory('');
    setSubCategory('');
    setNote('');
    setPaymentMethod('bank');
    setShowCategorySelect(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-800 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Add Expense</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-gray-400">₹</span>
              <input
                ref={amountInputRef}
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-2xl font-semibold border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            {!showCategorySelect ? (
              <button
                type="button"
                onClick={() => setShowCategorySelect(true)}
                className="w-full px-4 py-3 text-left border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              >
                {category && subCategory ? `${category} > ${subCategory}` : 'Select category...'}
              </button>
            ) : (
              <div className="border-2 border-gray-300 dark:border-slate-600 rounded-xl overflow-hidden">
                {Object.entries(CATEGORIES).map(([mainCat, subCats]) => (
                  <div key={mainCat}>
                    <div className="bg-gray-100 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {mainCat}
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-2">
                      {subCats.map((subCat) => (
                        <button
                          key={subCat}
                          type="button"
                          onClick={() => {
                            setCategory(mainCat);
                            setSubCategory(subCat);
                            setShowCategorySelect(false);
                          }}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            category === mainCat && subCategory === subCat
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-50 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-500'
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

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  paymentMethod === 'bank'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Bank
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('credit')}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  paymentMethod === 'credit'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Credit Card
              </button>
            </div>
          </div>

          {/* Note (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              placeholder="Add a note..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`flex-shrink-0 p-4 rounded-xl transition-colors ${
                isListening
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
