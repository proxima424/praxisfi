import PositionContext from "./context"
import React, { useState } from "react"
import { ethers } from "ethers";
//ens
import { fetchEnsName } from '@wagmi/core'
import { fetchBalance } from '@wagmi/core'
import { sendTransaction, prepareSendTransaction } from '@wagmi/core'

var axios = require('axios');
const host="http://localhost:5000";
const CONTRACT_ADDRESS = "0xa7873dFD4610B22f9C88129d01ABc993653CACD6";
const ABI = "abi"

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

const getContract = async (sc_address, abi) => {
  try {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(sc_address, abi, signer);
      console.log(connectedContract)
      return connectedContract;

    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error)
    return
  }
}

  //each position is a struct
  const AskContractToGetAllPositions = async (address) => {
    try {
      const connectedContract = await getContract(CONTRACT_ADDRESS, ABI);
      let txn = await connectedContract.get_ETH3XUP_Positions(address);
      console.log(txn);
      return txn;
    } catch (error) {
      console.log(error)
      return
    }
  }

  //creates a position struct {owner, id, amount, time, weth price at time, number of tokens}
  const AskContractToOpenLongPosition = async (amount) => {
    try {
      const connectedContract = await getContract(CONTRACT_ADDRESS, ABI);
      let txn = await connectedContract.initiate_ETH3XUP(amount);
      await txn.wait();
      console.log(txn);
      return txn;
    } catch (error) {
      console.log(error)
      return
    }
  }

  const AskContractToSellPosition = async (address, position) => {
    try {
      const connectedContract = await getContract(CONTRACT_ADDRESS, ABI);
      let txn = await connectedContract.redeem_ETHUP3X(address, position.deposited_funds, position.id, 18);
      await txn.wait();
      console.log(txn);
      return txn;
    } catch (error) {
      console.log(error)
      return
    }
  }

  const AskContractToGetTradeStatistics = async () => {
    try {
      const connectedContract = await getContract(CONTRACT_ADDRESS, ABI);
      //total deposited weth, total borrowed usdc, total ethup3x minted, current ethup3x price, contract value
      let txn_1 = await connectedContract.get_CONTRACT_WETH_POSITION();
      let txn_2 = await connectedContract.get_CONTRACT_USDC_POSITION();
      let txn_3 = await connectedContract.gettotalSupply();
      let txn_4 = (txn_1 - txn_2)/txn_3;
      return [txn_1,txn_2,txn_3,txn_4,1];
    } catch (error) {
      console.log(error)
      return
    }
  }

const PositionState = (props) => {

  const [positions, setPositions] = useState([]);
  const [activePosition, setActivePosition] = useState({});
  const [wethToUsdcCurrentPrice, setWethToUsdcCurrentPrice] = useState(1267.81);
  const [totalDepositedWeth, setTotalDepositedWeth] = useState(1);
  const [totalBorrowedUsdc, setTotalBorrowedUsdc] = useState(7);
  const [totalEthup3xMinted, setTotalEthup3xMinted] = useState(5);
  const [currentEthup3xPrice, setCurrentEthup3xPrice] = useState(8);
  const [contractValue, setContractValue] = useState(8);
  const [totalDepositedWethByUser, setTotalDepositedWethByUser] = useState(10);
  const [totalEthup3xMintedByUser, setTotalEthup3xMintedByUser] = useState(10);
  const [wethBalance, setWethBalance] = useState(10);
  const [totalvalueOfUser, setTotalvalueOfUser] = useState(10);
  const [loading, setLoading] = useState("no");
  const [ens, setEns] = useState("hey")

  const fetch_ens_name = async (address) =>{
    const ens = await fetchEnsName({
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chainId: 1,
    });
    // window.alert(ens);
    setEns(ens);
  }

  const fetch_balance = async (address, token_adress) =>{
    // const balance = await fetchBalance({
    //   address: '0x4CE6bb35589Ab4B1ADdB20260067E4c29D5698a1',
    //   token: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    // })
    // window.alert(balance);
    return 10;
  }

  const weth_balance = async (address) =>{
    // const balance = await fetchBalance({
    //   address: address,
    //   token: "weth_token_address",
    // })
    // window.alert(ens);
    setWethBalance(10);
    return 10;
  }

  //get trade statistics from smart contract
  const get_trade_statistics = async () => {
    try {
      // sleep(5000);
      // const response = await AskContractToGetTradeStatistics();
      const response = [1,7,5,8,10]
      setTotalDepositedWeth(response[0]);
      setTotalBorrowedUsdc(response[1]);
      setTotalEthup3xMinted(response[2]);
      setCurrentEthup3xPrice(response[3]);
      setContractValue(response[4]);
    } catch (error) {
      console.log(error);
      return;
    }
  }

  //get weth to usdc current price:
  const get_weth_to_usdc_current_price = async () => {
    try {
      // let API_KEY = "eaec7b2aed2a8aab05172b4dda7c28e72bcd3f49004744bc2d91a74901704b88";
      // let response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=WETH&tsyms=USDC&api_key=${API_KEY}`, {
      //   // mode: 'cors',
      //   method: 'GET',
      //   headers: {
      //     'authorization':`Apikey ${API_KEY}`
      //   }
      // }).then(response => response.json());
      //response.USDC
      setWethToUsdcCurrentPrice(1267.8)
    } catch (error) {
      console.log(error)
      return
    }
  }

  const fetchCurrentValueOfPosition = async (position_object) => {
    try {
      await get_trade_statistics();
      await get_weth_to_usdc_current_price();
      let T = position_object.num_of_tokens;
      let E3T = totalEthup3xMinted;
      let E = totalDepositedWeth;
      let P = wethToUsdcCurrentPrice;
      let U = totalBorrowedUsdc;
      return ((T/E3T)*E*P) - ((T/E3T)*U);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchPositionDetails = async (address, position_object) => {

    let change_24h = 1.56;

    let current_value_of_position = await fetchCurrentValueOfPosition(position_object);

    let position = {
      id : position_object.id,
      creation_time : position_object.creation_time,
      weth_to_usdc_at_creation : position_object.weth_to_usdc_at_creation,
      polyscan_link : position_object.polyscan_link,
      deposited_funds : position_object.deposited_funds,
      num_of_tokens : position_object.num_of_tokens,
      opening_position : position_object.opening_position,
      change_24h : change_24h,
      current_value_of_position : current_value_of_position
    }
    return position;
  }

  //get all positions:
  const getAllPositions = async (address) => {
    let temp_obj_1 ={"opening_position":60,"isClosed":false,"id":0,"creation_time":Date.now,"weth_to_usdc_at_creation":1200.10,"eth_link":"link1","polyscan_link":"link2","deposited_funds":10,"num_of_tokens":2.05}
    let response = [temp_obj_1, temp_obj_1]
    try {
      setLoading("Fetching your active positions")
      // sleep(5000);
      // response = await AskContractToGetAllPositions(address);
    } catch (error) {
      console.log(error)
      setLoading("no")
      return
    }
    let positions_array = []
    let total_deposited_weth_by_user = 0;
    let total_ethup3x_minted_by_user = 0;
    let total_value_of_user = 0;
    for(let i=0;i<response.length;i++){
      if(response[i].isClosed===false){
        let position = await fetchPositionDetails(address, response[i])
        total_deposited_weth_by_user+=position.deposited_funds;
        total_ethup3x_minted_by_user+=position.num_of_tokens;
        total_value_of_user+=position.current_value_of_position;

        positions_array.push(position)
      }
    }
    setTotalDepositedWethByUser(total_deposited_weth_by_user)
    // setTotalEthup3xMintedByUser(total_ethup3x_minted_by_user)
    let ethup = await fetch_balance(address, "ethup_address")
    setTotalEthup3xMintedByUser(ethup)
    setTotalvalueOfUser(total_value_of_user);
    //adding in front end
    setPositions(positions_array);

    setLoading("no");
  }

  //get active position details:
  const getActivePosition = async (position_id) => {

    for(let i=0;i<positions.length;i++){
      if(positions[i].id===position_id){
        setActivePosition(positions[i])
        break;
      }
    }
  }

  // open long position 
  const open_long_position = async (address,amount) => {
    try {
      setLoading("Opening new position")
      // sleep(5000);
      // const response = await AskContractToOpenLongPosition(amount);
      console.log("position opened")
      //update positions:
      setLoading("Fetching your active positions")
      await getAllPositions(address);
      setLoading("no")
    } catch (error) {
      console.log(error)
      return
    }
  }

  // sell position 
  const sell_position = async (address,position) => {

    try {
      setLoading("Closing your position")
      // sleep(5000);
      // const response = await AskContractToSellPosition(address, position);
      //update positions:
      setLoading("Position Closed, fetching your active positions.")
      await getAllPositions(address)
      setLoading("no")
      console.log("position sold")
    } catch (error) {
      console.log(error)
      return
    }
  }

  const transfer_position = async (address,position_id,receiver) => {

    try {
      setLoading("transfering your position")
      // sleep(5000);
      // const config = await prepareSendTransaction({
      //   request: { to: receiver, value: BigNumber.from('10000000000000000') },
      // })
      // const { hash } = await sendTransaction(config)
      //update positions:
      setLoading("Position transferred, fetching your active positions.")
      await getAllPositions(address)
      setLoading("no")
      console.log("position transferred")
    } catch (error) {
      console.log(error)
      return
    }
  }

  return (
    <PositionContext.Provider value={{transfer_position, wethBalance, weth_balance, ens, fetch_ens_name, loading, positions, activePosition, wethToUsdcCurrentPrice, totalDepositedWeth, totalBorrowedUsdc, totalEthup3xMinted, currentEthup3xPrice, contractValue, setLoading, open_long_position, sell_position, getActivePosition, getAllPositions, fetchCurrentValueOfPosition, get_weth_to_usdc_current_price, get_trade_statistics , totalDepositedWethByUser, totalEthup3xMintedByUser, totalvalueOfUser}}>
      {props.children}
    </PositionContext.Provider>
  );
}

export default PositionState;