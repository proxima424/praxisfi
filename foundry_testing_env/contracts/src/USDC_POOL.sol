// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ERC20} from "openzeppelin-contracts/token/ERC20/ERC20.sol";
import {IERC20} from "../src/IERC20.sol";
import {AggregatorV3Interface} from "./AggregatorV3Interface.sol";

contract USDC_POOL {
    AggregatorV3Interface internal WETH_PriceFeed;

    constructor(address _WETHCHAINLINK) {
        WETH_PriceFeed = AggregatorV3Interface(_WETHCHAINLINK);
    }

    function getLatestPrice() public view returns (int256) {
        (
            ,
            /*uint80 roundID*/
            int256 price, /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/
            ,
            ,
        ) = WETH_PriceFeed.latestRoundData();
        return price;
    }

    function requestWETH(uint256 amount) public {
        uint256 priceofweth = uint256(getLatestPrice());
        priceofweth = priceofweth / (10 ** 8);
        uint256 answer = amount / priceofweth;
        IERC20(0x2e3A2fb8473316A02b8A297B982498E661E1f6f5).transfer(
            msg.sender, answer
        );
    }
}
