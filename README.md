# Solana MCP Server

A Model Context Protocol (MCP) server for interacting with the Solana blockchain. This server provides tools to query account balances, transaction history, token information, and network statistics.

## Features

- **Account Operations**: Get balance and account information
- **Token Management**: Query token accounts and token metadata
- **Transaction History**: Fetch transaction history for any address
- **Network Statistics**: Get current network status and epoch info
- **Multi-Network Support**: Mainnet, Devnet, and Testnet

## Installation

```bash
git clone https://github.com/6rz6/solana-mcp.git
cd solana-mcp
npm install
npm run build
```

## Usage

### MCP Configuration

Add to your MCP settings:

```json
{
  "mcpServers": {
    "solana": {
      "command": "node",
      "args": ["/path/to/solana-mcp/build/index.js"],
      "env": {
        "SOLANA_RPC_URL": "https://api.mainnet-beta.solana.com"
      }
    }
  }
}
```

### Available Tools

1. **get_balance** - Get SOL balance for an address
2. **get_account_info** - Get detailed account information
3. **get_token_accounts** - Get all token accounts for a wallet
4. **get_transaction_history** - Get transaction history
5. **get_token_info** - Get token metadata
6. **get_network_stats** - Get network statistics

### Examples

```bash
# Get balance
get_balance("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU")

# Get token accounts
get_token_accounts("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU")

# Get network stats
get_network_stats()
```

## Environment Variables

- `SOLANA_RPC_URL`: Custom RPC endpoint (defaults to mainnet-beta)

## Development

```bash
npm run dev  # Watch mode
npm run build  # Build TypeScript
```

## License

MIT