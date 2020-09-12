// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import {
    IUniswapV2Pair
} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UTap {
    IERC20 public Token;
    IUniswapV2Pair public Pool;
    uint256 public blocklock;
    address public bucket;

    constructor(
        IERC20 Tokent,
        address buckt,
        IUniswapV2Pair Poolt
    ) public {
        Token = Tokent;
        bucket = buckt;
        Pool = Poolt;
    }

    function tap() public {
        require(blocklock <= now, "block");
        Token.transfer(bucket, Token.balanceOf(address(this)) / 50);
        blocklock = now + 1 days;
        Pool.sync();
    }
}
