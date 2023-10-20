import { useNavigate } from "react-router-dom";
import CONFIG from "../../config";
import { connectWallet } from "../../utils";
import logo from "../assets/metamask.png"



const login  = ()=> {
   
   const navigate = useNavigate();
    
    const handleConnect = async()=> {
       const wallet =  await connectWallet();
      
      localStorage.setItem(CONFIG.WALLET_STATUS_LOCALSTORAGE, "connected");
      localStorage.setItem(CONFIG.WALLET_ADRESS_LOCALSTORAGE, wallet.address);

      if(wallet){
        const get_walletAddress = localStorage.getItem(
            CONFIG.WALLET_ADRESS_LOCALSTORAGE
          );
          console.log('wallet',get_walletAddress)
        navigate('/home');
      }
    }
    return (
        <>
          <div className="min-h-screen flex items-center justify-center">
          
            <div className="w-full max-w-2xl px-4 md:px-0">
              <div className="items-center justify-center flex">
              
                  <img src={logo} alt="LoginLogo" className="sm:w-36 w-24" />
                
              </div>
              <div className="text-center mt-8">
                <h1 className="sm:text-3xl text-2xl font-hgm font-medium text-secondary dark:text-white ">
                  <span className="text-primary">NFTM</span>
                </h1>
                <p className="text-base text-light dark:text-white font-hgr">The marketplace of NFT!</p>
              </div>
              <div className="text-center mt-16 sm:mt-24 ">
                <button
                  onClick={handleConnect}
                  className="block bg-primary text-center border border-[#000000] w-full py-3 leading-7 rounded-full font-hgr font-medium text-white hover:scale-[.98] transition-all ease-in-out duration-300"
                >
                  Connect 
                </button>
              </div>
            </div>
          </div>
          <div className="fixed top-4 right-8">
          
          </div>
        </>
      );
}

export default login