// import { useState } from "react";
// import { mnemonicToSeed } from "bip39";
// import { Wallet, HDNodeWallet } from "ethers";

// export const EthWallet = ({ mnemonic }) => {
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const [addresses, setAddresses] = useState([]);
//     const [privateKeys, setPrivateKeys] = useState([]);
    
//     return (
//         <div>
//             <button onClick={async function () {
//                 const seed = await mnemonicToSeed(mnemonic);
//                 const derivationPath = `m/44'/60'/${currentIndex}'/0'`;
//                 const hdNode = HDNodeWallet.fromSeed(seed);
//                 const child = hdNode.derivePath(derivationPath);
//                 const privateKey = child.privateKey;
//                 const wallet = new Wallet(privateKey);
                
//                 // Store both address and private key
//                 setAddresses([...addresses, wallet.address]);
//                 setPrivateKeys([...privateKeys, privateKey]);
//                 setCurrentIndex(currentIndex + 1);
//             }}>
//                 Add ETH wallet
//             </button>
            
//             {addresses.map((address, index) => (
//                 <div key={address}>
//                     <div><strong>Wallet #{index + 1}</strong></div>
//                     <div><strong>Address:</strong> {address}</div>
//                     <div><strong>Private Key:</strong> {privateKeys[index]}</div>
//                 </div>
//             ))}
//         </div>
//     );
// };