pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MoralTextNft is ERC721URIStorage {
    uint256 public nextTokenId;

    constructor() ERC721("Moral Text", "MORAL") {}

    function mint(string memory tokenURI) external returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }
}
