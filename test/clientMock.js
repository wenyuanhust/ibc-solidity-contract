const CkbLightClientMock = artifacts.require("CkbLightClientMock");
const ethers = require('ethers');

contract("CkbLightClientMock", () => {
    it("should return correct transactionsRoot", async () => {
        const ckbLightClientMock = await CkbLightClientMock.new();
        console.log("ckbLightClient deployed on ", ckbLightClientMock.address);  
        let txRootHexString = "0x6985ea05ba57214c2c3ef93185b0dda2a5d6b56dfcf79e51a1c4e8e2b287d72a";
        let txRootBytes32Value = ethers.utils.hexZeroPad(txRootHexString, 32);
        let blockNumberHexString = "0x2a";
        let blockNumber = ethers.utils.hexZeroPad(blockNumberHexString, 32);
        const header = await ckbLightClientMock.getHeader(blockNumber);
        console.log("txRoot ", header.transactionsRoot);  
        expect(header.transactionsRoot).to.equal(txRootBytes32Value);
    });
});
