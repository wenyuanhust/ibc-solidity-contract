// const CkbLightClientMock = artifacts.require("CkbLightClientMock");
// const ethers = require('ethers');

// contract("CkbLightClientMock", () => {
//     it("should return correct transactionsRoot", async () => {
//         const ckbLightClientMock = await CkbLightClientMock.new();
//         console.log("ckbLightClient deployed on ", ckbLightClientMock.address);  
//         let txRootHexString = "0x7c57536c95df426f5477c344f8f949e4dfd25443d6f586b4f350ae3e4b870433";
//         let txRootBytes32Value = ethers.utils.hexZeroPad(txRootHexString, 32);
//         let blockNumberHexString = "0x2a";
//         let blockNumber = ethers.utils.hexZeroPad(blockNumberHexString, 32);
//         const header = await ckbLightClientMock.getHeader(blockNumber);
//         console.log("txRoot ", header.transactionsRoot);  
//         expect(header.transactionsRoot).to.equal(txRootBytes32Value);
//     });
// });
