const fs = require("fs");
const { ethers } = require("ethers");

// Configuration
const CONFIG = {
    contractAddress: process.env.CONTRACT_ADDRESS || "YOUR_CONTRACT_ADDRESS_HERE",
    rpcUrl: process.env.RPC_URL || "http://localhost:8545",
};

async function main() {
    const tokenId = process.argv[2];

    if (tokenId === undefined) {
        console.log("Usage: node scripts/view-nft.cjs <tokenId>");
        console.log("Example: node scripts/view-nft.cjs 0");
        process.exit(1);
    }

    // Load ABI and connect
    const abi = JSON.parse(fs.readFileSync("./build/MoralTextNft.abi.json", "utf8"));
    const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
    const contract = new ethers.Contract(CONFIG.contractAddress, abi, provider);

    console.log("Fetching NFT #" + tokenId + "...\n");

    try {
        // Get token info
        const owner = await contract.ownerOf(tokenId);
        const tokenURI = await contract.tokenURI(tokenId);

        console.log("Token ID:", tokenId);
        console.log("Owner:", owner);
        console.log("Token URI:", tokenURI);

        // If it's a data URI, decode and display the metadata
        if (tokenURI.startsWith("data:application/json;base64,")) {
            const base64Data = tokenURI.replace("data:application/json;base64,", "");
            const metadata = JSON.parse(Buffer.from(base64Data, "base64").toString());
            console.log("\nMetadata:");
            console.log(JSON.stringify(metadata, null, 2));
        }
    } catch (error) {
        if (error.message.includes("ERC721NonexistentToken")) {
            console.log("❌ Token #" + tokenId + " does not exist.");
        } else {
            throw error;
        }
    }

    // Show total supply
    const nextTokenId = await contract.nextTokenId();
    console.log("\nTotal minted:", nextTokenId.toString());
}

main().catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
});
