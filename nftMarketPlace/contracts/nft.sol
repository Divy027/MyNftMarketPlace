// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;


// ERC721 token standard is for non fungible tokens
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";



import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

//counters is a utility smart contract used for counting token items in blockchain.
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {

   

    using Counters for Counters.Counter;

    //automatically increment _tokenIds which will assign unique Id to individual NFTs
    Counters.Counter private _tokenIds;

    //address of the marketplace that we want to allow our nft to be able to interact with
    //or vice versa
  
    address contractAddress;
    

    
    constructor(address marketplaceAddress) ERC721("Metaverse Tokens","METT") {
    contractAddress=marketplaceAddress;
    
    }

    //function for minting new tokens
   function createToken(string memory tokenURI) public returns(uint){

    
       _tokenIds.increment();
       uint256 newItemId=_tokenIds.current();

        
        //The _mint() internal function is used to mint a new NFT at the given address.
       _mint(msg.sender,newItemId); 
       _setTokenURI(newItemId,tokenURI);

       //gives the marketplace the permission to transact this token between 
       // users from any external contract
       setApprovalForAll(contractAddress,true);
       return newItemId;
       
   } 
}