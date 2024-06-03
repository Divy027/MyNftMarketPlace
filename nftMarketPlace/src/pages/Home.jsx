import {Contract,ethers} from 'ethers'
import {useEffect,useState} from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import CONFIG from '../../config'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatAddress, getBalance } from '../../utils'
import { useSelector } from 'react-redux'

export default function Home(){
    const [nfts,setNFts]=useState([])
    const [loadingState,setLoadingState]=useState('not-loaded')
    const [isLoading, setLoading] = useState(false);
    const storeData = useSelector((status) => status);

    useEffect(()=>{
      loadNFTs()
    },[])

    useEffect(() => {
      try {
        window.ethereum.on("accountsChanged", async () => {
          loadNFTs()
        });
      } catch (e) {
        console.log(e);
      }
    }, []);
    

    async function loadNFTs(){
      try{
        setLoading(true);
        const Provider = new ethers.providers.Web3Provider(
            window.ethereum
        );
        const signer = Provider.getSigner();
        const NftContract = new Contract(
            CONFIG.NFT.CONTRACTADDRESS721,
            CONFIG.NFT.ABINFT,
            signer
        );
        const MarketContract = new Contract(
            CONFIG.NFTMarket.CONTRACTADDRESSNFTM,
            CONFIG.NFTMarket.ABINFTM,
            signer
        );
        
        const data =await MarketContract.fetchMarketItems();
          
        const items=await Promise.all(data.map(async i=>{
            const tokenUri=await NftContract.tokenURI(i.tokenId) 
            const meta=await axios.get(tokenUri)
            let item={
                itemId: ethers.utils.parseUnits(i.itemId.toString())/CONFIG.DECIMAL,
                price: i.price.toString(),
                tokenId:i.tokenId.toNumber(),
                seller:i.seller,
                owner:i.owner,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description,
                Arbiter: i.arbiter,
            }
            console.log(item)
            return item

        }))
        setNFts(items)
        
         setLoadingState('loaded')
         setLoading(false);
      }catch(e){
        setLoading(false);
        setNFts([]);
      }
       
    }

    async function buyNFT(nft) {
        try {
          setLoading(true);
          const Provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = Provider.getSigner();
          const MarketContract = new Contract(
            CONFIG.NFTMarket.CONTRACTADDRESSNFTM,
            CONFIG.NFTMarket.ABINFTM,
            signer
          );
         
          const Balance = await getBalance();
          const Ethprice = await MarketContract.convertUsdToEth(nft.price.toString());

          if(Balance < ethers.utils.formatEther(Ethprice)){
            toast.error("Not enough Balance to buy NFT")
            setLoading(false);
            return ;
          }
          
          const transaction = await MarketContract.createMarketSale( nft.itemId, {
            value: Ethprice,
          });
          await transaction.wait();
          setLoading(false);
          loadNFTs();
          toast.success("Success in buying NFT !")
        } catch (error) {
          console.error("Error buying NFT:", error);
          toast.error("Error in Buying NFT")
          setLoading(false);
          
        }
      }
      

      const NftCard = ({ nft, buyNFT }) => {
        return (
          <div className="border border-gray-300 shadow-lg rounded-lg overflow-hidden w-64">
            <div className="h-80 overflow-hidden">
              <img src={nft.image} alt={nft.name} className="object-cover w-full h-full" />
            </div>
            <div className="p-4">
              <p className="text-xl font-semibold text-white-800">{nft.name}</p>
              <div className="h-16 overflow-hidden">
                <p className="text-gray-400 line-clamp-3">{nft.description}</p>
                <p className="text-gray-400 line-clamp-3">Arbiter = {formatAddress(nft.Arbiter)}</p>
              </div>
            </div>
            <div className="p-4 bg-blue-500">
              <p className="text-xl font-bold text-white">{nft.price} USD</p>
              <button
                onClick={() => buyNFT(nft)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mt-2 transition duration-300"
              >
                Buy
              </button>
            </div>
          </div>
        );
      };
      
      
      
      
      

    if(loadingState==="loaded" && !nfts.length) {
        return(
            <div>
              <Navbar/>
                <p className="px-10 py-10 text-2xl font-bold flex justify-center text-cyan-200">
                    There are currently no NFTs in the Marketplace.<br/> Please come back later
                </p>
            </div>
        );
    }else{
        return(
          <>
            {isLoading ? (
              <>
                <Navbar/>
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center backdrop-blur-md bg-gray-800 bg-opacity-50 z-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                </div>
              </>
            ) : (
              <div className="h-screen w-full">
                <Navbar />
                <div className="flex justify-center p-6">
                  <div className="container mx-auto py-6">
                    {/* NFT GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {nfts.map((nft, i) => (
                        <NftCard key={i} nft={nft} buyNFT={buyNFT} />
                      ))}
                    </div>  
                  </div>
                </div> 
                <ToastContainer />
              </div>
            )}
          </>
           
        );
    }
   



   
 }