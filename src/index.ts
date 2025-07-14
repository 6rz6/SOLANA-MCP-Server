#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const RPC_URL = process.env.SOLANA_RPC_URL || clusterApiUrl('mainnet-beta');

// Create Solana connection
const connection = new Connection(RPC_URL, 'confirmed');

// Create MCP server
const server = new McpServer({
  name: "solana-mcp",
  version: "1.0.0"
});

// Get account balance
server.tool(
  "get_balance",
  {
    address: z.string().describe("Solana wallet address"),
  },
  async ({ address }) => {
    try {
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      const balanceInSOL = balance / LAMPORTS_PER_SOL;
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              address,
              balance: balanceInSOL,
              balanceLamports: balance,
              rpcEndpoint: RPC_URL
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting balance: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);

// Get account info
server.tool(
  "get_account_info",
  {
    address: z.string().describe("Solana account address"),
  },
  async ({ address }) => {
    try {
      const publicKey = new PublicKey(address);
      const accountInfo = await connection.getAccountInfo(publicKey);
      
      if (!accountInfo) {
        return {
          content: [
            {
              type: "text",
              text: `Account ${address} not found`
            }
          ],
          isError: true
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              address,
              lamports: accountInfo.lamports,
              owner: accountInfo.owner.toString(),
              executable: accountInfo.executable,
              rentEpoch: accountInfo.rentEpoch,
              dataLength: accountInfo.data.length
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting account info: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);

// Get token accounts
server.tool(
  "get_token_accounts",
  {
    address: z.string().describe("Solana wallet address"),
  },
  async ({ address }) => {
    try {
      const publicKey = new PublicKey(address);
      const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID
      });

      const accounts = tokenAccounts.value.map(({ pubkey, account }) => ({
        account: pubkey.toString(),
        mint: account.data.slice(0, 32).toString('hex'),
        balance: account.data.readBigUInt64LE(64).toString()
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              address,
              tokenAccounts: accounts,
              count: accounts.length
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting token accounts: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);

// Get transaction history
server.tool(
  "get_transaction_history",
  {
    address: z.string().describe("Solana wallet address"),
    limit: z.number().min(1).max(100).optional().default(10).describe("Number of transactions to fetch")
  },
  async ({ address, limit }) => {
    try {
      const publicKey = new PublicKey(address);
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
      
      const transactions = signatures.map(sig => ({
        signature: sig.signature,
        slot: sig.slot,
        blockTime: sig.blockTime,
        err: sig.err,
        memo: sig.memo
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              address,
              transactions,
              count: transactions.length
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting transaction history: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);

// Get token info
server.tool(
  "get_token_info",
  {
    mintAddress: z.string().describe("Token mint address"),
  },
  async ({ mintAddress }) => {
    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const mintInfo = await connection.getParsedAccountInfo(mintPublicKey);
      
      if (!mintInfo.value) {
        return {
          content: [
            {
              type: "text",
              text: `Token ${mintAddress} not found`
            }
          ],
          isError: true
        };
      }

      const parsedData = mintInfo.value.data;
      if (typeof parsedData === 'string' || !('parsed' in parsedData)) {
        return {
          content: [
            {
              type: "text",
              text: `Invalid token account: ${mintAddress}`
            }
          ],
          isError: true
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              mintAddress,
              info: parsedData.parsed.info
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting token info: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);

// Get network stats
server.tool(
  "get_network_stats",
  {},
  async () => {
    try {
      const slot = await connection.getSlot();
      const blockTime = await connection.getBlockTime(slot);
      const epochInfo = await connection.getEpochInfo();
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              currentSlot: slot,
              blockTime,
              epoch: epochInfo.epoch,
              epochProgress: `${((epochInfo.slotIndex / epochInfo.slotsInEpoch) * 100).toFixed(2)}%`,
              network: RPC_URL.includes('mainnet') ? 'mainnet-beta' : 
                       RPC_URL.includes('devnet') ? 'devnet' : 'testnet'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting network stats: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Solana MCP server running on stdio');