const fs = require("fs");
const path = require("path");
const solc = require("solc");

// Path to the Solidity contract
const CONTRACT_FILE = path.join(__dirname, "..", "contracts", "MoralTextNft.sol");

// Helper function to resolve imports
const findImports = (importPath) => {
  // Resolve node_modules imports like @openzeppelin/...
  try {
    const resolved = path.join(__dirname, "..", "node_modules", importPath);
    return { contents: fs.readFileSync(resolved, "utf8") };
  } catch (error) {
    return { error: "File not found: " + importPath };
  }
}

// Read the contract source code
const source = fs.readFileSync(CONTRACT_FILE, "utf8");

// Prepare input for Solidity compiler
const input = {
  language: "Solidity",
  sources: {
    "MoralTextNft.sol": { content: source },
  },
  settings: {
    optimizer: { enabled: false, runs: 200 },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
  },
};

// Compile the contract
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
  const fatal = output.errors.filter((e) => e.severity === "error");
  console.log(output.errors.map((e) => e.formattedMessage).join("\n"));
  if (fatal.length) process.exit(1);
}

const contractName = "MoralTextNft";
const compiled = output.contracts["MoralTextNft.sol"][contractName];

if (!compiled) {
  console.error("Contract not found in output:", Object.keys(output.contracts["MoralTextNft.sol"] || {}));
  process.exit(1);
}

// Write ABI and bytecode to build directory
const outDir = path.join(__dirname, "..", "build");
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, "MoralTextNft.abi.json"), JSON.stringify(compiled.abi, null, 2));
fs.writeFileSync(path.join(outDir, "MoralTextNft.bytecode.txt"), compiled.evm.bytecode.object);

console.log("Wrote build/MoralTextNft.abi.json and build/MoralTextNft.bytecode.txt");
