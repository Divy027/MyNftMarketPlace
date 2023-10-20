import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/login';
import Home from './pages/Home';
import CreateItem from './pages/SellNft';
import MyAssets from './pages/MyNft';

function App() {
  
  return (
    <>  
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path='/home' element={<Home/>}/>
        <Route path='/sell' element={<CreateItem/>} />
        <Route path='/myNFT' element={<MyAssets/>}/>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
