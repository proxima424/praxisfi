// TESTNET

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/// @title praxisFACTORY
/// @author @proxima424 <https://github.com/proxima424>
/// @notice Main ser-facing entrypoint contract the interface calls for every feature
/// @notice I believe on using more cross-contract calls, extensive helper functions for better readability

import {praxisADDRESSES} from "./praxisADDRESSES.sol";
import {FlashLoanSimpleReceiverBase} from
    "../src/praxisFLASHLOAN/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from
    "../src/praxisFLASHLOAN/IPoolAddressesProvider.sol";
import {IERC20} from "../src/IERC20.sol";
import {Ownable} from "../src/Ownable.sol";
import {IPool} from "../src/praxisFLASHLOAN/IPool.sol";
import {TransferHelper} from "../src/praxisUNISWAP/TransferHelper.sol";
import {ISwapRouter} from "../src/praxisUNISWAP/ISwapRouter.sol";
import {AggregatorV3Interface} from "./AggregatorV3Interface.sol";
import {praxisERC20} from "../src/praxisERC20.sol";

error Depositing_WETH_Failed();
error MINTING_ETHUP_FAILED(address USER, uint256 tokenAmount);

contract praxisFACTORY is FlashLoanSimpleReceiverBase, Ownable {
    using praxisADDRESSES for address;

    AggregatorV3Interface internal WETH_PriceFeed;


    address public ERC20_TO_DEPOSIT_POLYGON; //0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619; // WETH
    address public ERC20_TO_BORROW_POLYGON; // 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;  // USDC
    address public AAVE_POOL_POLYGON; // 0x794a61358D6845594F94dc1DB02A252b5b4814aD;

    ISwapRouter public immutable swapRouter;
    address public PRAXIS_ERC20;

    /*    C-O-N-S-T-R-U-C-T-O-R         */
    /// @notice Initializes AAVE Pool address provider and Uniswap Router
    constructor(
        address _addressProvider,
        ISwapRouter _swapRouter,
        address _WETHChainlink,
        address _ERC20WETH,
        address _ERC20USDC,
        address _AAVE_POOL_POLYGON
    )
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider))
    {
        // UNISWAP swapRouter
        swapRouter = _swapRouter;
        WETH_PriceFeed = AggregatorV3Interface(_WETHChainlink);
        ERC20_TO_DEPOSIT_POLYGON = _ERC20WETH;
        ERC20_TO_BORROW_POLYGON = _ERC20USDC;
        AAVE_POOL_POLYGON = _AAVE_POOL_POLYGON;
    }

    /*               S-T-E-P-S      F-O-R       E-T-H-3-X                  */

    /*               User deposits X WETH                                  */
    /*               Call AAVE Flashloan of 2X WETH                        */

    /*               Deposit this 3X WETH into AAVE WETH Pool              */
    /*               Borrow 2X*(Price of ETH) from USDC Pool               */
    /*               Swap 2X*(Price of ETH)*100/98 to 2X WETH using UNI    */
    /*               Return this 2X WETH back to flashloan                 */
    /*               Mint X WETH tokens                                    */
    /*                       STORAGE VARIABLES                             */

    /// @notice Contains all information pertaining to a position
    struct Position {
        address owner; //160 bits
        uint256 amountInEth; //96 bits
        uint256 mintedTime; //128bits
        uint256 ethPrice; // 128bits
        uint256 mintedTokens; // 256bits
        bool ifClosed; //8bits
        uint256 positionValue;
    }



    /// @notice ETH3XUP positions of an address
    mapping(address => Position[]) public user_to_ETH3XUP_positions;

    // /// @notice ETH3XDOWN positions of an address
    // mapping(address => Position[]) user_to_ETH3XDOWN_positions;

    // ///@notice Contains WETH/USDC supplied/borrowed in unleveraged denomination
    // uint256 ETH3XUP_CONTRACT_WETH_SUPPLIED;
    // uint256 ETH3XUP_CONTRACT_USDC_BORROWED;
    // uint256 ETH3XDOWN_CONTRACT_WETH;
    // uint256 ETH3XDOWN_CONTRACT_USDC;

    /*                    STATELESS VIEW FUNCTIONS                              */

    /// @notice Access the ETH3XUP Position array of an address
    function get_ETH3XUP_Positions(address user)
        public
        view
        returns (Position[] memory array_positions)
    {
        return user_to_ETH3XUP_positions[user];
    }

    ///@notice Get contract's holding of WETH
    function get_WETH_contract_balance() public returns (uint256 balance) {
        return IERC20(ERC20_TO_DEPOSIT_POLYGON).balanceOf(address(this));
    }

    ///@notice Get contract's holding of USDC
    function get_USDC_contract_balance() public returns (uint256 balance) {
        return IERC20(ERC20_TO_BORROW_POLYGON).balanceOf(address(this));
    }

    /*                A-A-V-E F-L-A-S-H-L-O-A-N F-U-N-C-T-I-O-N-S            */

    function requestFlashLoan(address _token, uint256 _amount) internal {
        address receiverAddress = address(this);
        address asset = _token;
        uint256 amount = _amount;
        bytes memory params = "";
        uint16 referralCode = 0;

        IPool(AAVE_POOL_POLYGON).flashLoanSimple(
            receiverAddress, asset, amount, params, referralCode
        );
    }

    // function executeOperation(
    //     address asset,
    //     uint256 amount,
    //     uint256 premium,
    //     address initiator,
    //     bytes calldata params
    // )
    //     external
    //     override
    //     returns (bool)
    // {
    //     //
    //     // This contract now has the funds requested.
    //     // Your logic goes here.
    //     //

    //     // At the end of your logic above, this contract owes
    //     // the flashloaned amount + premiums.
    //     // Therefore ensure your contract has enough to repay
    //     // these amounts.

    //     // Approve the Pool contract allowance to *pull* the owed amount
    //     uint256 amountOwed = amount + premium;
    //     IERC20(asset).approve(address(POOL), amountOwed);

    //     return true;
    // };

    /*                  A-A-V-E P-O-O-L-S                      */

    //    Function to fetch data from AAVE Pools using function getReserveData(address asset)

    //    Function to fetch user data from AAVE Pools function getUserAccountData(address user)

    /// @notice Deposit WETH into AAVE's pool
    /// @dev Manually approve this contract of infinite to POOL of infinite tokens
    function give_Allowance_USDC() external onlyOwner {
        IERC20(ERC20_TO_BORROW_POLYGON).approve(
            AAVE_POOL_POLYGON, type(uint256).max
        );
    }

    function give_Allowance_WETH() external onlyOwner {
        IERC20(ERC20_TO_DEPOSIT_POLYGON).approve(
            AAVE_POOL_POLYGON, type(uint256).max
        );
    }

    function supply_WETH_Pool(address _user, uint256 _amount) internal {
        IPool(AAVE_POOL_POLYGON).supply(
            ERC20_TO_DEPOSIT_POLYGON, _amount, _user, 0
        );
    }

    /// @notice Borrow USDC from AAVE's pool
    function borrow_USDC_Pool(address _user, uint256 _amount) internal {
        IPool(AAVE_POOL_POLYGON).borrow(
            ERC20_TO_BORROW_POLYGON, _amount, 0, 0, _user
        );
    }

    /*            AAVE ends                   */

    /*                  Interacting with UNI Pools                      */

    uint24 public constant poolFee = 3000;

    /// @notice swapExactOutputSingle swaps a minimum possible amount of DAI for a fixed amount of WETH.
    /// @dev The calling address must approve this contract to spend its DAI for this function to succeed. As the amount of input DAI is variable,
    /// the calling address will need to approve for a slightly higher amount, anticipating some variance.
    /// @param amountOut The exact amount of WETH9 to receive from the swap.
    /// @param amountInMaximum The amount of DAI we are willing to spend to receive the specified amount of WETH9.
    /// @return amountIn The amount of DAI actually spent in the swap.

    function swapExactOutputSingle(
        uint256 amountOut,
        uint256 amountInMaximum,
        address tokenA,
        address tokenB
    )
        internal
        returns (uint256 amountIn)
    {
        // Transfer the specified amount of DAI to this contract.
        TransferHelper.safeTransferFrom(
            tokenA, msg.sender, address(this), amountInMaximum
        );

        // Approve the router to spend the specifed `amountInMaximum` of DAI.
        // In production, you should choose the maximum amount to spend based on oracles or other data sources to acheive a better swap.
        TransferHelper.safeApprove(
            tokenA, address(swapRouter), type(uint256).max
        );

        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter
            .ExactOutputSingleParams({
            tokenIn: tokenA,
            tokenOut: tokenB,
            fee: poolFee,
            recipient: msg.sender,
            deadline: block.timestamp,
            amountOut: amountOut,
            amountInMaximum: amountInMaximum,
            sqrtPriceLimitX96: 0
        });

        // Executes the swap returning the amountIn needed to spend to receive the desired amountOut.
        amountIn = swapRouter.exactOutputSingle(params);

        // For exact output swaps, the amountInMaximum may not have all been spent.
        // If the actual amount spent (amountIn) is less than the specified maximum amount, we must refund the msg.sender and approve the swapRouter to spend 0.
        if (amountIn < amountInMaximum) {
            TransferHelper.safeApprove(tokenA, address(swapRouter), 0);
            TransferHelper.safeTransfer(
                tokenA, msg.sender, amountInMaximum - amountIn
            );
        }
    }

    //        ████████████████████████████

    //        █▄─▄▄─█─▄─▄─█─█─█▄▄▄░█▄─▀─▄█
    //        ██─▄█▀███─███─▄─██▄▄░██▀─▀██
    //        ▀▄▄▄▄▄▀▀▄▄▄▀▀▄▀▄▀▄▄▄▄▀▄▄█▄▄▀
    // struct Position {
    //         address owner; //160 bits
    //         uint96 amountInEth; //96 bits
    //         uint128 mintedTime; //128bits
    //         uint128 ethPrice; // 128bits
    //         uint256 mintedTokens; // 256bits
    //         bool ifClosed; //8bits
    //     }

    ///    CREATING ETH3XUP POSITIONS     ///

    /// 1) deposit_WETH_ETH3XUP(amount)  DONEEEEEE
    /// 2) requestFlashloan()            DONEEEEEEE
    /// 3) Deposited 3X into WETH        DONEEEEEEEEE
    /// 4) Borrow 2X from USDC Pool      DONEEEEEEEEEEE
    /// 5) ReturnToFlashLoan             DONEEEEEEEEEEEEE
    /// 6) Mint Tokens                   DONEEEEEEEEEEEEEEE
    // mapping(address => Position[]) user_to_ETH3XUP_positions;
    mapping(address => uint256) count_Positions;

    function initiate_ETH3XUP(uint256 amount) external {
        // bool success = IERC20(ERC20_TO_DEPOSIT_POLYGON).transfer(address(this), amount);
        // if (!success) {
        //     revert Depositing_WETH_Failed();
        // }
        // Work out ifClosed, mintedTime, ethPrice, mintedTokens
        Position memory newPosition = Position({
            owner: msg.sender,
            amountInEth: amount,
            ifClosed: false,
            mintedTime: block.timestamp,
            ethPrice: uint256(getLatestPrice()),
            mintedTokens: 0,
            positionValue: 0
        });
        user_to_ETH3XUP_positions[msg.sender][count_Positions[msg.sender]] =
            newPosition;
        requestFlashLoan(ERC20_TO_DEPOSIT_POLYGON, (2 * amount));
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    )
        external
        override
        returns (bool)
    {
        // We now have 3X WETH

        // Approve POOL contract of
        uint256 amount_deposited = user_to_ETH3XUP_positions[tx.origin][count_Positions[tx
            .origin]].amountInEth;
        count_Positions[tx.origin]++;

        supply_WETH_Pool(address(this), 3 * amount_deposited);
        uint256 amount_borrow = 2 * (amount_deposited) * 100;
        amount_borrow = amount_borrow / 98 ;
        borrow_USDC_Pool(address(this), amount_borrow);
        swapExactOutputSingle(
         2*amount_deposited,
         amount_borrow,
        ERC20_TO_BORROW_POLYGON,
        ERC20_TO_DEPOSIT_POLYGON
    );

        // This contract now has the funds requested.
        // Your logic goes here.
        // At the end of your logic above, this contract owes
        // the flashloaned amount + premiums.
        // Therefore ensure your contract has enough to repay
        // these amounts.

        // Approve the Pool contract allowance to *pull* the owed amount
        uint256 amountOwed = amount + premium;
        IERC20(asset).approve(address(POOL), amountOwed);
        return true;
    }

    // struct Position {
    //         address owner; //160 bits
    //         uint96 amountInEth; //96 bits
    //         uint128 mintedTime; //128bits
    //         uint128 ethPrice; // 128bits
    //         uint256 mintedTokens; // 256bits
    //         bool ifClosed; //8bits
    //     }

    /// @notice Returns params related to a position to calculate number of tokens to mint
    function get_current_Params(address _User)
        public
        returns (uint256 _amountInEth, uint256 _ethPrice)
    {
        _amountInEth =
            user_to_ETH3XUP_positions[_User][count_Positions[_User]].amountInEth;
        _ethPrice =
            user_to_ETH3XUP_positions[_User][count_Positions[_User]].ethPrice;
    }

    function get_CONTRACT_WETH_POSITION() public returns (uint256) {
        (uint256 a,,,,,) =
            IPool(AAVE_POOL_POLYGON).getUserAccountData(address(this));
        return a;
    }

    function get_CONTRACT_USDC_POSITION() public returns (uint256) {
        (, uint256 a,,,,) =
            IPool(AAVE_POOL_POLYGON).getUserAccountData(address(this));
        return a;
    }

    function get_CONTRACT_VALUE() public returns (uint256) {
        return get_CONTRACT_WETH_POSITION() - get_CONTRACT_USDC_POSITION();
    }

    function CALCULATE_TOKENS_TO_MINT(uint256 amountInEth)
        public
        returns (uint256)
    {
        uint256 totalSupply = IERC20(PRAXIS_ERC20).totalSupply(); // in 10**18 denomination
        uint256 CONTRACT_WETH_POSITION = get_CONTRACT_WETH_POSITION(); // in 10**8 denomination
        CONTRACT_WETH_POSITION = CONTRACT_WETH_POSITION * (10 ** 10);
        uint256 CONTRACT_USDC_POSITION = get_CONTRACT_USDC_POSITION(); // in 10**8 denomination
        CONTRACT_USDC_POSITION = CONTRACT_USDC_POSITION * (10 ** 10);
        uint256 ETHPrice = uint256(getLatestPrice()); // in 10**8 position
        ETHPrice = ETHPrice / (10 ** 8);

        //div(sub(mul(CONTRACT_WETH_POSITION,ETHPrice),CONTRACT_USDC_POSITION),totalSupply);
        uint256 prev_ETHUP_Price =
            (CONTRACT_WETH_POSITION - CONTRACT_USDC_POSITION) / totalSupply;
        uint256 COUNT_mintETHUP3X =
            CONTRACT_WETH_POSITION + 3 * (amountInEth) * ETHPrice;
        COUNT_mintETHUP3X = COUNT_mintETHUP3X
            - (CONTRACT_USDC_POSITION + 2 * (amountInEth) * (ETHPrice));
        COUNT_mintETHUP3X = (COUNT_mintETHUP3X) / prev_ETHUP_Price;
        COUNT_mintETHUP3X = COUNT_mintETHUP3X - totalSupply;
        return COUNT_mintETHUP3X;
    }

    function mintETHUP3X(address _User) internal {
        // minting logic
        uint256 amountInEth =
            user_to_ETH3XUP_positions[_User][count_Positions[_User]].amountInEth;
        uint256 ethPrice =
            user_to_ETH3XUP_positions[_User][count_Positions[_User]].ethPrice;

        uint256 ETHUP3X_TOKENS = CALCULATE_TOKENS_TO_MINT(amountInEth);
        praxisERC20(PRAXIS_ERC20).mint(_User, ETHUP3X_TOKENS);
        user_to_ETH3XUP_positions[_User][count_Positions[_User]].mintedTokens =
            ETHUP3X_TOKENS;
        user_to_ETH3XUP_positions[_User][count_Positions[_User]].positionValue =
            get_CONTRACT_VALUE();
        count_Positions[_User]++;
    }

    function setPraxisERC20(address bhai) external onlyOwner {
        PRAXIS_ERC20 = bhai;
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

    uint256 decimals = 10**18;

    function gettotalSupply() public view returns(uint256){
        return IERC20(PRAXIS_ERC20).totalSupply();
    }



    function redeem_ETHUP3X(
        address _user,
        uint256 _amount,
        uint256 PositionIndex,
        uint256 USDC_Decimals
    )
        public
        returns (bool)
    {
        // uint256 totalbalanceUser = IERC20(praxisERC20).balanceOf(_user);
        // require( _amount <= totalBalanceUser, "NOT_ENOUGH_COINS"  );
        // bool checked = true;
        // require(  (checked==true) || _amount == user_to_ETH3XUP_positions[msg.sender][PositionIndex].mintedTokens );
        uint256 totalbalanceUser = IERC20(PRAXIS_ERC20).balanceOf(_user);
        require(_amount <= totalbalanceUser, "NOT_ENOUGH_COINS");

        // amount's denomination is 10**18
        uint256 tSupply = IERC20(PRAXIS_ERC20).totalSupply();
        uint256 ratio = _amount / tSupply;
        uint256 wethPrice = uint256(getLatestPrice());

        uint256 withdraw_WETH = ratio * get_CONTRACT_WETH_POSITION(); //USDC with 10^8 decimals
        withdraw_WETH = withdraw_WETH / wethPrice;
        withdraw_WETH = withdraw_WETH * (10 ** 18);

        uint256 repay_USDC = ratio * get_CONTRACT_USDC_POSITION(); // USDC with 10^8 decimals
        repay_USDC = (repay_USDC) / (10 ** 8);

        repay_USDC = (repay_USDC * USDC_Decimals);

        // function withdraw(address asset, uint256 amount, address to)
        IPool(AAVE_POOL_POLYGON).withdraw(
            ERC20_TO_DEPOSIT_POLYGON, withdraw_WETH, msg.sender
        );

        swapExactOutputSingle(
            repay_USDC,
            withdraw_WETH,
            ERC20_TO_DEPOSIT_POLYGON,
            ERC20_TO_BORROW_POLYGON
        );

        // function repay(address asset, uint256 amount, uint256 rateMode, address onBehalfOf)
        IPool(AAVE_POOL_POLYGON).repay(
            ERC20_TO_BORROW_POLYGON, repay_USDC, 2, address(this)
        );
        user_to_ETH3XUP_positions[_user][PositionIndex].ifClosed = true;
        praxisERC20(PRAXIS_ERC20).burn(_user, _amount);

        uint256 USDC_BALANCE_NOW =
            IERC20(ERC20_TO_BORROW_POLYGON).balanceOf(address(this));
        bool success =
            IERC20(ERC20_TO_BORROW_POLYGON).transfer(_user, USDC_BALANCE_NOW);
        if (!success) {
            revert();
        }

        praxisERC20(PRAXIS_ERC20).burn(_user, _amount);
        return success;
    }

    receive() external payable {}
}
