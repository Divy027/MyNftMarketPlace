import {useState} from 'react'
import {Contract,ethers} from 'ethers'

import { create } from 'kubo-rpc-client'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CONFIG from '../../config'

const projectId= `${import.meta.env.VITE_PROJECTID}` //<infura nft api>
const projectSecret=`${import.meta.env.VITE_PROJECTAPI}`//<infura nft api>

const auth = "Basic " + btoa(`${projectId}:${projectSecret}`);

 const client =create({
  host: "ipfs.infura.io",
  port:5001,
  protocol:"https",
  headers:{
  authorization:auth
  },
});


export default function CreateItem(){
  const [fileUrl,setFileUrl] = useState(null)
  const [formInput,updateFormInput]=useState({price:"",name:"",description:""})
  const [isLoading,setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  const navigate=useNavigate()
  
  async function onChange(e){
    const file=e.target.files[0]
    try{
      const added=await client.add(
        file,{
          progress:(prog)=>console.log(`received:${prog}`)
        }
      )
      const url=`https://nftmdivy.infura-ipfs.io/ipfs/${added.path}`
      setFileUrl(url)
    }catch(error){
      console.log("error uploading file, please try again:" ,error)
    }
  }

  async function CreateMarket(){
    setLoading(true);
    const {name,description,price}=formInput
    if(!name||!description||!price||!fileUrl) return

    const data=JSON.stringify({
      name,description,image:fileUrl
    })
    try{
      const added=await client.add(data)
      const url=`https://nftmdivy.infura-ipfs.io/ipfs/${added.path}`
      console.log(url)
      await createSale(url)
    }catch(error){
      console.log('error uploading file:',error)
      setLoading(false);
    }
  }

  async function createSale(url) {
    try {
      const Provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = Provider.getSigner();
      const NftContract = new Contract(
        CONFIG.NFT.CONTRACTADDRESS721,
        CONFIG.NFT.ABINFT,
        signer
      );
  
      const transaction = await NftContract.createToken(url);
      const tx = await transaction.wait();
      const event = tx.events[0];
      const value = event.args[2];
      const tokenId = value.toNumber();
      
      const price = ethers.utils.parseUnits(formInput.price, 'ether');
  
      const MarketContract = new Contract(
        CONFIG.NFTMarket.CONTRACTADDRESSNFTM,
        CONFIG.NFTMarket.ABINFTM,
        signer
      );
  
      let listingPrice = await MarketContract.getListingPrice();
      listingPrice = listingPrice.toString();
  
      const TX = await MarketContract.createMarketItem(CONFIG.NFT.CONTRACTADDRESS721, tokenId, price, {
        value: listingPrice,
      });
      await TX.wait();
      setLoading(false);
      toast.success("Nft ready to Sell !")
      navigate('/');
    } catch (error) {
      toast.error("Error in creating sale")
      console.error("Error creating sale:", error);
      setLoading(false);
      
    }
  }
  

  return (
    <>
    {isLoading && (
       <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center backdrop-blur-md bg-gray-800 bg-opacity-50 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    )}
    <div>
      <Navbar />
      <div className="flex justify-center">
        <div className="w-full md:w-1/2 flex flex-col items-center p-6 md:p-12">
          <input
            placeholder="NFT Name"
            className="mt-4 border rounded p-4 w-full"
            onChange={(e) => updateFormInput({ ...formInput, name: e.target.value })}
          />
  
          <textarea
            placeholder="NFT Description"
            className="mt-4 border rounded p-4 w-full"
            onChange={(e) => updateFormInput({ ...formInput, description: e.target.value })}
          />
  
          <input
            placeholder="NFT price in MATIC"
            className="mt-4 border rounded p-4 w-full"
            onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
          />
  
          <label className="mt-4 text-blue-600 cursor-pointer hover:underline">
            <input
              type="file"
              name="asset"
              className="hidden"
              onChange={onChange}
            />
            <span className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer">
              Upload NFT Image
            </span>
          </label>
  
          {fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} alt="NFT Preview" />
          )}
  
          <button
            onClick={CreateMarket}
            className="font-bold mt-6 bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white rounded p-4 shadow-lg"
          >
            Create NFT
          </button>
  
          <p className="mt-4 text-gray-600 text-sm">
            Listing price: 0.00001 MATIC
          </p>
        </div>
      </div>
      <ToastContainer/>
    </div>
    </>
  );
  

    };
