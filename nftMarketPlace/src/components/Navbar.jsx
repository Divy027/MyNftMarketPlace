

import { useState, useEffect } from "react";

import CONFIG from "../../config";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const [wallet,setWallet] = useState();
    const navigate = useNavigate();
    

  useEffect(()=> {
    const get_walletAddress = localStorage.getItem(
        CONFIG.WALLET_ADRESS_LOCALSTORAGE
      );
      setWallet(get_walletAddress)
  },[])
    

  return (
    <nav className="bg-blue-500 mx-auto w-full p-4">
    <div className="container flex flex-col md:flex-row justify-between items-center">
      {/* Logo */}
      <div onClick= {()=> navigate('/Home')} className="text-white text-2xl font-bold mb-4 md:mb-0 ">
        <a className="hover:cursor-pointer hover:text-black transition duration-300 ease-in-out">
        NFTM Marketplace
        </a>
       
      </div>
  
      {/* Navigation Links Container */}
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
        <div className="py-2 px-4 bg-white rounded-md shadow-md">
          <a href="#" onClick= {()=> navigate('/Home')} className="text-blue-500 hover:underline hover:text-blue-700 transition duration-300 ease-in-out">Home</a>
        </div>
        <div className="py-2 px-4 bg-white rounded-md shadow-md">
          <a href="#" onClick= {()=> navigate('/sell')}className="text-blue-500 hover:underline hover:text-blue-700 transition duration-300 ease-in-out">Sell NFT</a>
        </div>
        <div className="py-2 px-4 bg-white rounded-md shadow-md">
          <a href="#" onClick= {()=> navigate('/myNFT')} className="text-blue-500 ">
            {`${wallet?.substring(0, 4)}...${wallet?.slice(-4)}`}
          </a>
        </div>
      </div>
    </div>
  </nav>
  );
};

export default Navbar;


