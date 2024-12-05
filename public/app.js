document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-btn');
    const txHashInput = document.getElementById('tx-hash-input');
    const transactionList = document.getElementById('transaction-list');

    // Fetch and display all transactions
    async function fetchTransactions() {
        const response = await fetch('/api/transactions');
        const data = await response.json();
        const transactions = data.transactions;

        transactionList.innerHTML = '';
        transactions.forEach(tx => {
            const listItem = document.createElement('li');
            listItem.classList.add('transaction-item');

            // Determine if it's a buy or sell transaction
            const transactionType = tx.from === "0xLiquidityPoolAddress" ? 'Buy' : 'Sell'; // Example logic

            listItem.innerHTML = `
                <span class="transaction-hash">Hash: <a href="https://cronoscan.com/tx/${tx.hash}" target="_blank">${tx.hash}</a></span>
                <span class="transaction-from">From: ${tx.from}</span>
                <span class="transaction-to">To: ${tx.to}</span>
                <span class="transaction-value">Amount: ${tx.value} BLZ</span>
                <span class="transaction-type">Transaction Type: ${transactionType}</span>
            `;
            transactionList.appendChild(listItem);
        });
    }

    // Search for transaction by hash
    async function searchTransaction() {
        const hash = txHashInput.value;
        if (hash) {
            const response = await fetch(`/api/transactions/${hash}`);
            const data = await response.json();
            const transaction = data.transaction;

            transactionList.innerHTML = '';
            if (transaction) {
                const listItem = document.createElement('li');
                listItem.classList.add('transaction-item');

                // Assume it's a Buy or Sell based on logic
                const transactionType = transaction.from === "0xLiquidityPoolAddress" ? 'Buy' : 'Sell';

                listItem.innerHTML = `
                    <span class="transaction-hash">Hash: <a href="https://cronoscan.com/tx/${transaction.hash}" target="_blank">${transaction.hash}</a></span>
                    <span class="transaction-from">From: ${transaction.from}</span>
                    <span class="transaction-to">To: ${transaction.to}</span>
                    <span class="transaction-value">Amount: ${transaction.value} BLZ</span>
                    <span class="transaction-type">Transaction Type: ${transactionType}</span>
                `;
                transactionList.appendChild(listItem);
            } else {
                alert('Transaction not found');
            }
        }
    }

    searchButton.addEventListener('click', searchTransaction);

    // Initial fetch of transactions
    fetchTransactions();
});
