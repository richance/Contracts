// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Tap {
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

    function tap() public {
        require(blocklock <= now, "block");
        Token.transfer(bucket, Token.balanceOf(address(this)) / 40);
        blocklock = now + 7 days;
    }
}
