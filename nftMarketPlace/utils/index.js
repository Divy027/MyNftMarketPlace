import CONFIG from "../config";
import Web3 from "web3";
import { ethers } from "ethers";

export const connectWallet = async () => {
    try {
      if (window.ethereum) {
        try {
          const chain = await window.ethereum.request({ method: "eth_chainId" });
          if (chain === CONFIG.CHAINID) {
            const addressArray = await window.ethereum.request({
              method: "eth_requestAccounts",
            });
  
            console.log("addressArray", addressArray);
            if (addressArray.length > 0) {
              return {
                address: await addressArray[0],
                
              };
            } else {
              console.error(`😥 Connect your wallet account to the site.`);
            }
          } else {
            // Case other chain connected so change polygon chain
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: CONFIG.CHAINID }],
            });
            const addressArray = await window.ethereum.request({
              method: "eth_requestAccounts",
            });
            if (addressArray.length > 0) {
              return {
                address: await addressArray[0],
              };
            }
          }
        } catch (err) {
          // No exist Mumbai chain in your wallet
          const networkMap = {
            
             TESTNET: {
              chainId: ethers.utils.hexValue(11155111),
              chainName: "Sepolia",
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/demo"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
            
          };
  
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [networkMap.TESTNET],
          });
  
          const addressArray = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          if (addressArray.length > 0) {
            return {
              address: await addressArray[0],
            };
          }
        }
      } else {
        console.error(
          `🦊 You must install Metamask, a virtual Ethereum wallet, in your browser.(https://metamask.io/download.html)`
        );
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  
  
  export const getBalance = async () => {
    try {
       const web3 = new Web3(window.ethereum);
       const account = await localStorage.getItem(CONFIG.WALLET_ADRESS_LOCALSTORAGE)
       const balance= await web3.eth.getBalance(account);
      const Balance =  ethers.utils.formatEther(balance)
      return Balance;
    } catch (error) {
      console.log("error", error);
    }
  };

  export const  isValidAddress = async(address) =>{
    try {
        return ethers.utils.isAddress(address);
    } catch (e) {
        return false;
    }
  }

  export const formatAddress = (address) =>{
    if (address && address.length > 8) {
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
    return address;
  }