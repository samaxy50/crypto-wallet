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
    <div className="p-7 w-screen h-screen overflow-auto flex flex-col items-center justify-between gap-10 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 fill-gray-900 dark:fill-gray-100 relative size-full">
      <div className="w-full flex flex-col items-center gap-10">
        <header className="w-full max-w-[1200px] flex justify-between items-center">
          <h1 className="text-orange text-4xl font-bold">spectro</h1>
          <div className="flex items-center gap-5">
            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5"
                  viewBox="0 0 512 512"
                >
                  <path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5"
                  viewBox="0 0 384 512"
                >
                  <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" />
                </svg>
              )}
            </button>
            <button onClick={handleCreateAccount} className="orange-btn-1">
              Create Account
            </button>
          </div>
        </header>
        <main className="w-full max-w-[1200px] flex flex-col gap-10">
          {accounts.length > 0 ? (
            <>
              {accounts.map((account, accountIndex) => (
                <div
                  key={accountIndex}
                  className="w-full p-7 rounded-xl bg-gray-200 dark:bg-gray-800 flex flex-col gap-5"
                >
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-semibold text-orange mr-3">
                        Account {accountIndex + 1}
                      </h2>
                      <button
                        onClick={() => toggleMnemonicVisibility(accountIndex)}
                        className="gray-btn-2"
                      >
                        {account.showMnemonic
                          ? "Hide Mnemonic"
                          : "Show Mnemonic"}
                      </button>
                      <button
                        onClick={() => copyToClipboard(account.mnemonic)}
                        className="gray-btn-2"
                      >
                        Copy Mnemonic
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCreateWallet(accountIndex)}
                        className="orange-btn-2"
                      >
                        Add New Wallet
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(accountIndex)}
                        className="gray-btn-2"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>

                  {account.showMnemonic && (
                    <p className="font-mono break-all">{account.mnemonic}</p>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {account.wallets.map((wallet, walletIndex) => (
                      <div
                        key={walletIndex}
                        className="p-5 rounded-xl bg-gray-300 dark:bg-gray-700 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between gap-5">
                          <h3 className="text-xl font-semibold text-orange">
                            Wallet {walletIndex + 1}
                          </h3>
                          <button
                            className="orange-btn-2"
                            onClick={() =>
                              handleDeleteWallet(accountIndex, walletIndex)
                            }
                          >
                            Delete Wallet
                          </button>
                        </div>
                        <div>
                          <h4 className="flex items-center gap-2">
                            <span>Ethereum:</span>
                            <span className="font-mono break-all">
                              "{wallet.ethereum.address}"
                            </span>
                          </h4>
                          <p>
                            Balance: {balances[wallet.ethereum.address] || 0}{" "}
                            ETH
                          </p>
                        </div>
                        <hr className="border-gray-500" />
                        <div>
                          <h4 className="flex items-center gap-2">
                            <span>Ethereum:</span>
                            <span className="font-mono break-all">
                              "{wallet.solana.publicKey}"
                            </span>
                          </h4>
                          <p>
                            Balance: {balances[wallet.solana.publicKey] || 0}{" "}
                            SOL
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="w-full max-w-[1200px] p-7 rounded-xl bg-gray-200 dark:bg-gray-800 flex flex-col gap-5">
                <h2 className="text-2xl font-semibold text-orange">
                  Send Transaction
                </h2>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Recipient Address"
                    value={transaction.to}
                    onChange={(e) =>
                      setTransaction({ ...transaction, to: e.target.value })
                    }
                    className="input w-full"
                  />
                  <input
                    type="text"
                    placeholder="Amount"
                    value={transaction.amount}
                    onChange={(e) =>
                      setTransaction({ ...transaction, amount: e.target.value })
                    }
                    className="input w-full"
                  />
                  <select
                    value={transaction.type}
                    onChange={(e) =>
                      setTransaction({ ...transaction, type: e.target.value })
                    }
                    className="input"
                  >
                    <option value="ethereum">Ethereum</option>
                    <option value="solana">Solana</option>
                  </select>
                  <button onClick={handleTransaction} className="orange-btn-1">
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>

      <footer className="w-full max-w-[1200px] relative flex items-center justify-between">
        <p>&copy; 2024 spectro | Created by Mohammad Bilal Mansuri</p>
        <div className="flex items-center gap-2">
          <a href="https://linkedin.com/in/mohammadbilalmansuri">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-7 hover:scale-95 active:scale-95"
              viewBox="0 0 448 512"
            >
              <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
            </svg>
          </a>
          <a href="https://x.com/bilalmansuri04">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-7 hover:scale-95 active:scale-95"
              viewBox="0 0 448 512"
            >
              <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm297.1 84L257.3 234.6 379.4 396H283.8L209 298.1 123.3 396H75.8l111-126.9L69.7 116h98l67.7 89.5L313.6 116h47.5zM323.3 367.6L153.4 142.9H125.1L296.9 367.6h26.3z" />
            </svg>
          </a>
          <a href="https://github.com/mohammadbilalmansuri">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-7 hover:scale-95 active:scale-95"
              viewBox="0 0 448 512"
            >
              <path d="M448 96c0-35.3-28.7-64-64-64H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96zM265.8 407.7c0-1.8 0-6 .1-11.6c.1-11.4 .1-28.8 .1-43.7c0-15.6-5.2-25.5-11.3-30.7c37-4.1 76-9.2 76-73.1c0-18.2-6.5-27.3-17.1-39c1.7-4.3 7.4-22-1.7-45c-13.9-4.3-45.7 17.9-45.7 17.9c-13.2-3.7-27.5-5.6-41.6-5.6s-28.4 1.9-41.6 5.6c0 0-31.8-22.2-45.7-17.9c-9.1 22.9-3.5 40.6-1.7 45c-10.6 11.7-15.6 20.8-15.6 39c0 63.6 37.3 69 74.3 73.1c-4.8 4.3-9.1 11.7-10.6 22.3c-9.5 4.3-33.8 11.7-48.3-13.9c-9.1-15.8-25.5-17.1-25.5-17.1c-16.2-.2-1.1 10.2-1.1 10.2c10.8 5 18.4 24.2 18.4 24.2c9.7 29.7 56.1 19.7 56.1 19.7c0 9 .1 21.7 .1 30.6c0 4.8 .1 8.6 .1 10c0 4.3-3 9.5-11.5 8C106 393.6 59.8 330.8 59.8 257.4c0-91.8 70.2-161.5 162-161.5s166.2 69.7 166.2 161.5c.1 73.4-44.7 136.3-110.7 158.3c-8.4 1.5-11.5-3.7-11.5-8zm-90.5-54.8c-.2-1.5 1.1-2.8 3-3.2c1.9-.2 3.7 .6 3.9 1.9c.3 1.3-1 2.6-3 3c-1.9 .4-3.7-.4-3.9-1.7zm-9.1 3.2c-2.2 .2-3.7-.9-3.7-2.4c0-1.3 1.5-2.4 3.5-2.4c1.9-.2 3.7 .9 3.7 2.4c0 1.3-1.5 2.4-3.5 2.4zm-14.3-2.2c-1.9-.4-3.2-1.9-2.8-3.2s2.4-1.9 4.1-1.5c2 .6 3.3 2.1 2.8 3.4c-.4 1.3-2.4 1.9-4.1 1.3zm-12.5-7.3c-1.5-1.3-1.9-3.2-.9-4.1c.9-1.1 2.8-.9 4.3 .6c1.3 1.3 1.8 3.3 .9 4.1c-.9 1.1-2.8 .9-4.3-.6zm-8.5-10c-1.1-1.5-1.1-3.2 0-3.9c1.1-.9 2.8-.2 3.7 1.3c1.1 1.5 1.1 3.3 0 4.1c-.9 .6-2.6 0-3.7-1.5zm-6.3-8.8c-1.1-1.3-1.3-2.8-.4-3.5c.9-.9 2.4-.4 3.5 .6c1.1 1.3 1.3 2.8 .4 3.5c-.9 .9-2.4 .4-3.5-.6zm-6-6.4c-1.3-.6-1.9-1.7-1.5-2.6c.4-.6 1.5-.9 2.8-.4c1.3 .7 1.9 1.8 1.5 2.6c-.4 .9-1.7 1.1-2.8 .4z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
