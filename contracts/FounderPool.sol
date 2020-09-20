// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;


import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract FounderPool {
    IERC20 public Token;
    uint256 public blocklock;
    address public bucket;

    constructor(
        IERC20 Tokent,
        address buckt
    ) public {
        Token = Tokent;
        bucket = buckt;
    }
    uint256 public bal;
    function tap() public {
        require(blocklock <= now, "block");
          if (bal <= Token.balanceOf(address(this))) {
          bal = Token.balanceOf(address(this));
          }
        Token.transfer(bucket, Token.balanceOf(address(this)) / 24);
        blocklock = now + 14 days;
    }
}
