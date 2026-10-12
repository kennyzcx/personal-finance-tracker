let spendingChart = null;

function updateChart(expenses) {
  const totalsByDate = {};
  expenses.forEach(function (expense) {
    const current = totalsByDate[expense.date] || 0;
    totalsByDate[expense.date] = current + expense.amount;
  });

  const labels = Object.keys(totalsByDate).sort();
  const data = labels.map(function (date) {
    return totalsByDate[date];
  });

  const canvas = document.getElementById("spending-chart");

  if (spendingChart) {
    spendingChart.destroy();
  }

  spendingChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Spent ($)",
          data: data,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.15)",
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "$" + value;
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return "$" + context.parsed.y.toFixed(2);
            },
          },
        },
      },
    },
  });
}
