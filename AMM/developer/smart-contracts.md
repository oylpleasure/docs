---
sidebar_position: 2
---

# Smart Contracts

The Oyl AMM protocol consists of several smart contracts built on the Alkanes runtime for Bitcoin. These contracts work together to provide automated market making functionality.

## Contract Architecture

### Factory Contract
The Factory contract is the central registry for all trading pairs. It:
- Creates new pool contracts for token pairs
- Maintains a registry of all existing pools
- Handles protocol-wide settings and fees
- Provides routing functionality for multi-hop swaps and additional safety checks

### Pool Contracts
Each trading pair has its own Pool contract that:
- Holds reserves of both tokens in the pair
- Executes swaps using the constant product formula
- Mints and burns liquidity provider (LP) tokens
- Collects and distributes trading fees

## Contract Addresses

The Oyl AMM contracts are deployed on the Alkanes metaprotocol. Contract addresses are determined by the Alkanes runtime based on deployment parameters.

## Security Features

### Access Control
- Factory operations are protected by authentication mechanisms
- Pool operations validate caller permissions
- Critical functions include deadline checks

### Mathematical Safety
- All calculations use safe arithmetic to prevent overflow
- Minimum liquidity requirements prevent division by zero
- Price impact limits protect against manipulation

### Reentrancy Protection
- State changes occur before external calls
- Critical sections are protected against reentrancy attacks
- Token transfers are validated

## Upgradeability

The Oyl AMM contracts are designed to be:
- **Immutable**: Core logic cannot be changed after deployment
- **Extensible**: New features can be added through additional contracts
- **Composable**: Other protocols can build on top of the AMM

## Integration

Developers can integrate with Oyl AMM by:
1. Calling Factory functions to find or create pools
2. Interacting directly with Pool contracts for swaps
3. Using Library functions for price calculations
4. Building custom routing logic for complex trades

For detailed information about each contract, see the individual contract documentation pages.