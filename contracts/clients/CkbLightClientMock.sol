// // SPDX-License-Identifier: Apache-2.0
// pragma solidity ^0.8.9;

// import "./CkbClient.sol";

// // contract CkbLightClientMock is CkbLightClient {
// contract CkbLightClientMock is CkbLightClient {
//     // Mock function for `getHeader`
//     function getHeader(
//         bytes32
//     ) public pure override returns (CKBHeader memory) {
//         bytes32 transactionsRoot = 0x7c57536c95df426f5477c344f8f949e4dfd25443d6f586b4f350ae3e4b870433;

//         CKBHeader memory ckbHeader = CKBHeader({
//             version: 0,
//             compactTarget: 0,
//             timestamp: 0,
//             number: 0,
//             epoch: 0,
//             parentHash: bytes32(0),
//             transactionsRoot: transactionsRoot,
//             proposalsHash: bytes32(0),
//             extraHash: bytes32(0),
//             dao: bytes32(0),
//             nonce: uint128(0),
//             extension: "",
//             blockHash: bytes32(0)
//         });
//         return ckbHeader;
//     }

//     // Convert an hexadecimal character to their value
//     function fromHexChar(uint8 c) public pure returns (uint8) {
//         if (bytes1(c) >= bytes1("0") && bytes1(c) <= bytes1("9")) {
//             return c - uint8(bytes1("0"));
//         }
//         if (bytes1(c) >= bytes1("a") && bytes1(c) <= bytes1("f")) {
//             return 10 + c - uint8(bytes1("a"));
//         }
//         if (bytes1(c) >= bytes1("A") && bytes1(c) <= bytes1("F")) {
//             return 10 + c - uint8(bytes1("A"));
//         }
//         revert("fail");
//     }

//     // Convert an hexadecimal string to raw bytes
//     function fromHex(string memory s) public pure returns (bytes memory) {
//         bytes memory ss = bytes(s);
//         require(ss.length % 2 == 0); // length must be even
//         bytes memory r = new bytes(ss.length / 2);
//         for (uint i = 0; i < ss.length / 2; ++i) {
//             r[i] = bytes1(
//                 fromHexChar(uint8(ss[2 * i])) *
//                     16 +
//                     fromHexChar(uint8(ss[2 * i + 1]))
//             );
//         }
//         return r;
//     }
// }
