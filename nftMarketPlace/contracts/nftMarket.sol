// SPDX-License-Identifier: MIT

pragma solidity 0.8.23;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

// NFTMarket contract to manage the listing, sale, and dispute resolution of NFTs on a marketplace
contract NFTMarket is ReentrancyGuard, KeeperCompatibleInterface {
    using Counters for Counters.Counter;
    
    Counters.Counter private _itemIds;  // Counter for item IDs
    Counters.Counter private _itemsSold; // Counter for sold items

    address payable owner;  // Owner of the marketplace
    AggregatorV3Interface internal priceFeed;  // Chainlink price feed for ETH/USD conversion

    // Constructor to set the owner and price feed address
    constructor(address _priceFeed) {
        owner = payable(msg.sender);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    // Struct to represent a market item
    struct MarketItem {
        uint itemId;  // Unique ID for the item
        address nftContract;  // Address of the NFT contract
        uint256 tokenId;  // Token ID of the NFT
        address payable seller;  // Seller's address
        address payable owner;  // Buyer's address (initially zero address)
        uint256 price;  // Price of the NFT in USD
        bool sold;  // Status of the item (sold or not)
        address arbiter;  // Arbiter's address for dispute resolution
        uint256 saleEndTime;  // End time for the sale
        bool disputed;  // Dispute status
        bool finalized;  // Finalization status
        address payable buyer;  // Buyer's address
    }

    mapping(uint256 => MarketItem) private idToMarketItem;  // Mapping to store market items by their ID

    // Events to emit changes in market items
    event MarketItemCreated(
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold,
        address arbiter
    );

    event MarketItemDisputed(
        uint indexed itemId,
        address indexed arbiter
    );

    // Function to get the marketplace commission percentage
    function getSaleCommission() public pure returns (uint8) {
        return 10;
    }

    // Function to get the latest ETH/USD price from Chainlink
    function getLatestPrice() public view returns (int) {
        (, int price, , , ) = priceFeed.latestRoundData();
        return price;
    }

    // Function to convert USD amount to ETH based on the latest price feed
    function convertUsdToEth(uint256 usdAmount) public view returns (uint256) {
        uint256 ethPriceInUsd = uint256(getLatestPrice());
        uint256 usdAmountInEth = (usdAmount * 1e16) / ethPriceInUsd * 1e10;
        return usdAmountInEth;
    }

    // Function to create a new market item
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        address arbiter
    ) public payable nonReentrant {
        require(price > 0, "Price should be greater than 0 USD");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false,
            arbiter,
            0,
            false,
            false,
            payable(address(0))
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false,
            arbiter
        );
    }

    // Function to facilitate the purchase of a market item
    function createMarketSale(
        uint256 itemId
    ) public payable nonReentrant {
        MarketItem storage item = idToMarketItem[itemId];

        require(!item.sold, "Item is already sold");
        uint price = item.price;

        uint256 priceInEth = convertUsdToEth(price);
        require(msg.value >= priceInEth, "Please submit the asking price in ETH");

        item.saleEndTime = block.timestamp + 1 days;
        item.buyer = payable(msg.sender);
        item.sold = true;
        item.owner = payable(msg.sender);
        _itemsSold.increment();

        // If arbiter is zero address, finalize the sale immediately
        if (item.arbiter == address(0)) {
            item.finalized = true;

            uint commission = (convertUsdToEth(item.price) * 10) / 100; // 10% commission
            uint sellerAmount = convertUsdToEth(item.price) - commission;

            item.seller.transfer(sellerAmount);
            payable(owner).transfer(commission);
            IERC721(item.nftContract).transferFrom(address(this), item.owner, item.tokenId);
        }
    }

    // Function for the arbiter to dispute a sale within the dispute period
    function disputeSale(uint256 itemId) public nonReentrant {
        MarketItem storage item = idToMarketItem[itemId];
        require(msg.sender == item.arbiter, "Only the assigned arbiter can dispute the sale");
        require(block.timestamp <= item.saleEndTime, "Dispute period has ended");
        require(!item.disputed, "Sale is already disputed");

        item.disputed = true;
        item.owner = item.seller;

        IERC721(item.nftContract).transferFrom(address(this), item.seller, item.tokenId);
        item.buyer.transfer(convertUsdToEth(item.price));

        emit MarketItemDisputed(itemId, msg.sender);
    }

    // Function to check if any item needs to be finalized by Chainlink Keepers
    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory /* performData */) {
        for (uint i = 0; i < _itemIds.current(); i++) {
            MarketItem storage item = idToMarketItem[i + 1];
            if (item.sold && !item.finalized && !item.disputed && block.timestamp > item.saleEndTime) {
                return (true, abi.encode(i + 1));
            }
        }
        return (false, bytes(""));
    }

    // Function to perform upkeep by finalizing the sale of an item
    function performUpkeep(bytes calldata performData) external override {
        uint256 itemId = abi.decode(performData, (uint256));
        MarketItem storage item = idToMarketItem[itemId];

        if (item.sold && !item.finalized && !item.disputed && block.timestamp > item.saleEndTime) {
            item.finalized = true;

            uint commission = (convertUsdToEth(item.price) * 10) / 100; // 10% commission
            uint sellerAmount = convertUsdToEth(item.price) - commission;

            item.seller.transfer(sellerAmount);
            payable(owner).transfer(commission);
            IERC721(item.nftContract).transferFrom(address(this), item.owner, item.tokenId);
        }
    }

    // Function to fetch all unsold market items
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint itemCount = _itemIds.current();
        uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0) && !idToMarketItem[i + 1].sold) {
                uint currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // Function to fetch all NFTs owned by the caller
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // Function to fetch all market items created by the caller
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // Function to fetch all items where msg.sender acted as the disputer
    function fetchDisputedItems() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        // Count the number of items where msg.sender acted as the disputer
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].arbiter == msg.sender) {
                itemCount += 1;
            }
        }

        // Initialize an array to store the disputed items
        MarketItem[] memory items = new MarketItem[](itemCount);

        // Populate the array with disputed items
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].arbiter == msg.sender) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

}
