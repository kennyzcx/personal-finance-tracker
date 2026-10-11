const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const emptyMessage = document.getElementById("empty-message");
const totalSpentEl = document.getElementById("total-spent");
const entryCountEl = document.getElementById("entry-count");
const dateInput = document.getElementById("date");

const categoryLabels = {
  food: "Food",
  transport: "Transport",
  housing: "Housing",
  fun: "Entertainment",
  other: "Other",
};

let expenses = [];

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
  meta.textContent = categoryLabels[expense.category] + " · " + expense.date;

  const amount = document.createElement("span");
  amount.className = "expense-amount";
  amount.textContent = formatCurrency(expense.amount);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "✕";
  deleteBtn.dataset.id = expense.id;
  deleteBtn.setAttribute("aria-label", "Delete expense");

  info.append(description, meta);
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
  expenses.forEach(renderExpense);
  emptyMessage.style.display = expenses.length > 0 ? "none" : "block";
  renderSummary();
}

expenseForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const description = document.getElementById("description").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = dateInput.value;

  const expense = createExpense(description, amount, category, date);
  expenses.push(expense);
  render();

  expenseForm.reset();
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
  render();
});

dateInput.value = todayISO();
render();
