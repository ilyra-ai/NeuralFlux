import { useState, useEffect } from 'react';
import { useWallet } from '@/web3/WalletProvider';
import { FLUX_TOKEN_INFO } from '@/web3/FluxToken';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { PublicKey } from '@solana/web3.js';
import WalletDropdown from '@/components/WalletDropdown';

// Governance proposal interface
interface Proposal {
  id: string;
  title: string;
  description: string;
  creator: string;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  voteStart: Date;
  voteEnd: Date;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
}

// Mock proposals data
const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'prop-1',
    title: 'Expand Model Support',
    description: 'Add support for new AI generative models, including Stable Diffusion XL and Runway Gen-2.',
    creator: '0x1a2...3b4c',
    status: 'active',
    voteStart: new Date('2025-05-01'),
    voteEnd: new Date('2025-05-08'),
    votesFor: 15000,
    votesAgainst: 5000,
    totalVotes: 20000
  },
  {
    id: 'prop-2',
    title: 'Token Bridge Integration',
    description: 'Integrate with Wormhole to enable cross-chain transfers of FLUX tokens and NFTs.',
    creator: '0x4d5...6e7f',
    status: 'passed',
    voteStart: new Date('2025-04-20'),
    voteEnd: new Date('2025-04-27'),
    votesFor: 32000,
    votesAgainst: 8000,
    totalVotes: 40000
  },
  {
    id: 'prop-3',
    title: 'Creator Royalty Program',
    description: 'Implement a new royalty distribution system for creators that increases their share from 85% to 90%.',
    creator: '0x7g8...9h0i',
    status: 'rejected',
    voteStart: new Date('2025-04-10'),
    voteEnd: new Date('2025-04-17'),
    votesFor: 12000,
    votesAgainst: 28000,
    totalVotes: 40000
  },
  {
    id: 'prop-4',
    title: 'Platform Fee Reduction',
    description: 'Reduce platform fees from 2.5% to 1.5% to attract more creators and buyers.',
    creator: '0xj2k...3l4m',
    status: 'executed',
    voteStart: new Date('2025-03-15'),
    voteEnd: new Date('2025-03-22'),
    votesFor: 45000,
    votesAgainst: 15000,
    totalVotes: 60000
  }
];

// DAO metrics interface
interface DAOMetrics {
  totalStaked: number;
  activeStakers: number;
  treasuryBalance: number;
  activeProposals: number;
}

// Mock DAO metrics
const MOCK_DAO_METRICS: DAOMetrics = {
  totalStaked: 1250000,
  activeStakers: 1876,
  treasuryBalance: 750000,
  activeProposals: 5
};

export default function DAOPage() {
  const { connected, publicKey, connectWallet, isPhantomInstalled } = useWallet();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [metrics, setMetrics] = useState<DAOMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stakedAmount, setStakedAmount] = useState(0);
  const [tab, setTab] = useState('proposals');
  
  // Load DAO data
  useEffect(() => {
    const loadDAOData = async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProposals(MOCK_PROPOSALS);
      setMetrics(MOCK_DAO_METRICS);
      setIsLoading(false);
      
      // If connected, set mock staked amount
      if (connected && publicKey) {
        // Mock staked amount (would come from contract)
        setStakedAmount(Math.floor(Math.random() * 5000));
      }
    };
    
    loadDAOData();
  }, [connected, publicKey]);
  
  // Get status badge class
  const getStatusBadgeClass = (status: Proposal['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'passed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'executed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  // Render wallet connection section based on Phantom installation status
  const renderWalletConnection = () => {
    if (!isPhantomInstalled) {
      return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg mb-8 text-center">
          <p className="mb-4">Phantom wallet extension is not installed. You need Phantom wallet to participate in governance.</p>
          <a 
            href="https://phantom.app/download" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-purple-600 hover:bg-purple-700 rounded-lg py-2 px-4 text-white font-bold"
          >
            Install Phantom Wallet
          </a>
        </div>
      );
    }
    
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8 text-center">
        <p className="mb-4">Connect your wallet to stake tokens and participate in governance</p>
        <button 
          onClick={connectWallet}
          className="bg-purple-600 hover:bg-purple-700 rounded-lg py-2 px-4 text-white font-bold"
        >
          Connect Wallet
        </button>
      </div>
    );
  };
  
  return (
    <Layout title="NeuralFlux - DAO Governance">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <Link href="/" className="text-primary hover:underline mb-4 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold">NeuralFlux DAO</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Participate in governance and shape the future of the NeuralFlux platform
          </p>
        </header>
        
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        ) : (
          <>
            {/* DAO Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="card">
                <div className="text-sm text-gray-500 mb-1">Total Staked</div>
                <div className="text-2xl font-bold">
                  {metrics?.totalStaked.toLocaleString()} {FLUX_TOKEN_INFO.symbol}
                </div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-500 mb-1">Active Stakers</div>
                <div className="text-2xl font-bold">
                  {metrics?.activeStakers.toLocaleString()}
                </div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-500 mb-1">Treasury Balance</div>
                <div className="text-2xl font-bold">
                  {metrics?.treasuryBalance.toLocaleString()} {FLUX_TOKEN_INFO.symbol}
                </div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-500 mb-1">Active Proposals</div>
                <div className="text-2xl font-bold">
                  {metrics?.activeProposals}
                </div>
              </div>
            </div>
            
            {/* User Staking Card */}
            <div className="card mb-8">
              <h2 className="text-xl font-bold mb-4">Your DAO Participation</h2>
              
              {!connected ? (
                renderWalletConnection()
              ) : (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div>
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-1">Staked Amount</div>
                      <div className="text-xl font-bold">{stakedAmount} {FLUX_TOKEN_INFO.symbol}</div>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      Staking tokens gives you voting power in the DAO
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-2 mt-4 md:mt-0">
                    {/* Wallet Dropdown - instead of separate wallet buttons */}
                    <WalletDropdown minimal={true} className="mb-2 md:mb-0" />
                    
                    <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">
                      Stake More Tokens
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
                      Unstake Tokens
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Tabs */}
            <div className="flex border-b mb-6">
              <button
                onClick={() => setTab('proposals')}
                className={`py-2 px-4 font-medium ${
                  tab === 'proposals'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Governance Proposals
              </button>
              <button
                onClick={() => setTab('treasury')}
                className={`py-2 px-4 font-medium ${
                  tab === 'treasury'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Treasury
              </button>
            </div>
            
            {/* Proposals Tab */}
            {tab === 'proposals' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Active Proposals</h2>
                  <button 
                    disabled={!connected}
                    className={`py-2 px-4 rounded-lg font-bold ${
                      connected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Create Proposal
                  </button>
                </div>
                
                <div className="space-y-4">
                  {proposals.map(proposal => (
                    <div key={proposal.id} className="card">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold">{proposal.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(proposal.status)}`}>
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                        {proposal.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Created by</p>
                          <p className="font-mono">{proposal.creator}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Voting Period</p>
                          <p>{proposal.voteStart.toLocaleDateString()} - {proposal.voteEnd.toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>For: {proposal.votesFor.toLocaleString()} votes ({Math.round(proposal.votesFor / proposal.totalVotes * 100)}%)</span>
                          <span>Against: {proposal.votesAgainst.toLocaleString()} votes ({Math.round(proposal.votesAgainst / proposal.totalVotes * 100)}%)</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600" 
                            style={{ width: `${proposal.votesFor / proposal.totalVotes * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {proposal.status === 'active' && connected && (
                        <div className="flex space-x-2">
                          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex-1">
                            Vote For
                          </button>
                          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex-1">
                            Vote Against
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* Treasury Tab */}
            {tab === 'treasury' && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Treasury Management</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  The DAO Treasury contains funds that are managed by governance votes. Proposals for spending require a majority vote to pass.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                  <h3 className="font-bold mb-2">Treasury Balance</h3>
                  <p className="text-2xl font-bold">{metrics?.treasuryBalance.toLocaleString()} {FLUX_TOKEN_INFO.symbol}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold mb-2">Recent Allocations</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Date</th>
                          <th className="text-left py-2">Description</th>
                          <th className="text-right py-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">2025-04-15</td>
                          <td className="py-2">Developer grants</td>
                          <td className="text-right py-2">-50,000 FLUX</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">2025-04-10</td>
                          <td className="py-2">Marketing campaign</td>
                          <td className="text-right py-2">-25,000 FLUX</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">2025-04-01</td>
                          <td className="py-2">Platform fee income</td>
                          <td className="text-right py-2 text-green-600">+125,000 FLUX</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
} 