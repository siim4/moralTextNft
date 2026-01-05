const fs = require("fs");
const { ethers } = require("ethers");
require('dotenv').config({ path: '../.env' });

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

const CONFIG = {
    // Your Sepolia RPC URL (get one from Alchemy, Infura, or use public endpoint)
    // Alchemy: https://www.alchemy.com/ (sign up for free)
    // Infura: https://www.infura.io/ (sign up for free)
    rpcUrl: process.env.RPC_URL || "https://rpc.sepolia.org",

    // Your wallet private key (NEVER commit this to git!)
    // Export from MetaMask: Settings > Security & Privacy > Export Private Key
    privateKey: process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE",
};

// ============================================

async function main() {
    // Validate private key
    if (CONFIG.privateKey === "YOUR_PRIVATE_KEY_HERE" || !CONFIG.privateKey) {
        console.error("❌ Error: Please set your private key!");
        console.error("   Either set PRIVATE_KEY environment variable or edit this file.");
        console.error("\n   Example: PRIVATE_KEY=0x... node scripts/deploy-sepolia.cjs");
        process.exit(1);
    }

    // Load compiled contract
    const abi = JSON.parse(fs.readFileSync("../build/MoralTextNft.abi.json", "utf8"));
    const bytecode = fs.readFileSync("../build/MoralTextNft.bytecode.txt", "utf8").trim();

    // Connect to Sepolia
    console.log("Connecting to Sepolia...");
    const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
    const signer = new ethers.Wallet(CONFIG.privateKey, provider);

    // Check balance
    const balance = await provider.getBalance(signer.address);
    console.log("Deployer address:", signer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
        console.error("\n❌ Error: No Sepolia ETH in wallet!");
        console.error("   Get free Sepolia ETH from a faucet:");
        console.error("   - https://sepoliafaucet.com/");
        console.error("   - https://www.alchemy.com/faucets/ethereum-sepolia");
        console.error("   - https://faucets.chain.link/sepolia");
        process.exit(1);
    }

    // Deploy contract
    console.log("\nDeploying MoralTextNft contract...");
    const factory = new ethers.ContractFactory(abi, bytecode, signer);

    const contract = await factory.deploy();
    console.log("Transaction hash:", contract.deploymentTransaction().hash);

    console.log("Waiting for confirmation...");
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();

    console.log("\n✅ Contract deployed successfully!");
    console.log("Contract address:", contractAddress);
    console.log("\nView on Etherscan:");
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);

    // Save the deployed address
    const deploymentInfo = {
        network: "sepolia",
        contractAddress,
        deployer: signer.address,
        deployedAt: new Date().toISOString(),
        transactionHash: contract.deploymentTransaction().hash,
    };

    fs.writeFileSync("../build/deployment-sepolia.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("\nDeployment info saved to build/deployment-sepolia.json");
}

main().catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
});
