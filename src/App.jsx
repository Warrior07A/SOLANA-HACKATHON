import { useState } from "react";
import { generateMnemonic } from "bip39";
import { SolanaWallet } from "./sol";

import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { WalletOverview } from "./WalletOverview";
import "./App.css";

function HomePageContent() {
  const [mnemonic, setMnemonic] = useState("");
  const navigate = useNavigate();

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      const address = event.target.value.trim();
      if (address) {
        navigate(`/wallet/${address}`);
      }
    }
  };

  const handleCreateSeedPhrase = () => {
    const mn = generateMnemonic();
    setMnemonic(mn);
  };

  return (
    <div style={{ 
      display: "flex", justifyContent: "center",alignItems: "flex-start", minHeight: "100vh",width: "100%",padding: "20px",margin: "0",overflowY: "auto"
    }}>
      <div className="main-container" style={{ maxWidth: "1000px", width: "90%",textAlign: "center",margin: "0 auto",position: "relative",padding: "40px 20px"
      }}>
        {/* Top Section - Title and Input */}
        <div style={{ marginBottom: "30px" }}>
          {/* Title */}
          <h1 style={{fontSize: "4em",margin: "0 0 30px 0",color: "white",fontWeight: 500,letterSpacing: "3px",fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          }}>
            SOLANA EXPLORER
          </h1>

          {/* Input Field */}
          <input 
            className="input-field"
            style={{width: "100%", maxWidth: "700px",height: "70px", display: "block",margin: "0 auto",padding: "20px",fontSize: "18px",borderRadius: "12px",color: "white",outline: "none",
              // border:"10px" ,solid ,white
            }} 
            type="text" 
            placeholder="Enter your address"
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Bottom Section - Two Sub-sections */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "40px"
        }}>
          
          <div className="wallet-section" style={{ padding: "5px",paddingTop: 0,marginTop:0,borderRadius: "16px",textAlign: "left",minHeight: "400px"
          }}>
            <h3 style={{ margin: "0 0 25px 0", color: "#1a1a1a",fontSize: "1.4em",fontWeight: "500",textTransform: "lowercase"
            }}>
              create your seed phrase(Click again to change)
            </h3>
            
            <button 
              onClick={handleCreateSeedPhrase}
              className="enhanced-button"
              style={{ marginBottom: "30px",width: "100%",height: "50px",fontSize: "16px"
              }}
            >
              Create Seed Phrase
            </button>

            
            <div style={{                         //seed phrase mein 8 rows
              display: "grid", 
              gridTemplateColumns: "repeat(4, 1fr)", 
              gap: "12px"
            }}>
              {mnemonic ? 
                mnemonic.split(' ').map((word, index) => (
                  <div key={index} style={{padding: "15px 10px",backgroundColor: "rgba(255, 255, 255, 0.15)",border: "2px solid rgba(255, 255, 255, 0.3)",borderRadius: "8px",fontSize: "13px",textAlign: "center",color: "white",minHeight: "50px",display: "flex",alignItems: "center",justifyContent: "center",fontWeight: "500"
                  }}>
                    {word}
                  </div>
                ))
                : 
                Array(8).fill('').map((_, index) => (
                  <div key={index} style={{padding: "15px 10px",backgroundColor: "rgba(255, 255, 255, 0.08)",border: "2px solid rgba(255, 255, 255, 0.15)",borderRadius: "8px",minHeight: "50px"
                  }}></div>
                ))
              }
            </div>
          </div>

          
          <div className="wallet-section" style={{            //solana wallet addition section
            padding: "30px",
            borderRadius: "16px",
            textAlign: "left",
            minHeight: "400px"
          }}>
            <h3 style={{ 
              margin: "0 0 25px 0", 
              color: "#1a1a1a",
              fontSize: "0em",
              fontWeight: "500",
              textTransform: "lowercase"
            }}>
              Add solana wallet
            </h3>

            <SolanaWallet mnemonic={mnemonic} />

            {/* Wallet Details Display */}
            {mnemonic && (
              <div style={{ marginTop: "30px" }}>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "20px"
                }}>
                  

                  
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePageContent />} />
        <Route path="/wallet/:address" element={<WalletOverview />} />
      </Routes>
    </Router>
  );
}