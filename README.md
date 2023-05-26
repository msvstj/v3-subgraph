# Uniswap V3 Subgraph + Staking Data
Uniswap V3 main subgraph with extended Position and Incentive entities. Forked from [Uniswap](https://github.com/Uniswap/v3-subgraph) and referenced from [vbstreetz](https://github.com/vbstreetz/uniswap-v3-staker-subgraph).

### Usage
Data from this subgraph is used in [V3 Universal Staker UI](https://v3-staker.msvstj.com/):
[![UniversalStaker](https://ipfs.msvstj.com/ipfs/QmdVRFp7zDS4q6akSyqoWM6ruYJB6iPLzHkwG9FssonESG)](https://v3-staker.msvstj.com/)

Staker UI usage guide: Medium - [Universal V3 Staker UI or How to Stake in Uniswap V3 Part III](https://medium.com/@msvstj/universal-v3-staker-ui-or-how-to-stake-in-uniswap-v3-part-iii-9debe241ec11)

### Subgraph Updates:
![img](https://ipfs.msvstj.com/ipfs/Qmb7LSFP1WZTbXNXJq9BxJ73xjVBVUpruz8V6oV2wfToxB)

### Issues and Notes
- Circular references between Positions and Incentives (many-to-many relationship). Checking on the alternatives.
- Subgraph will be updated;
- More networks pending.

### Subgraph Endpoint 
Extended Subgraph:
- Goerli : https://api.thegraph.com/subgraphs/name/msvstj/uni-v3-extended-staking-goerli

However, it takes a lot of time to populate the data, therefore I  created a new branch: [staking-only](https://github.com/msvstj/v3-subgraph/tree/staking-only) (fills only staking relevant data).
#### Staking-Only Endpoints:
- Ethereum: https://thegraph.com/hosted-service/subgraph/msvstj/uni-v3-extended-staking-eth
- Polygon: https://thegraph.com/hosted-service/subgraph/msvstj/uni-v3-staking-polygon
- Mumbai: https://thegraph.com/hosted-service/subgraph/msvstj/uni-v3-staking-mumbai


# References:
- **Uniswap** (https://github.com/Uniswap/v3-subgraph) (GPL-3.0) - Main Uniswap V3 subgraph (used position, pool, token entities).
- **vbstreetz** (https://github.com/vbstreetz/uniswap-v3-staker-subgraph) (MIT) - Incentive entity encoding and event handling.

# Note: 
Note: Uniswap is a trademark of Uniswap Labs. This project is not affiliated with or endorsed by Uniswap Labs, however, it interacts with Uniswap deployed staker contracts.