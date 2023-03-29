/* eslint-disable prefer-const */
import { ethereum, crypto, log } from '@graphprotocol/graph-ts';
import { Incentive, Position, Token } from '../types/schema';
import { ZERO_BD, ZERO_BI } from '../utils/constants'
import {
  DepositTransferred,
  IncentiveCreated,
  IncentiveEnded,
  TokenStaked,
  TokenUnstaked,
} from '../types/UniswapV3Staker/Staker';
import { 
  fetchTokenDecimals, 
  fetchTokenName, 
  fetchTokenSymbol, 
  fetchTokenTotalSupply 
} from '../utils/token';;

export function handleIncentiveCreated(event: IncentiveCreated): void {

  let incentiveIdTuple: Array<ethereum.Value> = [
    ethereum.Value.fromAddress(event.params.rewardToken),
    ethereum.Value.fromAddress(event.params.pool),
    ethereum.Value.fromUnsignedBigInt(event.params.startTime),
    ethereum.Value.fromUnsignedBigInt(event.params.endTime),
    ethereum.Value.fromAddress(event.params.refundee),
  ]
  let incentiveIdEncoded = ethereum.encode(
    ethereum.Value.fromTuple(changetype<ethereum.Tuple>(incentiveIdTuple))
  )!;

  let incentiveId = crypto.keccak256(incentiveIdEncoded);

  
  let rewardToken = Token.load(event.params.rewardToken.toHexString());
  let incentive = Incentive.load(incentiveId.toHex());
  
  // in case there is no pool with reward token - create new token object
  // factory.ts logic
   if(rewardToken === null){
    rewardToken = new Token(event.params.rewardToken.toHexString())
    rewardToken.symbol = fetchTokenSymbol(event.params.rewardToken)
    rewardToken.name = fetchTokenName(event.params.rewardToken)
    rewardToken.totalSupply = fetchTokenTotalSupply(event.params.rewardToken)
    let decimals = fetchTokenDecimals(event.params.rewardToken)

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('mybug the decimal on reward token was null', [])
      return
    }
    rewardToken.decimals = decimals
    rewardToken.derivedETH = ZERO_BD
    rewardToken.volume = ZERO_BD
    rewardToken.volumeUSD = ZERO_BD
    rewardToken.feesUSD = ZERO_BD
    rewardToken.untrackedVolumeUSD = ZERO_BD
    rewardToken.totalValueLocked = ZERO_BD
    rewardToken.totalValueLockedUSD = ZERO_BD
    rewardToken.totalValueLockedUSDUntracked = ZERO_BD
    rewardToken.txCount = ZERO_BI
    rewardToken.poolCount = ZERO_BI
    rewardToken.whitelistPools = []
    rewardToken.save()
  }

  if (incentive === null) {
    incentive = new Incentive(incentiveId.toHex())
    incentive.rewardToken = rewardToken.id
    incentive.createdAtTimestamp = event.block.timestamp
    incentive.createdAtBlockNumber = event.block.number
    incentive.pool = event.params.pool.toHexString()
    incentive.startTime = event.params.startTime
    incentive.endTime = event.params.endTime
    incentive.refundee = event.params.refundee
    incentive.reward = event.params.reward
    incentive.ended = false
    incentive.positions = []
    incentive.save()
  }
}

export function handleIncentiveEnded(event: IncentiveEnded): void {
  let incentive = Incentive.load(event.params.incentiveId.toHex());
  if (incentive) {
    incentive.ended = true;
    incentive.save();
  }
}

// adding incentives to the array.
// current issue : circular reference.
export function handleTokenStaked(event: TokenStaked): void {
  let tokenId = event.params.tokenId.toHex();
  let incentiveId = event.params.incentiveId.toHex();

  let position = Position.load(tokenId);
  let incentive = Incentive.load(incentiveId);

  if (position !== null && incentive !== null) {
    let stakedIncentivesArray = position.incentives;
    let stakedPositionsArray = incentive.positions;

    stakedIncentivesArray.push(incentiveId);
    stakedPositionsArray.push(tokenId);

    position.incentives = stakedIncentivesArray
    incentive.positions = stakedPositionsArray

    position.save()
    incentive.save()
  }
}
// removing incentive from the array.
// current issue : circular reference.
export function handleTokenUnstaked(event: TokenUnstaked): void {
  let tokenId = event.params.tokenId.toHex();
  let incentiveId = event.params.incentiveId.toHex();

  let position = Position.load(tokenId);
  let incentive = Incentive.load(incentiveId);

  if (position !== null && incentive !== null) {
    let stakedIncentivesArray = position.incentives;
    let stakedPositionsArray = incentive.positions;

    let incentiveIdx = stakedIncentivesArray.indexOf(incentiveId);
    let positionIdx = stakedPositionsArray.indexOf(tokenId);

    if(incentiveIdx !== -1 && positionIdx !== -1){
      stakedIncentivesArray.splice(incentiveIdx, 1)
      stakedPositionsArray.splice(positionIdx, 1)

      position.incentives = stakedIncentivesArray
      incentive.positions = stakedPositionsArray

      position.save()
      incentive.save()
    }
  }
}
// Token owner is handled in other position event handlers.
export function handleDepositTransferred(event: DepositTransferred): void {
  let position = Position.load(event.params.tokenId.toHex());
  // New depositor address in case of:
  // withdraw: address(0) (or newOwner)
  // erc721 handler : msg.sender (or newOwner)
  // deposit transfer: msg.sender (or newOwner)
  if (position !== null) {
    position.depositor = event.params.newOwner
    position.save()
  }
}