import React, { useState, useEffect } from "react";
import { generateMnemonic } from "./utils/generateMnemonic";
import { generateAccountsFromMnemonic } from "./utils/generateAccounts";
import { getEthereumBalance, getSolanaBalance } from "./utils/checkBalances";
import {
  sendEthereumTransaction,
  sendSolanaTransaction,
} from "./utils/transactions";

function App() {
  const [accounts, setAccounts] = useState(() => {
    const savedAccounts = localStorage.getItem("accounts");
    return savedAccounts ? JSON.parse(savedAccounts) : [];
  });
  const [balances, setBalances] = useState({});
  const [transaction, setTransaction] = useState({
    to: "",
    amount: "",
    type: "ethereum",
  });
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme !== null
      ? JSON.parse(savedTheme)
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("accounts", JSON.stringify(accounts));
  }, [accounts]);

  const handleCreateAccount = () => {
    const newMnemonic = generateMnemonic();
    const initialAccount = generateAccountsFromMnemonic(newMnemonic, 0);
    setAccounts((prevAccounts) => [
      ...prevAccounts,
      { mnemonic: newMnemonic, wallets: [initialAccount], showMnemonic: false },
    ]);
    fetchBalances([initialAccount]);
  };

  const handleCreateWallet = (accountIndex) => {
    const newIndex = accounts[accountIndex].wallets.length;
    const newWallet = generateAccountsFromMnemonic(
      accounts[accountIndex].mnemonic,
      newIndex
    );
    const updatedAccounts = [...accounts];
    updatedAccounts[accountIndex].wallets.push(newWallet);
    setAccounts(updatedAccounts);
    fetchBalances([newWallet]);
  };

  const handleDeleteAccount = (accountIndex) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      const updatedAccounts = accounts.filter(
        (_, index) => index !== accountIndex
      );
      setAccounts(updatedAccounts);
    }
  };

  const handleDeleteWallet = (accountIndex, walletIndex) => {
    if (window.confirm("Are you sure you want to delete this wallet?")) {
      const updatedAccounts = [...accounts];
      updatedAccounts[accountIndex].wallets = updatedAccounts[
        accountIndex
      ].wallets.filter((_, index) => index !== walletIndex);
      setAccounts(updatedAccounts);
    }
  };

  const fetchBalances = async (wallets) => {
    const newBalances = { ...balances };
    for (const wallet of wallets) {
      newBalances[wallet.ethereum.address] = await getEthereumBalance(
        wallet.ethereum.address
      );
      newBalances[wallet.solana.publicKey] = await getSolanaBalance(
        wallet.solana.publicKey
      );
    }
    setBalances(newBalances);
  };

  const handleTransaction = async () => {
    const { to, amount, type } = transaction;
    const account = accounts[0].wallets[0]; // Use the first wallet of the first account for simplicity
    let txHash;
    if (type === "ethereum") {
      txHash = await sendEthereumTransaction(
        account.ethereum.privateKey,
        to,
        amount
      );
    } else {
      txHash = await sendSolanaTransaction(
        account.solana.privateKey,
        to,
        amount
      );
    }
    if (txHash) {
      alert(`Transaction successful! Hash: ${txHash}`);
      fetchBalances(accounts.flatMap((acc) => acc.wallets));
    } else {
      alert("Transaction failed!");
    }
  };

  const toggleMnemonicVisibility = (index) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[index].showMnemonic = !updatedAccounts[index].showMnemonic;
    setAccounts(updatedAccounts);
  };

  const copyToClipboard = (mnemonic) => {
    navigator.clipboard.writeText(mnemonic);
    alert("Mnemonic copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Crypto Wallet</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </header>

        <button
          onClick={handleCreateAccount}
          className="w-full sm:w-auto mb-8 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
        >
          Create Account
        </button>

        <div className="space-y-8">
          {accounts.map((account, accountIndex) => (
            <div
              key={accountIndex}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-semibold mb-4">
                Account {accountIndex + 1}
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => toggleMnemonicVisibility(accountIndex)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  {account.showMnemonic ? "Hide Mnemonic" : "Show Mnemonic"}
                </button>
                <button
                  onClick={() => copyToClipboard(account.mnemonic)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Copy Mnemonic
                </button>
                <button
                  onClick={() => handleDeleteAccount(accountIndex)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Delete Account
                </button>
              </div>
              {account.showMnemonic && (
                <p className="mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm break-all">
                  {account.mnemonic}
                </p>
              )}
              <button
                onClick={() => handleCreateWallet(accountIndex)}
                className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Create Wallet
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {account.wallets.map((wallet, walletIndex) => (
                  <div
                    key={walletIndex}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <h3 className="text-xl font-semibold mb-2">
                      Wallet {walletIndex + 1}
                    </h3>
                    <div className="space-y-2">
                      <h4 className="font-medium">Ethereum:</h4>
                      <p className="text-sm break-all">
                        Address: {wallet.ethereum.address}
                      </p>
                      <p>Balance: {balances[wallet.ethereum.address]} ETH</p>
                      <h4 className="font-medium mt-2">Solana:</h4>
                      <p className="text-sm break-all">
                        Public Key: {wallet.solana.publicKey}
                      </p>
                      <p>Balance: {balances[wallet.solana.publicKey]} SOL</p>
                    </div>
                    <button
                      onClick={() =>
                        handleDeleteWallet(accountIndex, walletIndex)
                      }
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      Delete Wallet
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {accounts.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Send Transaction</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Recipient Address"
                value={transaction.to}
                onChange={(e) =>
                  setTransaction({ ...transaction, to: e.target.value })
                }
                className="flex-grow p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
              <input
                type="text"
                placeholder="Amount"
                value={transaction.amount}
                onChange={(e) =>
                  setTransaction({ ...transaction, amount: e.target.value })
                }
                className="flex-grow p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
              <select
                value={transaction.type}
                onChange={(e) =>
                  setTransaction({ ...transaction, type: e.target.value })
                }
                className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="ethereum">Ethereum</option>
                <option value="solana">Solana</option>
              </select>
              <button
                onClick={handleTransaction}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
