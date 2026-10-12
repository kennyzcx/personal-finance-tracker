const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const emptyMessage = document.getElementById("empty-message");
const totalSpentEl = document.getElementById("total-spent");
const entryCountEl = document.getElementById("entry-count");
const dateInput = document.getElementById("date");

const categorySelectBox = document.getElementById("category-select");
const categoryToggle = document.getElementById("category-toggle");
const categoryToggleLabel = document.getElementById("category-toggle-label");
const categoryMenu = document.getElementById("category-menu");
const newCategoryRow = document.getElementById("new-category-row");
const newCategoryName = document.getElementById("new-category-name");
const addCategoryBtn = document.getElementById("add-category-btn");
const cancelCategoryBtn = document.getElementById("cancel-category-btn");
const categoryStatus = document.getElementById("category-status");

let expenses = loadExpenses();
let categories = loadCategories();

const OTHER_CATEGORY = "Other";

let selectedCategory = "";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatCurrency(amount) {
  return currencyFormatter.format(amount);
}

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function createExpense(description, amount, category, date) {
  return {
    id: Date.now().toString(),
    description: description,
    amount: amount,
    category: category,
    date: date,
  };
}

function renderExpense(expense) {
  const li = document.createElement("li");

  const info = document.createElement("div");
  info.className = "expense-info";

  const description = document.createElement("span");
  description.className = "expense-description";
  description.textContent = expense.description;

  const meta = document.createElement("span");
  meta.className = "expense-meta";
  meta.textContent = expense.category + " · " + expense.date;

  const amount = document.createElement("span");
  amount.className = "expense-amount";
  amount.textContent = formatCurrency(expense.amount);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "✕";
  deleteBtn.dataset.id = expense.id;
  deleteBtn.setAttribute("aria-label", "Delete expense");

  if (expense.description !== "") {
    info.append(description);
  }
  info.append(meta);
  li.append(info, amount, deleteBtn);
  expenseList.append(li);
}

function renderSummary() {
  const total = expenses.reduce(function (sum, expense) {
    return sum + expense.amount;
  }, 0);
  totalSpentEl.textContent = formatCurrency(total);
  entryCountEl.textContent = expenses.length;
}

function render() {
  expenseList.innerHTML = "";
  const sorted = expenses.slice().sort(function (a, b) {
    if (a.date !== b.date) {
      return a.date < b.date ? 1 : -1;
    }
    return Number(b.id) - Number(a.id);
  });
  sorted.forEach(renderExpense);
  emptyMessage.style.display = expenses.length > 0 ? "none" : "block";
  renderSummary();
  updateChart(expenses);
}

function renderCategoryItem(category, deletable) {
  const item = document.createElement("li");
  item.setAttribute("role", "option");

  const option = document.createElement("button");
  option.type = "button";
  option.className = "category-option";
  option.dataset.value = category;
  option.textContent = category;

  item.append(option);

  if (deletable) {
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "option-delete";
    removeBtn.textContent = "✕";
    removeBtn.dataset.name = category;
    removeBtn.setAttribute("aria-label", "Delete category " + category);
    item.append(removeBtn);
  }

  categoryMenu.append(item);
}

function renderCategoryMenu() {
  categoryMenu.innerHTML = "";

  categories.forEach(function (category) {
    if (category === OTHER_CATEGORY) {
      return;
    }
    renderCategoryItem(category, !BUILTIN_CATEGORIES.includes(category));
  });

  const otherIndex = categories.indexOf(OTHER_CATEGORY);
  if (otherIndex !== -1) {
    renderCategoryItem(OTHER_CATEGORY, false);
  }

  const divider = document.createElement("li");
  divider.className = "category-divider";
  divider.setAttribute("role", "separator");
  categoryMenu.append(divider);

  const addItem = document.createElement("li");
  addItem.setAttribute("role", "option");

  const addOption = document.createElement("button");
  addOption.type = "button";
  addOption.className = "category-option";
  addOption.dataset.value = "add-new";
  addOption.textContent = "Add new category…";

  addItem.append(addOption);
  categoryMenu.append(addItem);
}

function openCategoryMenu() {
  categoryMenu.hidden = false;
  categoryToggle.setAttribute("aria-expanded", "true");
}

function closeCategoryMenu() {
  categoryMenu.hidden = true;
  categoryToggle.setAttribute("aria-expanded", "false");
}

function setSelectedCategory(value) {
  selectedCategory = value;
  categoryToggleLabel.textContent = value === "" ? "Choose a category" : value;
}

function deleteCategory(name) {
  const inUse = expenses.some(function (expense) {
    return expense.category === name;
  });

  if (inUse) {
    showCategoryStatus(
      '"' + name + '" has expenses — delete or reassign those first.'
    );
    return;
  }

  categories = categories.filter(function (category) {
    return category !== name;
  });
  saveCategories(categories);

  if (selectedCategory === name) {
    setSelectedCategory("");
  }

  renderCategoryMenu();
  hideCategoryStatus();
}

function showCategoryStatus(message) {
  categoryStatus.textContent = message;
  categoryStatus.hidden = false;
}

function hideCategoryStatus() {
  categoryStatus.hidden = true;
}

function showCategoryAddMode() {
  closeCategoryMenu();
  categorySelectBox.hidden = true;
  newCategoryRow.hidden = false;
  newCategoryName.focus();
}

function hideCategoryAddMode() {
  newCategoryRow.hidden = true;
  newCategoryName.value = "";
  categorySelectBox.hidden = false;
}

function cancelNewCategory() {
  hideCategoryAddMode();
  setSelectedCategory("");
  hideCategoryStatus();
}

function addNewCategory() {
  const name = newCategoryName.value.trim();
  if (name === "" || categories.includes(name)) {
    return;
  }
  categories.push(name);
  saveCategories(categories);
  hideCategoryAddMode();
  renderCategoryMenu();
  setSelectedCategory(name);
  hideCategoryStatus();
}

categoryToggle.addEventListener("click", function () {
  if (categoryMenu.hidden) {
    openCategoryMenu();
  } else {
    closeCategoryMenu();
  }
});

document.addEventListener("click", function (event) {
  if (!categorySelectBox.contains(event.target)) {
    closeCategoryMenu();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && !categoryMenu.hidden) {
    closeCategoryMenu();
    categoryToggle.focus();
  }
});

categoryMenu.addEventListener("click", function (event) {
  const removeBtn = event.target.closest(".option-delete");
  if (removeBtn) {
    deleteCategory(removeBtn.dataset.name);
    return;
  }

  const option = event.target.closest(".category-option");
  if (!option) {
    return;
  }

  const value = option.dataset.value;
  if (value === "add-new") {
    showCategoryAddMode();
    return;
  }

  setSelectedCategory(value);
  closeCategoryMenu();
  hideCategoryStatus();
});

addCategoryBtn.addEventListener("click", addNewCategory);
cancelCategoryBtn.addEventListener("click", cancelNewCategory);

newCategoryName.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addNewCategory();
  } else if (event.key === "Escape") {
    cancelNewCategory();
  }
});

expenseForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (categorySelectBox.hidden) {
    return;
  }

  if (selectedCategory === "") {
    showCategoryStatus("Choose a category first.");
    return;
  }

  const description = document.getElementById("description").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const category = selectedCategory;
  const date = dateInput.value;

  const expense = createExpense(description, amount, category, date);
  expenses.push(expense);
  saveExpenses(expenses);
  render();

  expenseForm.reset();
  hideCategoryAddMode();
  setSelectedCategory("");
  dateInput.value = todayISO();
});

expenseList.addEventListener("click", function (event) {
  const button = event.target.closest(".delete-btn");
  if (!button) {
    return;
  }
  const id = button.dataset.id;
  expenses = expenses.filter(function (expense) {
    return expense.id !== id;
  });
  saveExpenses(expenses);
  render();
});

dateInput.value = todayISO();
renderCategoryMenu();
render();
