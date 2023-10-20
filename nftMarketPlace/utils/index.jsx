import CONFIG from "../config";
import Web3 from "web3";

import { utils } from "ethers";

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
                // status: "👆🏽 Ethereum Wallet is connected.",
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
          // No exist base chain in your wallet
          const networkMap = {
            
            MUMBAI_TESTNET: {
              chainId: utils.hexValue(80001), // '0x13881'
              chainName: "Matic(Polygon) Mumbai Testnet",
              nativeCurrency: { name: "tMATIC", symbol: "tMATIC", decimals: 18 },
              rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
              blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
            },
            
          };
  
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [networkMap.MUMBAI_TESTNET],
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
  
  export const connectedChain = async () => {
    try {
      const chain = await window.ethereum.request({ method: "eth_chainId" });
      if (chain === CONFIG.CHAINID) {
        return true;
      } else {
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
        console.error(`Please change to Mumbai Chain Network`);
  
        return false;
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
  
      return balance / 1000000000000000000;
    } catch (error) {
      console.log("error", error);
    }
  };