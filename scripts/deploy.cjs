const fs = require("fs");
const { ethers } = require("ethers");

// Main deployment function
const main = async () => {
  const abi = JSON.parse(fs.readFileSync("./build/MoralTextNft.abi.json", "utf8"));
  const bytecode = fs.readFileSync("./build/MoralTextNft.bytecode.txt", "utf8").trim();

  // Connect to local Hardhat node
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");

  // Use the first Hardhat account as the deployer
  const signer = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );

  // Create a ContractFactory and deploy the contract
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log("Deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
  