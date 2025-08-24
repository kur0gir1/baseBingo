"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Add a type for Ethereum provider
interface EthereumProvider {
  request: (args: { method: string }) => Promise<string[]>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

// Simple MetaMask connect/verify component
const MetaMaskConnect = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check connection and listen for account/chain changes
  useEffect(() => {
    if (typeof window === "undefined" || !(window.ethereum)) {
      setError("MetaMask is not installed.");
      setChecking(false);
      return;
    }
    const ethereum = window.ethereum as unknown as EthereumProvider;
    async function checkConnection() {
      try {
        const accounts: string[] = await ethereum.request({ method: "eth_accounts" });
        if (accounts && accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0]);
        } else {
          setIsConnected(false);
          setAccount(null);
        }
      } catch {
        setError("Failed to check MetaMask connection.");
      }
      setChecking(false);
    }
    checkConnection();
    // Listen for account and chain changes
    function handleAccountsChanged(...args: unknown[]) {
      const accounts = args[0] as string[];
      if (accounts && accounts.length > 0) {
        setIsConnected(true);
        setAccount(accounts[0]);
      } else {
        setIsConnected(false);
        setAccount(null);
      }
    }
    function handleChainChanged() {
      checkConnection();
    }
    if (ethereum.on) {
      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);
    }
    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const connectWallet = async () => {
    setError(null);
    if (!(window.ethereum)) {
      setError("MetaMask is not installed.");
      return;
    }
    const ethereum = window.ethereum as unknown as EthereumProvider;
    try {
      const accounts: string[] = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setIsConnected(true);
        setAccount(accounts[0]);
      }
    } catch (err) {
      if (typeof err === "object" && err && "code" in err && (err as { code: number }).code === 4001) {
        setError("User rejected connection.");
      } else {
        setError("User rejected connection or error occurred.");
      }
    }
  };

  useEffect(() => {
    if (isConnected) {
      // Redirect to bingo card page or show children
      // If you want to redirect, use: router.push("/bingo")
      // For now, just show children
    }
  }, [isConnected, router]);

  if (checking) {
    return <div className="flex items-center justify-center min-h-screen text-blue-400">Checking wallet...</div>;
  }
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-blue-200">
        <h2 className="text-2xl font-bold mb-4">Connect your MetaMask wallet to continue</h2>
        <button
          className="px-6 py-3 bg-blue-700 text-blue-100 rounded hover:bg-blue-800 transition text-lg font-bold mb-2"
          onClick={connectWallet}
        >
          Connect MetaMask
        </button>
        {error && <div className="text-red-400 mt-2">{error}</div>}
      </div>
    );
  }
  // Log out handler (MetaMask does not support programmatic disconnect, so just clear state)
  const logout = () => {
    setIsConnected(false);
    setAccount(null);
    setError(null);
  };

  // If connected, show children (bingo card) and a log out button
  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-50">
        {account && (
          <span className="bg-blue-900 text-blue-100 px-3 py-1 rounded font-mono text-xs">{account.slice(0, 6)}...{account.slice(-4)}</span>
        )}
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          onClick={logout}
        >
          Log Out
        </button>
      </div>
      {children}
    </div>
  );
};

export default MetaMaskConnect;
