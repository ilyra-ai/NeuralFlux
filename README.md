# NeuralFlux - AI Video Platform

NeuralFlux is a web application that allows users to find and use AI-generated videos based on text descriptions and style preferences. It provides a simple and intuitive interface for discovering videos that match specific prompts.

## Features

- **Generate AI Videos**: Generate Videos that match your text descriptions and preferred styles
- **Phantom Wallet Integration**: Connect to Solana blockchain using Phantom wallet
- **Responsive Design**: Works on desktop and mobile devices
- **Video Preview**: Preview videos before minting as NFTs
- **Marketplace**: Coming Soon - Browse and trade NFTs in the marketplace

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- NPM or Yarn
- [Phantom Wallet](https://phantom.app/) browser extension (for blockchain features)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/neuralflux.git
   cd neuralflux
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.mainnet-beta.solana.com
   NEXT_PUBLIC_ENDPOINT=https://api.neuralflux.io
   ```

### Running the Development Server

```
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `src/pages`: Next.js pages that define the routes of the application
- `src/components`: Reusable React components
- `src/web3`: Wallet integration and blockchain related code
- `src/api`: API integration for video services
- `public`: Static assets

## Usage

1. **Connect Wallet**: Click the "Connect Wallet" button to connect your Phantom wallet
2. **Search Video**: Enter a detailed description and select a style
3. **Preview**: View the video that matches your criteria
4. **Mint NFT** (Coming Soon): Mint the video as an NFT on the Solana blockchain

## Wallet Integration Features

- Connect to Phantom wallet
- Display wallet address
- Select or change wallet
- Disconnect wallet
- Check if Phantom is installed

## License

This project is licensed under the MIT License - see the LICENSE file for details.
