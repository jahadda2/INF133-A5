document.addEventListener("DOMContentLoaded", () => {
    const budgetForm = document.getElementById("budget-form");
    const expenseForm = document.getElementById("expense-form");
    const dashboard = document.getElementById("dashboard");
    const conversionForm = document.getElementById("conversion-form");
    let currentCurrency = "USD";

function updateDashboard() {
    const savedBudgets = JSON.parse(localStorage.getItem("budgets")) || [];
    const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];

    if (savedBudgets.length === 0 && savedExpenses.length === 0) {
        dashboard.innerHTML = `
            <h2>Dashboard</h2>
            <p>No data to display yet. Start by setting a budget or logging expenses.</p>`;
        return;
    }


    let budgetHTML = "<div class='budget-list'>";
    for (let i = 0; i < savedBudgets.length; i++) {
        const budget = savedBudgets[i];
        budgetHTML += `<div>${budget.category}: $${budget.amount}</div>`;
    }
    budgetHTML += "</div>";

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

    dashboard.innerHTML = `
        <h2>Dashboard</h2>
        <h3>Budgets</h3>
        ${budgetHTML}
        <h3>Expenses</h3>
        ${expenseHTML}
        <button id="clear-dashboard">Clear Dashboard</button>`;

    const clearButton = document.getElementById("clear-dashboard");
    if (clearButton) {
        clearButton.addEventListener("click", clearDashboard);
    }
}


    function clearDashboard() {
        const isConfirmed = confirm("Are you sure you want to clear the dashboard? This action cannot be undone.");

        if (isConfirmed){
            localStorage.removeItem("budgets");
            localStorage.removeItem("expenses");
            updateDashboard();
        }
    }


    budgetForm.addEventListener("submit", (event) => {
        event.preventDefault();


        const category = document.getElementById("category").value;
        const amount = document.getElementById("amount").value;


        const budgetData = JSON.parse(localStorage.getItem("budgets")) || [];
        budgetData.push({ category, amount });
        localStorage.setItem("budgets", JSON.stringify(budgetData));


        updateDashboard();


        budgetForm.reset();
    });


    expenseForm.addEventListener("submit", (event) => {
        event.preventDefault();


        const expenseCategory = document.getElementById("expense-category").value;
        const expenseAmount = document.getElementById("expense-amount").value;
        const description = document.getElementById("description").value;


        const expenseData = JSON.parse(localStorage.getItem("expenses")) || [];
        expenseData.push({ expenseCategory, expenseAmount, description });
        localStorage.setItem("expenses", JSON.stringify(expenseData));


        updateDashboard();


        expenseForm.reset();
    });

    
    conversionForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const API_KEY = "00f313268fcde4c78f1b6805"
            const API_URL = "https://v6.exchangerate-api.com/v6/" + API_KEY + "/latest/" + currentCurrency

            let newCurrency = document.getElementById("currency").value;

            try{
                const response = await fetch(API_URL);
                const data = await response.json();
                if (data.result != "success"){throw new Error("Failed to get exchange rates.")}

                currentCurrency = newCurrency;
                const conversionRate = data.conversion_rates[newCurrency];

                const budgets = JSON.parse(localStorage.getItem("budgets")) || [];
                budgets.forEach(budget => {
                    budget.amount = (budget.amount *conversionRate).toFixed(2);
                })
                localStorage.setItem("budgets", JSON.stringify(budgets));
            

                const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
                expenses.forEach(expense => {
                    expense.expenseAmount = (expense.expenseAmount * conversionRate).toFixed(2);
                })
                localStorage.setItem("expenses", JSON.stringify(expenses));

                alert("Amounts are now in " + newCurrency);
                updateDashboard();
                }

            catch (error) {
                console.error("Error:", error);
                alert("An error occured while getting exchange rates. Try again.");
                }

    });
    updateDashboard();
});