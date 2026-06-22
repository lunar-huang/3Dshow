  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.28;

  import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

  contract CollectibleCard is ERC721 {
      address public issuer;
      uint256 public nextTokenId;

      mapping(uint256 => uint256) public currentVersion;

      constructor(address _issuer) ERC721("CollectibleCard", "CARD") {
          issuer = _issuer;
      }

      modifier onlyIssuer() {
          require(msg.sender == issuer, "Not issuer");
          _;
      }

      function mintToIssuer(uint256 version) external onlyIssuer returns (uint256) {
          uint256 tokenId = nextTokenId;
          _safeMint(issuer, tokenId);
          currentVersion[tokenId] = version;
          nextTokenId += 1;
          return tokenId;
      }

      function claimTo(address user, uint256 tokenId) external onlyIssuer {
          require(ownerOf(tokenId) == issuer, "Already claimed");
          _transfer(issuer, user, tokenId);
      }

      function setCurrentVersion(uint256 tokenId, uint256 version) external onlyIssuer {
          ownerOf(tokenId);
          currentVersion[tokenId] = version;
      }
  }
