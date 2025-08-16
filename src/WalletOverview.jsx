import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Connection, PublicKey } from "@solana/web3.js";
import "./App.css";

export function WalletOverview() {
    const { address } = useParams();
    const navigate = useNavigate();
    const [walletInfo, setWalletInfo] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (address) {
            console.log("Fetching wallet info for address:", address);
            fetchWalletInfo();
            fetchTransactionHistory();
        }
    }, [address]);

    const fetchWalletInfo = async () => {
        const maxRetries = 3;
        let retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                console.log(`Attempt ${retryCount + 1} of ${maxRetries}`);
                console.log("Starting to fetch wallet info...");
                
                // Use more reliable RPC endpoints
                const rpcEndpoints = [
                    "https://api.devnet.solana.com/",
                    "https://api.mainnet-beta.solana.com"
                ];
                
                let connection;
                let balance;
                let accountInfo;
                
                for (const endpoint of rpcEndpoints) {
                    try {
                        console.log(`Trying endpoint: ${endpoint}`);
                        connection = new Connection(endpoint, "confirmed");
                        const publicKey = new PublicKey(address);
                        
                        console.log("Fetching balance...");
                        balance = await connection.getBalance(publicKey);
                        console.log("Balance in lamports:", balance);
                        
                        console.log("Fetching account info...");
                        accountInfo = await connection.getAccountInfo(publicKey);
                        console.log("Account info:", accountInfo);
                        
                        // If we get here, the endpoint worked
                        break;
                    } catch (endpointErr) {
                        console.log(`Endpoint ${endpoint} failed:`, endpointErr.message);
                        continue;
                    }
                }
                
                if (!connection || balance === undefined) {
                    throw new Error("All RPC endpoints failed. Please try again later or use a different wallet address.");
                }
                
                const walletData = {
                    address: address,
                    balance: balance / 1000000000, // Convert lamports to SOL
                    allocatedDataSize: accountInfo ? accountInfo.data.length : 0,
                    assignedProgramId: accountInfo ? accountInfo.owner.toBase58() : "System Program",
                    executable: accountInfo ? accountInfo.executable : false
                };
                
                console.log("Setting wallet info:", walletData);
                setWalletInfo(walletData);
                return; // Success, exit the retry loop
                
            } catch (err) {
                console.error(`Attempt ${retryCount + 1} failed:`, err);
                retryCount++;
                
                if (retryCount >= maxRetries) {
                    console.error("All retry attempts failed");
                    setError(`Failed to fetch wallet information after ${maxRetries} attempts: ${err.message}`);
                } else {
                    console.log(`Retrying in 2 seconds... (${maxRetries - retryCount} attempts remaining)`);
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
                }
            }
        }
    };

    const fetchTransactionHistory = async () => {
        try {
            console.log("Starting to fetch transaction history...");
            
            const rpcEndpoints = [
                "https://rpc.helius.xyz/?api-key=a86d069d-2b5a-4412-9b50-fb4a26bb0f2c",
                "https://solana.public-rpc.com",
                "https://api.mainnet-beta.solana.com"];
            
            let connection;
            let signatures = [];
            
            for (const endpoint of rpcEndpoints) {
                try {
                    console.log(`Trying endpoint for transactions: ${endpoint}`);
                    connection = new Connection(endpoint, "confirmed");
                    const publicKey = new PublicKey(address);
                    
                    // Get recent transaction signatures
                    console.log("Fetching transaction signatures...");
                    signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
                    console.log("Found signatures:", signatures.length);
                    
                    // If we get here, the endpoint worked
                    break;
                } catch (endpointErr) {
                    console.log(`Endpoint ${endpoint} failed for transactions:`, endpointErr.message);
                    continue;
                }
            }
            
            if (!connection || signatures.length === 0) {
                console.log("No transactions found or all endpoints failed");
                setTransactions([]);
                return;
            }
            
            // Get transaction details for each signature
            const txDetails = await Promise.all(
                signatures.map(async (sig) => {
                    try {
                        const tx = await connection.getTransaction(sig.signature, {
                            maxSupportedTransactionVersion: 0
                        });
                        console.log("Tx", tx);
                        return {
                            signature: sig.signature,
                            blockTime: tx?.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'Unknown',
                            status: tx?.meta?.err ? 'Failed' : 'Success',
                            fee: tx?.meta?.fee ? tx.meta.fee / 1000000000 : 0
                        };
                    } catch (err) {
                        console.error("Error fetching transaction:", err);
                        return {
                            signature: sig.signature,
                            blockTime: 'Unknown',
                            status: 'Unknown',
                            fee: 0
                        };
                    }
                })
            );
            
            console.log("Setting transactions:", txDetails);
            setTransactions(txDetails);
        } catch (err) {
            console.error("Error in fetchTransactionHistory:", err);
            // Don't set error here as it's not critical for the main functionality
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    if (loading) {
        return (
            <div className="main-container" style={{ textAlign: "center" }}>
                <div>Loading wallet information...</div>
                <div style={{ fontSize: "14px", color: "#888", marginTop: "10px" }}>
                    Address: {address}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-container" style={{ textAlign: "center" }}>
                <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>
                <div style={{ marginBottom: "20px", fontSize: "14px" }}>
                    Address: {address}
                </div>
                <div style={{ marginBottom: "20px", fontSize: "14px", color: "#888" }}>
                    This might be due to RPC endpoint issues. Try refreshing or use a different wallet address.
                </div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button 
                        onClick={() => {
                            setError(null);
                            setLoading(true);
                            fetchWalletInfo();
                            fetchTransactionHistory();
                        }}
                        className="enhanced-button"
                        style={{ padding: "10px 20px",color: "white",border: "none",borderRadius: "8px",cursor: "pointer"
                        }}
                    >
                        🔄 Retry
                    </button>
                    <button 
                        onClick={() => navigate("/")}
                        className="enhanced-button"
                        style={{ padding: "10px 20px",color: "white",border: "none",borderRadius: "8px",cursor: "pointer"
                        }}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="main-container">
            <button 
                onClick={() => navigate("/")}
                className="enhanced-button"
                style={{ marginBottom: "20px", padding: "10px 20px",color: "white",border: "none",borderRadius: "8px",cursor: "pointer"
                }}
            >
                ← Back to Home
            </button>

            <h1 style={{ marginBottom: "30px", color: "#646cff" }}>Wallet Overview</h1>

            {/* Overview Section */}
            <div className="wallet-section" style={{ 
                padding: "20px", 
                borderRadius: "12px", 
                marginBottom: "30px"
            }}>
                <h2 style={{ marginBottom: "20px", color: "#646cff" }}>Overview</h2>
                
                <div style={{ display: "grid", gap: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: "bold" }}>Address:</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontFamily: "monospace", fontSize: "14px" }}>
                                {walletInfo?.address}
                            </span>
                            <button 
                                onClick={() => copyToClipboard(walletInfo?.address)}
                                style={{ padding: "5px 10px", backgroundColor: "#333", border: "none",borderRadius: "4px",cursor: "pointer",color: "white"
                                }}
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: "bold" }}>Balance (SOL):</span>
                        <span>{walletInfo?.balance ? `${walletInfo.balance.toFixed(9)} SOL` : "Account does not exist"}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: "bold" }}>Allocated Data Size:</span>
                        <span>{walletInfo?.allocatedDataSize} byte(s)</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: "bold" }}>Assigned Program Id:</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontFamily: "monospace", fontSize: "14px" }}>
                                {walletInfo?.assignedProgramId}
                            </span>
                            <button 
                                onClick={() => copyToClipboard(walletInfo?.assignedProgramId)}
                                style={{ padding: "5px 10px", backgroundColor: "#333", border: "none", borderRadius: "4px",cursor: "pointer",color: "white"
                                }}
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: "bold" }}>Executable:</span>
                        <span>{walletInfo?.executable ? "Yes" : "No"}</span>
                    </div>
                </div>
            </div>

            {/* Transaction History Section */}
            <div className="wallet-section" style={{ 
                padding: "20px", 
                borderRadius: "12px"
            }}>
                <h2 style={{ marginBottom: "20px", color: "#646cff" }}>Transaction History</h2>
                
                {transactions.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#888", padding: "20px" }}>
                        No transactions found for this wallet
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "10px" }}>
                        {transactions.map((tx, index) => (
                            <div key={index} style={{ 
                                padding: "15px", 
                                backgroundColor: "rgba(51, 51, 51, 0.8)",
                                borderRadius: "8px",
                                border: "1px solid rgba(255, 255, 255, 0.1)"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                    <span style={{ fontWeight: "bold" }}>Transaction #{index + 1}</span>
                                    <span style={{ 
                                        color: tx.status === 'Success' ? '#4CAF50' : 
                                               tx.status === 'Failed' ? '#f44336' : '#888'
                                    }}>
                                        {tx.status}
                                    </span>
                                </div>
                                
                                <div style={{ display: "grid", gap: "5px", fontSize: "14px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Signature:</span>
                                        <span style={{ fontFamily: "monospace", fontSize: "12px" }}>
                                            {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Time:</span>
                                        <span>{tx.blockTime}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Fee:</span>
                                        <span>{tx.fee} SOL</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
