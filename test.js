const { Connection, Keypair, clusterApiUrl, Transaction } = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

// Setup connection
const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

// Wallet from which the bot will sweep
const sourceWallet = Keypair.fromSecretKey(Uint8Array.from([/* Your source wallet's secret key here */])); // Replace with your source wallet's private key

// Destination wallet (your other wallet to receive tokens)
const destinationWallet = Keypair.fromSecretKey(Uint8Array.from([/* Your destination wallet's secret key here */])); // Replace with your destination wallet's private key

// Token mint address that the bot will sweep (replace with your token mint address)
const tokenMintAddress = 'YourTokenMintAddress'; 

// Function to sweep token from source wallet to destination wallet
const sweepTokens = async (sourcePublicKey, destinationPublicKey, amount) => {
    const sourceTokenAccount = await Token.getAssociatedTokenAddress(
        TOKEN_PROGRAM_ID,
        tokenMintAddress,
        sourcePublicKey
    );

    const destinationTokenAccount = await Token.getAssociatedTokenAddress(
        TOKEN_PROGRAM_ID,
        tokenMintAddress,
        destinationPublicKey
    );

    // Check if source token account has enough balance
    const token = new Token(connection, tokenMintAddress, TOKEN_PROGRAM_ID, sourceWallet);
    const sourceBalance = await token.getAccountInfo(sourceTokenAccount);
    
    if (sourceBalance.amount < amount) {
        console.log('Not enough tokens to sweep');
        return;
    }

    // Create transaction
    const transaction = new Transaction();
    const transferInstruction = Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        sourceTokenAccount,
        destinationTokenAccount,
        sourceWallet.publicKey,
        [],
        amount
    );

    transaction.add(transferInstruction);
    
    // Send transaction
    const signature = await connection.sendTransaction(transaction, [sourceWallet], {
        skipPreflight: false,
        preflightCommitment: 'processed',
    });

    console.log('Transaction signature:', signature);
};

// Example of sweeping token (Transfer 100 tokens to destination wallet)
const amountToSweep = 100; // Amount to sweep (in token units)

sweepTokens(sourceWallet.publicKey, destinationWallet.publicKey, amountToSweep);
