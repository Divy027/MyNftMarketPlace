require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {},
    polygon_mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.VITE_PRIVATE_KEY ?? ""],
    },
    
  },
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
		apiKey: process.env.VITE_POLYGONSCAN_KEY,
	},
};
// 0x9Fd5E893D45CECd5861C12416e9Bf05cdcc41774

