import { ethereum, crypto } from '@graphprotocol/graph-ts';
import {
  DepositTransferred,
  IncentiveCreated,
  IncentiveEnded,
  RewardClaimed,
  TokenStaked,
  TokenUnstaked,
} from '../types/UniswapV3Staker/Staker';
import { Incentive, Position } from '../types/schema';

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

  let incentive = Incentive.load(incentiveId.toHex());

  if (incentive == null) {
    incentive = new Incentive(incentiveId.toHex());
  }

  incentive.rewardToken = event.params.rewardToken.toHexString();
  incentive.pool = event.params.pool.toHexString();
  incentive.startTime = event.params.startTime;
  incentive.endTime = event.params.endTime;
  incentive.refundee = event.params.refundee;
  incentive.reward = event.params.reward;
  incentive.ended = false;
  incentive.positions = [];
  incentive.save();
}

export function handleIncentiveEnded(event: IncentiveEnded): void {
  let incentive = Incentive.load(event.params.incentiveId.toHex());
  if (incentive) {
    incentive.ended = true;
    incentive.save();
  }
}

export function handleRewardClaimed(event: RewardClaimed): void {}

//Adding incentives to the array.
export function handleTokenStaked(event: TokenStaked): void {
  let tokenId = event.params.tokenId.toHex();
  let incentiveId = event.params.incentiveId.toHex();

  let position = Position.load(tokenId);
  let incentive = Incentive.load(incentiveId);

  if (position !== null && incentive !== null) {
    position.incentives.push(event.params.incentiveId.toHex());
    incentive.positions.push(event.params.tokenId.toHex());
    position.save();
    incentive.save();
  }

}
//Removing incentive from the array.
export function handleTokenUnstaked(event: TokenUnstaked): void {
  let tokenId = event.params.tokenId.toHex();
  let incentiveId = event.params.incentiveId.toHex();

  let position = Position.load(tokenId);
  let incentive = Incentive.load(incentiveId);

  if (position !== null && incentive !== null) {
    let incentiveIdx = position.incentives.indexOf(incentiveId);
    let positionIdx = incentive.positions.indexOf(tokenId);

    if(incentiveIdx !== -1 && positionIdx !== -1){
      position.incentives.splice(incentiveIdx, 1);
      incentive.positions.splice(positionIdx, 1);
      position.save();
      incentive.save();
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
    position.depositor = event.params.newOwner;
    position.save();
  }
}

