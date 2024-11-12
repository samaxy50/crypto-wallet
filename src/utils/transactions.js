import { JsonRpcProvider, Wallet } from "ethers";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
} from "@solana/web3.js";
import { Buffer } from "buffer";

// Ethereum Transaction
export async function sendEthereumTransaction(privateKey, to, amount) {
  try {
    const provider = new JsonRpcProvider(
      "https://eth-mainnet.g.alchemy.com/v2/NT4TgTCZdXeXUkXZRyx4CmoXAYnCXBt9"
    );
    const wallet = new Wallet(privateKey, provider);
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.utils.parseEther(amount),
    });
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error("Error sending Ethereum transaction:", error);
    return null;
  }
}

// Solana Transaction
export async function sendSolanaTransaction(privateKey, to, amount) {
  try {
    const connection = new Connection(
      "https://solana-mainnet.g.alchemy.com/v2/NT4TgTCZdXeXUkXZRyx4CmoXAYnCXBt9 ",
      "confirmed"
    );
    const fromKeypair = Keypair.fromSecretKey(
      Uint8Array.from(Buffer.from(privateKey, "hex"))
    );
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: new PublicKey(to),
        lamports: amount * 1e9, // Convert SOL to lamports
      })
    );
    const signature = await connection.sendTransaction(transaction, [
      fromKeypair,
    ]);
    await connection.confirmTransaction(signature, "confirmed");
    return signature;
  } catch (error) {
    console.error("Error sending Solana transaction:", error);
    return null;
  }
}
