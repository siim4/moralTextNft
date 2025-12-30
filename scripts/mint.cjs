const fs = require("fs");
const { ethers } = require("ethers");

// Configuration - update these values
const CONFIG = {
    // Contract address (update after deployment)
    contractAddress: process.env.CONTRACT_ADDRESS || "YOUR_CONTRACT_ADDRESS_HERE",

    // RPC URL (use localhost for local, or Sepolia RPC for testnet)
    rpcUrl: process.env.RPC_URL || "http://localhost:8545",

    // Private key (use Hardhat default for local, or your own for testnet)
    privateKey: process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
};

// The token URI to mint - this should point to your NFT metadata
// Can be an IPFS link, HTTP URL, or even a data URI
const TOKEN_URI = process.argv[2] || "data:application/json;base64," +
    Buffer.from(JSON.stringify({
        name: "Moral Text #1",
        description: "A moral principle to live by.",
        text: "Treat others as you wish to be treated.",
    })).toString("base64");

async function main() {
    // Load the ABI
    const abi = JSON.parse(fs.readFileSync("./build/MoralTextNft.abi.json", "utf8"));

    // Connect to the network
    const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
    const signer = new ethers.Wallet(CONFIG.privateKey, provider);

    console.log("Minting from address:", signer.address);
    console.log("Token URI:", TOKEN_URI);

    // Connect to the deployed contract
    const contract = new ethers.Contract(CONFIG.contractAddress, abi, signer);

    // Get the current token ID before minting
    const nextTokenId = await contract.nextTokenId();
    console.log("Next token ID:", nextTokenId.toString());

    // Mint the NFT
    console.log("\nMinting NFT...");
    const tx = await contract.mint(TOKEN_URI);
    console.log("Transaction hash:", tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("Confirmed in block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());

    // Verify the mint
    const owner = await contract.ownerOf(nextTokenId);
    const uri = await contract.tokenURI(nextTokenId);

    console.log("\n✅ NFT Minted Successfully!");
    console.log("Token ID:", nextTokenId.toString());
    console.log("Owner:", owner);
    console.log("Token URI:", uri);
}

main().catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
});
