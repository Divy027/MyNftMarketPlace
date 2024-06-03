import { useEffect } from "react";
import CONFIG from "../../config";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { CONNECT } from "../actions";
import { connectWallet } from "../../utils";


const Navbar = () => {
    const dispatch = useDispatch();
    const storeData = useSelector((status) => status);
   
    const navigate = useNavigate();

    const handleConnect = async () => {
      try {
        const wallet = await connectWallet();
        dispatch(
          CONNECT({
            wallet: "connected",
            address: wallet.address,
          })
        );
  
        localStorage.setItem(CONFIG.WALLET_STATUS_LOCALSTORAGE, "connected");
        localStorage.setItem(CONFIG.WALLET_ADRESS_LOCALSTORAGE, wallet.address);
      } catch (error) {
        console.log("error", error);
      }
    };
    const handleDisconnect = () => {
      dispatch(
        CONNECT({
          wallet: "disconnect",
          address: "",
        })
      );
      localStorage.setItem(CONFIG.WALLET_STATUS_LOCALSTORAGE, "disconnect");
      localStorage.setItem(CONFIG.WALLET_ADRESS_LOCALSTORAGE, "");
    };

    async function isConnected() {
      const accounts = await ethereum.request({ method: 'eth_accounts' });
  
      if (accounts.length) {
        console.log(`You're connected to: ${accounts[0]}`);
        dispatch(
          CONNECT({
              wallet: `connected`,
              address: accounts[0],
          })
      );
      localStorage.setItem(CONFIG.WALLET_STATUS_LOCALSTORAGE, "connected");
      localStorage.setItem(CONFIG.WALLET_ADRESS_LOCALSTORAGE, accounts[0]);
  
      } else {
        console.log("Metamask is not connected");
        dispatch(
          CONNECT({
              wallet: `disconnect`,
              address: ``,
          })
      );
      localStorage.setItem(CONFIG.WALLET_STATUS_LOCALSTORAGE, "disconnect");
      localStorage.setItem(CONFIG.WALLET_ADRESS_LOCALSTORAGE, "");
        
      }
    }
    

  useEffect(() => {
    try {
      window.ethereum.on("accountsChanged", async () => {
        const wallet = await connectWallet();
        localStorage.setItem(CONFIG.WALLET_STATUS_LOCALSTORAGE, "connected");
        localStorage.setItem(CONFIG.WALLET_ADRESS_LOCALSTORAGE, wallet.address);
        dispatch(
          CONNECT({
            wallet: "connected",
            address: wallet.address,
          })
        );

       
      });
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try { 
        await isConnected();
      } catch (error) {
        console.error('Error fetching Metamask data:', error);
      }
    };

    fetchData();
  }, []);
    

  return (
    <nav className="bg-blue-500 mx-auto w-full p-4">
    <div className="container flex flex-col md:flex-row justify-between items-center">
      {/* Logo */}
      <div onClick= {()=> navigate('/')} className="text-white text-2xl font-bold mb-4 md:mb-0 ">
        <a className="hover:cursor-pointer hover:text-black transition duration-300 ease-in-out">
        NFTM Marketplace
        </a>
       
      </div>
  
      {/* Navigation Links Container */}
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
        <div className="py-2 px-4 bg-white rounded-md shadow-md">
          <a href="#" onClick= {()=> navigate('/')} className="text-blue-500 hover:underline hover:text-blue-700 transition duration-300 ease-in-out">Home</a>
        </div>
        <div className="py-2 px-4 bg-white rounded-md shadow-md">
          <a href="#" onClick= {()=> navigate('/myNFT')} className="text-blue-500 hover:underline hover:text-blue-700 transition duration-300 ease-in-out">My NFT's</a>
        </div>
        <div className="py-2 px-4 bg-white rounded-md shadow-md">
          <a href="#" onClick= {()=> navigate('/sell')}className="text-blue-500 hover:underline hover:text-blue-700 transition duration-300 ease-in-out">Sell NFT</a>
        </div>
        <div className="py-2 px-4 bg-white rounded-md shadow-md">
          <a href="#" onClick= {()=> navigate('/DisputeSale')}className="text-blue-500 hover:underline hover:text-blue-700 transition duration-300 ease-in-out">Dispute Sale</a>
        </div>
        <div className="py-2 px-4 bg-white rounded-md shadow-md cursor-pointer">
        {storeData.wallet === "connected" ? (
              <span
                className="bg-txtgrad inline-block bg-clip-text text-blue-500 hover:underline hover:text-blue-700 transition duration-300 font-sgui font-bold uppercase"
                onClick={handleDisconnect}
              >
                {storeData?.address
                  ? storeData?.address?.substr(0, 6) +
                  "..." +
                  storeData?.address?.substr(
                    storeData?.address.length - 4,
                    4
                  )
                  : "Connect Wallet"}
              </span>
            ) : (
              <>
                <span
                  className="bg-txtgrad inline-block text-blue-500 hover:underline hover:text-blue-700 transition duration-300  bg-clip-text font-sgui font-bold uppercase"
                  onClick={handleConnect}
                >
                  Connect
                </span>
              </>
            )}
        </div>
      </div>
    </div>
  </nav>
  );
};

export default Navbar;


