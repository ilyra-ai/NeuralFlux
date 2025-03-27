# NeuralFlux: Web3 AI Video Generation Ecosystem

NeuralFlux is an innovative platform that combines cutting-edge AI video generation technology with Web3 economic models, enabling creators to create and monetize in unprecedented ways.

## Project Overview

NeuralFlux is built on Step-Video-TI2V technology and is a decentralized AI video generation ecosystem designed to revolutionize how creators generate, distribute, and capture value from AI video content.

### Core Features

- **AI Video Generation**: Create high-quality videos from text descriptions and reference images using Step-Video-TI2V technology
- **NFT Video Marketplace**: Mint, buy, sell, and collect unique AI-generated video NFTs
- **Web3 Integration**: Enable decentralized value exchange through the $FLUX token system
- **Creator DAO**: Participate in project governance and decision-making, earn rewards through staking

## Technology Stack

- Frontend: React, Next.js, TypeScript, TailwindCSS
- Web3: Solana, @solana/web3.js, @solana/wallet-adapter
- AI: Based on Step-Video-TI2V model

## Quick Start

### Requirements

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/neuralflux.git
cd neuralflux

# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to view the application.

## MVP Features

The current MVP version implements the following core features:

1. **Video Generation Interface**: Generate AI videos from text and images
2. **Basic Wallet Integration**: Solana wallet connection functionality
3. **NFT Minting**: Mint generated videos as NFTs
4. **Simple Marketplace**: Browse and filter video NFTs
5. **DAO Interface**: Stake tokens and participate in governance proposals

## Roadmap

See the `ROADMAP.md` file for the complete development plan.

## Contributing

Contributions of code, issue reports, or new feature suggestions are welcome! Please refer to `CONTRIBUTING.md` for more information.

## License

MIT

## Recent Updates

### DAO Page Wallet Connection Fix
- Fixed the DAO page to properly connect with Phantom wallet
- Integrated Solana Wallet Adapter for seamless wallet connectivity
- Removed unnecessary balance display and staking functionality
- Improved user interface for better wallet interaction

## Features
- AI video generation based on text prompts
- NFT minting of AI-generated videos
- Marketplace for trading video NFTs
- DAO governance for platform decisions
- FLUX token for platform utility and governance

## Technology Stack
- Next.js for frontend
- Tailwind CSS for styling
- Solana blockchain integration
- Phantom wallet connectivity
- AI model integration

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3003](http://localhost:3003) in your browser to see the application.

## Project Structure
- `/src/pages` - Main application pages
- `/src/components` - Reusable UI components
- `/src/web3` - Blockchain integration 
- `/src/api` - API routes and services
- `/public` - Static assets 