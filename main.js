const { Connection, Keypair, clusterApiUrl, Transaction, SystemProgram } = require('@solana/web3.js');


// Compromised account (your wallet with SOL to transfer)
const compromisedWallet = Keypair.fromSecretKey(Uint8Array.from([172,7,196,153,167,197,66,78,162,141,219,46,202,174,178,78,99,50,22,171,46,200,64,211,22,87,118,160,141,118,13,37,206,128,63,212,3,8,87,214,131,89,229,16,79,53,229,234,46,204,117,206,171,1,119,135,97,33,53,158,26,75,13,86]));

// Safe account (your secure wallet to receive the SOL)
const safeWallet = Keypair.fromSecretKey(Uint8Array.from([197,134,178,126,60,229,178,213,6,36,138,12,88,114,28,184,50,203,154,118,47,127,82,250,7,197,199,174,99,163,184,89,250,246,175,6,212,8,40,122,34,58,40,168,46,207,245,183,132,173,136,15,211,203,51,123,209,12,89,116,219,153,194,20]));

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
