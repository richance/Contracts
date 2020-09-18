// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Donation {
    IERC20 public Token;
    uint256 public start;
    uint256 public finish;
    address payable public ad1;
    address payable public ad2;
    address payable public ad3;
    address payable public ad4;
    uint256 public price;

    constructor(
        IERC20 Tokent,
        address payable a1,
        address payable a2,
        address payable a3,
        address payable a4
    ) public {
        Token = Tokent;
        start = now;
        finish = now + 1 days;
        ad1 = a1;
        ad2 = a2;
        ad3 = a3;
        ad4 = a4;
    }

    receive() external payable {
        Token.transfer(
            msg.sender,
            (msg.value * 10 * (finish - start)) /
                ((finish - start) - (now - start))
        );
    }

    uint256 public bal;

    function donate() public {
        bal = address(this).balance;
        ad1.transfer(bal / 4);
        ad2.transfer(bal / 4);
        ad3.transfer(bal / 4);
        ad4.transfer(bal / 4);
    }
}
