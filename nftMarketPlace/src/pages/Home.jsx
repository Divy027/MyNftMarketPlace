import {ethers } from 'ethers'
import {useEffect,useState} from 'react'
import axios, { HttpStatusCode } from 'axios'
import Navbar from '../components/Navbar'
import CONFIG from '../../config'







export default function Home(){
    const [nfts,setNFts]=useState([])
    const [loadingState,setLoadingState]=useState('not-loaded')

    useEffect(()=>{
        loadNFTs()
    },[])

    async function loadNFTs(){
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
       
        const data =await MarketContract.fetchMarketItems()

        const items=await Promise.all(data.map(async i=>{
            const tokenUri=await NftContract.tokenURI(i.tokenId) 
            const meta=await axios.get(tokenUri)
            let price=ethers.utils.formatUnits(i.price.toString(),'ether')
            let item={
                price,
                tokenId:i.tokenId.toNumber(),
                seller:i.seller,
                owner:i.owner,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description
            }
            console.log(meta)
            return item

        }))
        setNFts(items)
        setNFts([])
         setLoadingState('loaded')
    }

    async function buyNFT(nft){
        const Provider = new ethers.providers.Web3Provider(
            window.ethereum
        );
        const signer = Provider.getSigner();
        const MarketContract = new Contract(
            CONFIG.NFTMarket.CONTRACTADDRESSNFTM,
            CONFIG.NFTMarket.ABINFTM,
            signer
        );
        
       
        const price=ethers.utils.parseUnits(nft.price.toString(),'ether')
        const transaction=await MarketContract.createMarketSale(CONFIG.NFT.CONTRACTADDRESS721,nft.tokenId,{
            value:price
        })
        await transaction.wait()
        loadNFTs()  
    }

    const NftCard = ({ nft, buyNFT }) => {
        return (
          <div className="border shadow-lg rounded-lg overflow-hidden">
            <img src={nft.image} alt={nft.name} className="w-full h-40 object-cover" />
            <div className="p-4">
              <p className="text-2xl font-semibold text-gray-800">{nft.name}</p>
              <div className="h-20 overflow-hidden">
                <p className="text-gray-400">{nft.description}</p>
              </div>
            </div>
            <div className="p-4 bg-blue-500">
              <p className="text-2xl font-bold text-white">{nft.price} ETH</p>
              <button
                onClick={() => buyNFT(nft)}
                className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded mt-2"
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
                <p className="px-10 py-10 text-2xl font-bold flex justify-center text-cyan-200">
                    There are currently no NFTs in the Marketplace.<br/> Please come back later
                </p>
            </div>
        );
    }else{
        return(

            <div className="h-screen w-full ">
                  <Navbar />
          <div className="flex justify-center p-6">
           
          </div>
          <div className="container mx-auto py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {nfts.map((nft, i) => (
                <NftCard key={i} nft={nft} buyNFT={buyNFT} />
              ))}
            </div>
          </div>
        </div>
        );
    }
   



   
 }