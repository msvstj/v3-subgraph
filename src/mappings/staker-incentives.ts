/* eslint-disable prefer-const */
import { ethereum, crypto, log } from '@graphprotocol/graph-ts';
import { Incentive, Pool, Position, Token } from '../types/schema';
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
  fetchTokenSymbol} from '../utils/token';

export function handleIncentiveCreated(event: IncentiveCreated): void {
  let pool = Pool.load(event.params.pool.toHexString())

  // // issue with some incentives that were created using V2 pairs instead of V3 pools
  // // e.g. in block 8389567 (goerli)
  // // incentive: 0x89114380d9fc6ac1c501e0b4fe3cf1613f0feb9aec7fd3092d20866f46a78adb
  // // in case pool does not exist in V3 subgraph - return without saving new entity.
  if(pool == null){
    return;
  }

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
  
  // in case there is no pool with reward token - create new token object
  // factory.ts logic
   if(rewardToken === null){
    rewardToken = new Token(event.params.rewardToken.toHexString())
    rewardToken.symbol = fetchTokenSymbol(event.params.rewardToken)
    rewardToken.name = fetchTokenName(event.params.rewardToken)
    let decimals = fetchTokenDecimals(event.params.rewardToken)

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('mybug the decimal on reward token was null', [])
      return
    }
    rewardToken.decimals = decimals
    rewardToken.save()
  }

  let incentive = new Incentive(incentiveId.toHex());
  incentive.rewardToken = rewardToken.id
  incentive.createdAtTimestamp = event.block.timestamp
  incentive.createdAtBlockNumber = event.block.number
  incentive.pool = pool.id
  incentive.startTime = event.params.startTime
  incentive.endTime = event.params.endTime
  incentive.refundee = event.params.refundee
  incentive.reward = event.params.reward
  incentive.ended = false
  incentive.positions = []
  incentive.save()
  
}

export function handleIncentiveEnded(event: IncentiveEnded): void {
  let incentive = Incentive.load(event.params.incentiveId.toHex())
  if (incentive) {
    incentive.ended = true
    incentive.save()
  }
}

// adding incentives to the array.
// current issue : circular reference
export function handleTokenStaked(event: TokenStaked): void {
  let position = Position.load(event.params.tokenId.toString())
  let incentive = Incentive.load(event.params.incentiveId.toHex())

  if (position !== null && incentive !== null) {
    let stakedIncentivesArray = position.incentives
    let stakedPositionsArray = incentive.positions

    stakedIncentivesArray.push(incentive.id)
    stakedPositionsArray.push(position.id)

    position.incentives = stakedIncentivesArray
    incentive.positions = stakedPositionsArray

    position.save()
    incentive.save()
  }
}
// removing incentive from the array.
// current issue : circular reference.
export function handleTokenUnstaked(event: TokenUnstaked): void {
  let position = Position.load(event.params.tokenId.toString());
  let incentive = Incentive.load(event.params.incentiveId.toHex());

  if (position !== null && incentive !== null) {
    let stakedIncentivesArray = position.incentives;
    let stakedPositionsArray = incentive.positions;

    let incentiveIdx = stakedIncentivesArray.indexOf(incentive.id);
    let positionIdx = stakedPositionsArray.indexOf(position.id);

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

// new token owner is handled in other position event handlers.
export function handleDepositTransferred(event: DepositTransferred): void {
  let position = Position.load(event.params.tokenId.toString());

  // new depositor address in case of:
  // withdrawal: address(0) (or newOwner)
  // erc721 transfer : msg.sender (or newOwner)
  // deposit transfer: msg.sender (or newOwner)
  if (position) {
    position.depositor = event.params.newOwner
    position.save()
  }
}