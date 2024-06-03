import NFTABI from '../constants/ABI/NFT.json'
import NFTMABI from '../constants/ABI/NFTM.json'


export const NFT = {
  CONTRACTADDRESS721: `0xF4dAa24E6Abb5ca1eb51944042084FE006F52E8e`,
  ABINFT: NFTABI,
};
export const NFTMarket = {
    CONTRACTADDRESSNFTM: `0x3C0773D3246A2bd60c0f85edC403Aa57c5D92428`,
    ABINFTM: NFTMABI,
};


export const DECIMAL = 1000000000000000000;

export const CHAINID = "0xaa36a7"; //sepolia testnet

export const WALLET_STATUS_LOCALSTORAGE = "wallet";
export const WALLET_ADRESS_LOCALSTORAGE = "wallet_address";

export const SIGN_KEY = "VERIFY WALLET";

