# Uniswap V3 Subgraph + Staking Data
Uniswap V3 main subgraph with extended Position and Incentive entities. Forked from [Uniswap](https://github.com/Uniswap/v3-subgraph) and referenced from [vbstreetz](https://github.com/vbstreetz/uniswap-v3-staker-subgraph).
Updates:
<br>
![img](https://ipfs.msvstj.com/ipfs/Qmb7LSFP1WZTbXNXJq9BxJ73xjVBVUpruz8V6oV2wfToxB)

### Issues and Notes
- Circular references between Positions and Incentives (many-to-many relationship). Issue will be resolved;
- Subgraph will be updated;
- More networks pending.

### Subgraph Endpoint 
- Goerli : https://api.thegraph.com/subgraphs/name/msvstj/uni-v3-extended-staking-goerli
- TBA

# References:
- **Uniswap** (https://github.com/Uniswap/v3-subgraph) (GPL-3.0) - Main Uniswap V3 subgraph (used position, pool, token entities).
- **vbstreetz** (https://github.com/vbstreetz/uniswap-v3-staker-subgraph) (MIT) - Incentive entity encoding and event handling.