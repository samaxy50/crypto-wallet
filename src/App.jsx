import React, { useState, useEffect } from "react";
import { generateMnemonic } from "./utils/generateMnemonic";
import { generateAccountsFromMnemonic } from "./utils/generateAccounts";
import { getEthereumBalance, getSolanaBalance } from "./utils/checkBalances";
import {
  sendEthereumTransaction,
  sendSolanaTransaction,
} from "./utils/transactions";
import "./index.css";

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
    <div className="p-7 w-screen h-screen overflow-auto flex flex-col items-center dark:bg-gray-900 dark:text-white">
      <div className="w-full max-w-[1200px] flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Crypto Wallet</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 fill-gray-700 dark:fill-white"
        >
          {darkMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={18}
              viewBox="0 0 512 512"
            >
              <path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={18}
              viewBox="0 0 384 512"
            >
              <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" />
            </svg>
          )}
        </button>
      </div>
      <button
        onClick={handleCreateAccount}
        className="block mx-auto mb-6 p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Create Account
      </button>
      {accounts.map((account, accountIndex) => (
        <div
          key={accountIndex}
          className="w-full max-w-[1200px] p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800"
        >
          <h2 className="text-2xl font-semibold mb-2">
            Account {accountIndex + 1}
          </h2>
          <div className="mb-4">
            <button
              onClick={() => toggleMnemonicVisibility(accountIndex)}
              className="mr-2 p-2 bg-gray-300 text-black rounded-lg shadow-md hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              {account.showMnemonic ? "Hide Mnemonic" : "Show Mnemonic"}
            </button>
            <button
              onClick={() => copyToClipboard(account.mnemonic)}
              className="p-2 bg-gray-300 text-black rounded-lg shadow-md hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Copy Mnemonic
            </button>
            <button
              onClick={() => handleDeleteAccount(accountIndex)}
              className="ml-2 p-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Delete Account
            </button>
            {account.showMnemonic && (
              <p className="mt-2 font-mono">{account.mnemonic}</p>
            )}
          </div>
          <button
            onClick={() => handleCreateWallet(accountIndex)}
            className="mb-4 p-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          >
            Create Wallet
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {account.wallets.map((wallet, walletIndex) => (
              <div
                key={walletIndex}
                className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <h3 className="text-xl font-semibold">
                  Wallet {walletIndex + 1}
                </h3>
                <h4 className="mt-2">Ethereum:</h4>
                <p>
                  Address:{" "}
                  <span className="font-mono">{wallet.ethereum.address}</span>
                </p>
                <p>Balance: {balances[wallet.ethereum.address]} ETH</p>
                <h4 className="mt-2">Solana:</h4>
                <p>
                  Public Key:{" "}
                  <span className="font-mono">{wallet.solana.publicKey}</span>
                </p>
                <p>Balance: {balances[wallet.solana.publicKey]} SOL</p>
                <button
                  onClick={() => handleDeleteWallet(accountIndex, walletIndex)}
                  className="mt-2 p-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  Delete Wallet
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {accounts.length > 0 && (
        <div className="w-full max-w-[1200px] mt-5 p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
          <h2 className="text-2xl font-semibold mb-4">Send Transaction</h2>
          <div className="flex flex-wrap items-center">
            <input
              type="text"
              placeholder="Recipient Address"
              value={transaction.to}
              onChange={(e) =>
                setTransaction({ ...transaction, to: e.target.value })
              }
              className="flex-grow p-2 border rounded-lg mb-2 mr-2 dark:bg-gray-600 dark:text-white"
            />
            <input
              type="text"
              placeholder="Amount"
              value={transaction.amount}
              onChange={(e) =>
                setTransaction({ ...transaction, amount: e.target.value })
              }
              className="flex-grow p-2 border rounded-lg mb-2 mr-2 dark:bg-gray-600 dark:text-white"
            />
            <select
              value={transaction.type}
              onChange={(e) =>
                setTransaction({ ...transaction, type: e.target.value })
              }
              className="p-2 border rounded-lg mb-2 mr-2 dark:bg-gray-600 dark:text-white"
            >
              <option value="ethereum">Ethereum</option>
              <option value="solana">Solana</option>
            </select>
            <button
              onClick={handleTransaction}
              className="p-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
