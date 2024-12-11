document.addEventListener("DOMContentLoaded", () => {
    const budgetForm = document.getElementById("budget-form");
    const expenseForm = document.getElementById("expense-form");
    const dashboard = document.getElementById("dashboard"); 
    const conversionForm = document.getElementById("conversion-form"); 
    let currentCurrency = "USD"; 

    // function to update the dashboard
    function updateDashboard() {
        const savedBudgets = JSON.parse(localStorage.getItem("budgets")) || []; 
        const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || []; 
        // show something if not data is saved
        if (savedBudgets.length === 0 && savedExpenses.length === 0) {
            dashboard.innerHTML = `
                <h2>Dashboard</h2>
                <p>No data to display yet. Start by setting a budget or logging expenses.</p>`;
            return;
        }

        // creates html for budget list
        let budgetHTML = "<div class='budget-list'>";
        for (let i = 0; i < savedBudgets.length; i++) {
            const budget = savedBudgets[i];
            budgetHTML += `<div>${budget.category}: $${budget.amount}</div>`;
        }
        budgetHTML += "</div>";

        // creates html for expenses list
        let expenseHTML = "<div class='expense-list'>";
        for (let i = 0; i < savedExpenses.length; i++) {
            const expense = savedExpenses[i];
            expenseHTML += `
                <div class="expense-item">
                    <span class="expense-category">${expense.expenseCategory}</span>
                    <span class="expense-amount">$${expense.expenseAmount}</span>
                    <span class="expense-description">${expense.description}</span>
                </div>`;
        }
        expenseHTML += "</div>";

        // updates the dashboard content
        dashboard.innerHTML = `
            <h2>Dashboard</h2>
            <h3>Budgets</h3>
            ${budgetHTML}
            <h3>Expenses</h3>
            ${expenseHTML}
            <button id="clear-dashboard">Clear Dashboard</button>`;

        // connects event listerner to button
        const clearButton = document.getElementById("clear-dashboard");
        if (clearButton) {
            clearButton.addEventListener("click", clearDashboard);
        }
    }

    // function to clear the dashboard and local storage
    function clearDashboard() {
        const isConfirmed = confirm("Are you sure you want to clear the dashboard? This action cannot be undone.");

        if (isConfirmed) {
            localStorage.removeItem("budgets"); // Clear budgets from local storage
            localStorage.removeItem("expenses"); // Clear expenses from local storage
            updateDashboard(); // Refresh the dashboard
        }
    }

    // handle budget form submission
    budgetForm.addEventListener("submit", (event) => {
        event.preventDefault(); //

        const category = document.getElementById("category").value; // Get category input
        const amount = document.getElementById("amount").value; // Get amount input

        const budgetData = JSON.parse(localStorage.getItem("budgets")) || []; // Retrieve budgets from local storage
        budgetData.push({ category, amount }); // Add new budget
        localStorage.setItem("budgets", JSON.stringify(budgetData)); // Save updated budgets

        updateDashboard(); // Refresh dashboard

        budgetForm.reset(); // makes form fields empty
    });

  
    expenseForm.addEventListener("submit", (event) => {
        event.preventDefault(); 

        const expenseCategory = document.getElementById("expense-category").value; // Get expense category input
        const expenseAmount = document.getElementById("expense-amount").value; // Get expense amount input
        const description = document.getElementById("description").value; // Get expense description input

        const expenseData = JSON.parse(localStorage.getItem("expenses")) || []; // Retrieve expenses from local storage
        expenseData.push({ expenseCategory, expenseAmount, description }); // Add new expense
        localStorage.setItem("expenses", JSON.stringify(expenseData)); // Save updated expenses

        updateDashboard(); // Refresh dashboard

        expenseForm.reset(); // makes form fields empty
    });

    // Handle currency conversion form submission
    conversionForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission

        const API_KEY = "00f313268fcde4c78f1b6805"; // API key for exchange rate API
        const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${currentCurrency}`;

        let newCurrency = document.getElementById("currency").value; // Get target currency

        try {
            const response = await fetch(API_URL); // Fetch exchange rates
            const data = await response.json();

            if (data.result !== "success") {
                throw new Error("Failed to get exchange rates.");
            }

            currentCurrency = newCurrency; // Update current currency
            const conversionRate = data.conversion_rates[newCurrency];

            // Update budgets with new currency
            const budgets = JSON.parse(localStorage.getItem("budgets")) || [];
            budgets.forEach(budget => {
                budget.amount = (budget.amount * conversionRate).toFixed(2);
            });
            localStorage.setItem("budgets", JSON.stringify(budgets));

            // Update expenses with new currency
            const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
            expenses.forEach(expense => {
                expense.expenseAmount = (expense.expenseAmount * conversionRate).toFixed(2);
            });
            localStorage.setItem("expenses", JSON.stringify(expenses));

            alert("Amounts are now in " + newCurrency); // display message to show the user
            updateDashboard(); // update the dashboard to the new one
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while getting exchange rates. Try again.");
        }
    });

    updateDashboard(); // show dashboard on page load
});
