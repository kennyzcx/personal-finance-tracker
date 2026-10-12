const STORAGE_KEY = "personal-finance-tracker:expenses";
const CATEGORIES_KEY = "personal-finance-tracker:categories";

const BUILTIN_CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Other",
];

const CATEGORY_ID_TO_NAME = {
  food: "Food",
  transport: "Transport",
  housing: "Housing",
  fun: "Entertainment",
  other: "Other",
};

function loadExpenses() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return [];
  }
  return JSON.parse(raw).map(function (expense) {
    const migrated = CATEGORY_ID_TO_NAME[expense.category];
    if (migrated) {
      expense.category = migrated;
    }
    return expense;
  });
}

function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function loadCategories() {
  const raw = localStorage.getItem(CATEGORIES_KEY);
  if (raw === null) {
    return BUILTIN_CATEGORIES.slice();
  }
  return JSON.parse(raw);
}

function saveCategories(categories) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}
