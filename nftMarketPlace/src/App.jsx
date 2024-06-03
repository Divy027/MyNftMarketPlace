import './App.css'
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import CreateItem from './pages/SellNft';
import MyAssets from './pages/MyNft';
import { WagmiConfig, createConfig, configureChains, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import Dispute from './pages/DisputeSale';
const { publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

function App() {
  
  return (
    <>  
    <WagmiConfig config={config}>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/sell' element={<CreateItem/>} />
        <Route path='/myNFT' element={<MyAssets/>}/>
        <Route path='/DisputeSale' element={<Dispute/>}/>
      </Routes>
    </WagmiConfig>
    </>
  )
}

export default App
