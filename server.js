// Import required dependencies
const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config({ path: './Blazzy.env' }); // Load environment variables from .env file

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;  // Use PORT from .env or default to 3000

// Middleware
app.use(cors());  // Enable Cross-Origin Resource Sharing (CORS)
app.use(express.static(path.join(__dirname, 'public')));  // Serve static files from 'public' folder

// In-memory storage for transactions (For production, replace with a real database)
let transactions = [];

// Function to fetch transactions from Cronoscan API
async function fetchTransactionsFromCronoscan() {
  try {
    // Retrieve environment variables
    const cronoscanApiKey = process.env.CRONOSCAN_API_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const cronoscanApiBaseUrl = 'https://api.cronoscan.com/api';  // Base URL for Cronoscan API

    // Make GET request to Cronoscan API
    const response = await axios.get(cronoscanApiBaseUrl, {
      params: {
        module: 'account',
        action: 'tokentx',
        contractaddress: contractAddress,  // Contract address for Blazzy token
        apikey: cronoscanApiKey,  // API key for authentication
      },
    });

    // Check if response is successful
    if (response.data.status === '1') {
      // Process and transform transactions data
      transactions = response.data.result.map(tx => {
        // Convert transaction value to CRO (assuming 18 decimals)
        const valueInCro = (parseFloat(tx.value) / Math.pow(10, 18)).toFixed(6); // Adjust precision as needed
        return {
          ...tx,
          valueInCro: valueInCro, // Add the CRO value to each transaction object
        };
      });

      // Log how many transactions were fetched
      console.log(`Fetched ${transactions.length} transactions from Cronoscan`);
    } else {
      console.error('Error fetching transactions:', response.data.message);
    }
  } catch (error) {
    // Log any error during the API call
    console.error('Error fetching data from Cronoscan API:', error.message);
  }
}

// Initial fetch of transactions when the server starts
fetchTransactionsFromCronoscan();

// Update transactions every 10 minutes (600,000 ms)
setInterval(fetchTransactionsFromCronoscan, 10 * 60 * 1000);

// Route to get all transactions
app.get('/transactions', (req, res) => {
  try {
    console.log('Sending all transactions to client...');
    res.json(transactions);  // Send the transactions array as JSON
  } catch (error) {
    console.error('Error retrieving transactions:', error.message);
    res.status(500).json({ message: 'Error retrieving transactions' });  // Handle server errors
  }
});

// Route to get a specific transaction by hash
app.get('/transaction/:hash', (req, res) => {
  try {
    const txHash = req.params.hash;  // Extract hash from URL parameter
    const transaction = transactions.find(tx => tx.hash === txHash);  // Find transaction by hash

    if (transaction) {
      console.log(`Transaction found: ${txHash}`);
      res.json(transaction);  // Send transaction details as JSON
    } else {
      console.warn(`Transaction not found: ${txHash}`);
      res.status(404).json({ message: 'Transaction not found' });  // Transaction not found error
    }
  } catch (error) {
    console.error('Error finding transaction by hash:', error.message);
    res.status(500).json({ message: 'Error retrieving transaction' });  // Handle server errors
  }
});

// Serve the frontend HTML (index.html) at the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Send the 'index.html' file to the client
});

// Start the Express server on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);  // Log server start message
});

