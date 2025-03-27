import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FLUX_TOKEN_INFO } from '@/web3/FluxToken';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { PublicKey } from '@solana/web3.js';

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
  const { connected, publicKey } = useWallet();
  const address = publicKey?.toBase58() || null;
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
      if (connected && publicKey && address) {
        // Mock staked amount (would come from contract)
        setStakedAmount(Math.floor(Math.random() * 5000));
      }
    };
    
    loadDAOData();
  }, [connected, publicKey, address]);
  
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
                <div>
                  <p className="mb-4">Connect your wallet to stake tokens and participate in governance</p>
                  <WalletMultiButton className="btn-primary" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-1">Staked Amount</div>
                      <div className="text-xl font-bold">{stakedAmount} {FLUX_TOKEN_INFO.symbol}</div>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      Staking FLUX tokens gives you voting power in the DAO. 1 FLUX = 1 vote.
                    </div>
                  </div>
                  <Link href="#" className="text-primary hover:underline">
                    Learn more about DAO participation
                  </Link>
                </div>
              )}
            </div>
            
            {/* Tabs */}
            <div className="mb-6 border-b">
              <div className="flex space-x-8">
                <button
                  className={`pb-4 px-2 ${
                    tab === 'proposals'
                      ? 'border-b-2 border-primary font-bold'
                      : 'text-gray-500'
                  }`}
                  onClick={() => setTab('proposals')}
                >
                  Governance Proposals
                </button>
                <button
                  className={`pb-4 px-2 ${
                    tab === 'treasury'
                      ? 'border-b-2 border-primary font-bold'
                      : 'text-gray-500'
                  }`}
                  onClick={() => setTab('treasury')}
                >
                  Treasury
                </button>
              </div>
            </div>
            
            {tab === 'proposals' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Governance Proposals</h2>
                  <Link 
                    href="#"
                    className="btn-primary-outline"
                  >
                    Create Proposal
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {proposals.map(proposal => (
                    <div key={proposal.id} className="card">
                      <div className="flex justify-between mb-2">
                        <h3 className="text-lg font-bold">{proposal.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(proposal.status)}`}>
                          {proposal.status === 'active' && 'Active'}
                          {proposal.status === 'passed' && 'Passed'}
                          {proposal.status === 'rejected' && 'Rejected'}
                          {proposal.status === 'executed' && 'Executed'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        {proposal.description}
                      </p>
                      
                      <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>Created by: {proposal.creator}</span>
                        <span>
                          {proposal.status === 'active' 
                            ? `Ends: ${proposal.voteEnd.toLocaleDateString()}` 
                            : `Ended: ${proposal.voteEnd.toLocaleDateString()}`}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Yes: {(proposal.votesFor / proposal.totalVotes * 100).toFixed(1)}%</span>
                          <span>No: {(proposal.votesAgainst / proposal.totalVotes * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-dark-light rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${proposal.votesFor / proposal.totalVotes * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Total votes: {proposal.totalVotes.toLocaleString()} {FLUX_TOKEN_INFO.symbol}
                      </div>
                      
                      {proposal.status === 'active' && connected && (
                        <div className="mt-4 flex space-x-2">
                          <button className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 py-2 rounded-lg transition-colors">
                            Vote For
                          </button>
                          <button className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 py-2 rounded-lg transition-colors">
                            Vote Against
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {tab === 'treasury' && (
              <div>
                <h2 className="text-xl font-bold mb-6">DAO Treasury</h2>
                <div className="card">
                  <p className="mb-4">
                    The DAO treasury contains funds used for platform development, marketing, and other initiatives approved by governance.
                  </p>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">Treasury Assets</h3>
                    <div className="bg-gray-100 dark:bg-dark-light p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span>FLUX</span>
                        <span>{metrics?.treasuryBalance.toLocaleString()} {FLUX_TOKEN_INFO.symbol}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>SOL</span>
                        <span>5,000 SOL</span>
                      </div>
                      <div className="flex justify-between">
                        <span>USDC</span>
                        <span>250,000 USDC</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-2">Recent Expenditures</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b dark:border-gray-700">
                            <th className="py-2 text-left text-sm">Date</th>
                            <th className="py-2 text-left text-sm">Description</th>
                            <th className="py-2 text-left text-sm">Amount</th>
                            <th className="py-2 text-left text-sm">Proposal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b dark:border-gray-700">
                            <td className="py-2 text-sm">2025-04-20</td>
                            <td className="py-2 text-sm">Developer grants - Q2</td>
                            <td className="py-2 text-sm">50,000 FLUX</td>
                            <td className="py-2 text-sm"><a href="#" className="text-primary hover:underline">View</a></td>
                          </tr>
                          <tr className="border-b dark:border-gray-700">
                            <td className="py-2 text-sm">2025-04-15</td>
                            <td className="py-2 text-sm">Marketing campaign</td>
                            <td className="py-2 text-sm">25,000 USDC</td>
                            <td className="py-2 text-sm"><a href="#" className="text-primary hover:underline">View</a></td>
                          </tr>
                          <tr className="border-b dark:border-gray-700">
                            <td className="py-2 text-sm">2025-04-05</td>
                            <td className="py-2 text-sm">AI model training</td>
                            <td className="py-2 text-sm">100,000 FLUX</td>
                            <td className="py-2 text-sm"><a href="#" className="text-primary hover:underline">View</a></td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm">2025-03-28</td>
                            <td className="py-2 text-sm">Security audit</td>
                            <td className="py-2 text-sm">15,000 USDC</td>
                            <td className="py-2 text-sm"><a href="#" className="text-primary hover:underline">View</a></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Call to Action */}
            <div className="mt-12 bg-primary/10 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Join the NeuralFlux Community</h2>
              <p className="mb-6">
                Participate in discussions, contribute to the project, and help shape the future of AI-generated content
              </p>
              <div className="flex justify-center space-x-4">
                <a href="#" className="btn-primary">
                  Discord
                </a>
                <a href="#" className="btn-secondary">
                  Twitter
                </a>
                <a href="#" className="btn-secondary">
                  Forums
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
} 