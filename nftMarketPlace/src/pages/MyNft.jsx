import { Contract,ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import CONFIG from '../../config'
import Navbar from '../components/Navbar'

  export default function MyAssets() {
     const [nfts,setNfts]=useState([]) 
     const [loadingState,setLoadingState] = useState('not-loaded')
     useEffect(() => {
         loadNFTs()
     }, [])

     async function loadNFTs() {    

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

        const data = await MarketContract.fetchMyNFTs()

        const items = await Promise.all(data.map(async i => {
          const tokenUri = await NftContract.tokenURI(i.tokenId)
          const meta = await axios.get(tokenUri)
          let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
        
          }
          return item
        }))
        setNfts(items)
        setLoadingState('loaded') 
      }
      if (loadingState === 'loaded' && !nfts.length) {
        return (
          <div>
            <Navbar/>
              <h1 className="py-10 px-20 text-3xl text-center">No assets owned</h1>
          </div>
          
        );
      } else {
        return (
          <div>

          <Navbar/>
            <div className="flex justify-center">
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-6">

                  {/* Owned NFT GRID */}
                  {nfts.map((nft, i) => (
                    <div key={i} className="border shadow rounded-xl overflow-hidden">
                      <div className="h-80 overflow-hidden">
                        <img src={nft.image} alt={nft.name} className="object-cover w-full h-full" />
                      </div>
                      <div className="p-4 bg-black">
                        <p className="text-xl font-bold text-white">
                          Price - {nft.price} Eth
                        </p>
                      </div>
                    </div>
                  ))}
                  
                </div>
              </div>
          </div>

          </div>
        );
      }
      

  }