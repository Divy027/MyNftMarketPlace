import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/login';
import Home from './pages/Home';
import CreateItem from './pages/SellNft';
import MyAssets from './pages/MyNft';
import { WagmiConfig, createConfig, configureChains, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
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
      </Routes>
    </WagmiConfig>
    </>
  )
}

export default App
