import { useState } from "react"
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl"
export function SolanaWallet({ mnemonic }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [publicKeys, setPublicKeys] = useState([]);
    const [privateKeys, setPrivateKeys] = useState([]);
    const [revealedKeys, setRevealedKeys] = useState({});

    const togglePrivateKey = (index) => {
        setRevealedKeys(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const addWallet = () => {
        if (!mnemonic) return;
        
        const seed = mnemonicToSeed(mnemonic);
        const path = `m/44'/501'/${currentIndex}'/0'`;
        const derivedSeed = derivePath(path, seed.toString("hex")).key;
        const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
        const keypair = Keypair.fromSecretKey(secret);

        // Store both public key and private key
        setPublicKeys([...publicKeys, keypair.publicKey]);
        setPrivateKeys([...privateKeys, Buffer.from(secret).toString('hex')]);
        setCurrentIndex(currentIndex + 1);
    };

    return <div>
        <div style={{ 
            marginBottom: "15px", 
            color: "white", 
            fontSize: "14px",
            textAlign: "center"
        }}>
            Total Wallets: {publicKeys.length}
        </div>
        
        <button 
            onClick={addWallet}
            className="enhanced-button"
            style={{ 
                marginBottom: "20px",
                width: "100%",
                height: "50px",
                fontSize: "16px"
            }}
        >
            Add Solana wallet
        </button>
        
        {/* Dynamic Wallet Display */}
        {publicKeys.length > 0 && (
            <div className="wallet-scroll" style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
                gap: "20px",
                paddingRight: "10px"
            }}>
                {publicKeys.map((publicKey, index) => (
                    <div key={publicKey.toBase58()} style={{ 
                        padding: "20px",
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "12px",
                        minHeight: "200px"
                    }}>
                        <div style={{ marginBottom: "15px", fontWeight: "bold", color: "white", fontSize: "16px" }}>
                            wallet {index + 1}:
                        </div>
                        
                        <div style={{ marginBottom: "12px", fontSize: "14px", color: "#ccc" }}>
                            private key:
                            <div style={{ 
                                fontFamily: "monospace", 
                                fontSize: "12px", 
                                color: "white",
                                marginTop: "5px",
                                cursor: "pointer",
                                userSelect: "none",
                                wordBreak: "break-all",
                                overflowWrap: "break-word",
                                maxWidth: "100%"
                            }} onClick={() => togglePrivateKey(index)}>
                                {revealedKeys[index] ? 
                                    privateKeys[index] : 
                                    "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"
                                }
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: "12px", fontSize: "14px", color: "#ccc" }}>
                            public key:
                            <div style={{ 
                                fontFamily: "monospace", 
                                fontSize: "12px", 
                                color: "white",
                                marginTop: "5px",
                                wordBreak: "break-all",
                                overflowWrap: "break-word",
                                maxWidth: "100%"
                            }}>
                                {publicKey.toBase58()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
}


//