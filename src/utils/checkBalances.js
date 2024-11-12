import { JsonRpcProvider } from "ethers";
import { ethers } from "ethers";
import { Connection, PublicKey } from "@solana/web3.js";

export async function getEthereumBalance(address) {
  try {
    const provider = new JsonRpcProvider(
      import.meta.env.VITE_ALCHEMY_ETHEREUM_API_KEY
    );
    const balance = await provider.getBalance(address);
    console.log(`Ethereum balance for ${address}:`, balance.toString());
    return ethers.utils.formatEther(balance); // Convert wei to ETH
  } catch (error) {
    console.error("Error fetching Ethereum balance:", error);
    return "0";
  }
}

export async function getSolanaBalance(publicKey) {
  try {
    const connection = new Connection(
      import.meta.env.VITE_ALCHEMY_SOLANA_API_KEY,
      "confirmed"
    );
    const balance = await connection.getBalance(new PublicKey(publicKey));
    console.log(`Solana balance for ${publicKey}:`, balance);
    return (balance / 1e9).toFixed(2); // Convert lamports to SOL
  } catch (error) {
    console.error("Error fetching Solana balance:", error);
    return "0";
  }
}
