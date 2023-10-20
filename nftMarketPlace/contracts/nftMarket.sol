// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarket is ReentrancyGuard{

    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    //owner of the nft is the market contract. He will make a commision on every item sold. 
    //one good way is to charge a listing fee, anyone who uploads a contract pays a listing fee to
    //the owner of the contract so the owner of the contarct gets paid in commision on everyone else's transaction
    address payable owner;
    uint256 listingPrice=0.00001 ether;
    constructor() {
        owner=payable(msg.sender);
    }

    struct Marketitem {
        uint itemId;
        address nftContract;
        uint256 tokenId;

        //external account who wants to sell nft on this platform
        address payable seller;

        //owner of nft marketplace portal who gets listing fee
        address payable owner;
        uint256 price;
        bool sold;
    }

    
    
    mapping(uint256 => Marketitem) private idToMarketItem;



   
    event MarketItemCreated(

        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    function getListingPrice() public view returns (uint256) {
        return listingPrice;

    }

    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    )
    
    public payable nonReentrant{
       require(price > 0, "Price should at least be 1 wei");
       require(msg.value == listingPrice,"Price must be equal to listing price");


       _itemIds.increment();
       uint256 itemId= _itemIds.current();

       idToMarketItem[itemId] = Marketitem(
           itemId,
           nftContract,
           tokenId,
           payable(msg.sender),
           payable(address(0)),
           price,
           false
       ); 




    
        IERC721(nftContract).transferFrom(msg.sender,address(this),tokenId);  

       
        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
        
        }
    
    function createMarketSale(
        address nftContract,
        uint256 itemId

        
    )   public payable nonReentrant {
        uint price = idToMarketItem[itemId].price;
        uint tokenId=idToMarketItem[itemId].tokenId;
        require(msg.value==price, "Please submit the asking price in order to complete the purchase");
        //if above line is not satisfied then, flow will exit from this function and 
        //current transaction will be reverted

        //transfer crypto into wallet of seller 
        idToMarketItem[itemId].seller.transfer(msg.value);

        
        //the msg.sender is buyer since he is creating the function call 
        IERC721(nftContract).transferFrom(address(this),msg.sender,tokenId);

       
        idToMarketItem[itemId].owner = payable(msg.sender);
        //the sold variable is a state variable and its state is stored in blockchain 
        //and gets updated once secure transaction is made
        idToMarketItem[itemId].sold=true; 
        _itemsSold.increment();
        payable(owner).transfer(listingPrice);

    }

   
    //this functions return an array of all nfts that can be bought
    //total nfts minus nfts sold
    // function will be used in  the home page of nft marketplace
    function fetchMarketItems() public view returns (Marketitem[] memory){
        uint itemCount = _itemIds.current();
        uint unsoldItemCount= _itemIds.current() - _itemsSold.current();
        uint currentIndex=0;

        Marketitem[] memory items = new Marketitem[](unsoldItemCount);
        for(uint i=0; i< itemCount;i++){
            if(idToMarketItem[i+1].owner==address(0)){
                uint currentId=idToMarketItem[i+1].itemId;
                Marketitem storage currentItem=idToMarketItem[currentId];
                items[currentIndex]=currentItem;
                currentIndex+=1;
            }

        }
            return items;
    }

    //fetch the nfts that msg.sender own
    function fetchMyNFTs() public view returns (Marketitem[] memory){
        uint totalItemCount=_itemIds.current();
        uint itemCount=0;
        uint currentIndex=0;

        for (uint i=0;i<totalItemCount;i++)
        {
            if(idToMarketItem[i+1].owner==msg.sender){
                itemCount+=1;
                
                }
        }
            Marketitem[] memory items=new Marketitem[](itemCount);
            for(uint i=0;i<totalItemCount;i++)
            {
                if(idToMarketItem[i+1].owner==msg.sender){
                    uint currentId=i+1;
                    Marketitem storage currentItem = idToMarketItem[currentId];
                    items[currentIndex]=currentItem;
                    currentIndex+=1;


                }
            }
            return items;
    }
    

    //fetch the nfts that msg.sender have created
    function fetchItemsCreated() public view returns (Marketitem[] memory){

        uint totalItemCount = _itemIds.current();
        uint itemCount=0;
        uint currentIndex=0;

        for (uint i=0 ; i<totalItemCount ; i++){
            if(idToMarketItem[i+1].seller==msg.sender){
                itemCount+=1;

            }
        }
        Marketitem[] memory items = new Marketitem[](itemCount);
        for(uint i=0;i< totalItemCount; i++){
            if(idToMarketItem[i+1].seller==msg.sender){
                uint currentId=i+1;
                Marketitem storage currentItem= idToMarketItem[currentId];
                items[currentIndex]=currentItem;
                currentIndex+=1;


            }
        }
        return items;
    }


}

