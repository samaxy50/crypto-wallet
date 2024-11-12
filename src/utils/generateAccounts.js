import * as bip39 from "bip39";
import { BIP32Factory } from "bip32";
import * as ecc from "tiny-secp256k1";
import { Keypair } from "@solana/web3.js";
import { ethers } from "ethers";
import { Buffer } from "buffer";

const bip32 = BIP32Factory(ecc);

export function generateAccountsFromMnemonic(mnemonic, index) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const node = bip32.fromSeed(seed);

  // Derive Ethereum account
  const ethPath = `m/44'/60'/0'/0/${index}`;
  const ethChild = node.derivePath(ethPath);
  const ethWallet = new ethers.Wallet(
    Buffer.from(ethChild.privateKey).toString("hex")
  );

  // Derive Solana account
  const solPath = `m/44'/501'/0'/0/${index}`;
  const solChild = node.derivePath(solPath);
  const solKeypair = Keypair.fromSeed(solChild.privateKey.slice(0, 32));

  return {
    ethereum: {
      address: ethWallet.address,
      publicKey: ethWallet.publicKey,
      privateKey: ethWallet.privateKey,
    },
    solana: {
      publicKey: solKeypair.publicKey.toString(),
      privateKey: Buffer.from(solKeypair.secretKey).toString("hex"),
    },
  };
}
