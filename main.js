const { Connection, Keypair, clusterApiUrl, Transaction, SystemProgram } = require('@solana/web3.js');


// Compromised account (your wallet with SOL to transfer)
const compromisedWallet = Keypair.fromSecretKey(Uint8Array.from(/* Paste compromised Key here */));

// Safe account (your secure wallet to receive the SOL)
const safeWallet = Keypair.fromSecretKey(Uint8Array.from(/* Paste safe Key here */));

// Setup connection
const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
// const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Function to sweep SOL from the compromised wallet to your safe account
const sweepSOL = async (sourcePublicKey, destinationPublicKey) => {


    // Create the transaction to send SOL from source wallet to safe wallet

    // Get the current balance of the source wallet (compromised wallet)
    const balance = await connection.getBalance(sourcePublicKey);
    console.log(`Source wallet balance: ${balance / 1e9} SOL`);
    
    const amount = balance - (0.000005 * 1e9) //convert to lamports;
    // Check if source wallet has enough SOL to sweep
    if (balance < amount) {  // (1 SOL = 1e9 lamports)
        console.log('Not enough SOL in the compromised wallet to sweep.');
        return;
    }

    // Create the transaction to send SOL from source wallet to safe wallet
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: sourcePublicKey,
            toPubkey: destinationPublicKey,
            lamports: amount,  // Convert SOL to lamports (1 SOL = 1e9 lamports)
        })
    );
    

    //Sign the transaction using the compromised wallet
    const signature = await connection.sendTransaction(transaction, [compromisedWallet], {
        skipPreflight: false,
        preflightCommitment: 'processed',
    });

    console.log('Transaction sent, signature:', signature);
    await connection.confirmTransaction(signature, 'processed');
    console.log('Transaction confirmed.');
};

sweepSOL(compromisedWallet.publicKey, safeWallet.publicKey);
