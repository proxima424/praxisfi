import { ConnectButton, cssObjectFromTheme, Theme } from '@rainbow-me/rainbowkit';

import React, { useEffect, useState, useContext } from "react";
import { BrowserRouter as Router, Link, useLocation } from "react-router-dom";
import { useAccount, useBalance } from 'wagmi'
import PositionContext from '../context/context'
import { useNavigate } from "react-router-dom";

import LifiWidget from './LifiWidget.jsx'
import Graph from './Graph.jsx'
import Footer from './Footer.jsx'
import {Loaderr} from './Loaderr.jsx'

//font awesome:
import { FaArrowLeft } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid, regular, brands, icon } from '@fortawesome/fontawesome-svg-core/import.macro' 

const OpenLongPosition = () => {
  let navigate = useNavigate();
  useEffect( () => {
    const get_weth_To_usdc = async ()=>{
      let pos = await get_weth_to_usdc_current_price()
    }
    get_weth_To_usdc();

    const update_trade_statistics = async ()=>{
      let pos = await get_trade_statistics()
    }
    update_trade_statistics();
    const fetch_ens = async ()=>{
      let res = await fetch_ens_name(address)
      return res
    }
    fetch_ens()

    const get_weth_balance = async ()=>{
      let res = await weth_balance(address)
      return res
    }
    get_weth_balance()
  }, []);
  
  const {address, isConnecting, isDisconnected } = useAccount()
  const {wethBalance, weth_balance, loading, ens, fetch_ens_name, open_long_position, getAllPositions, getActivePosition, activePosition, totalDepositedWeth, totalBorrowedUsdc, totalEthup3xMinted, currentEthup3xPrice, wethToUsdcCurrentPrice, get_weth_to_usdc_current_price, get_trade_statistics} = useContext(PositionContext)

  const [position, setPosition] = useState({amount: 0.0, leveraged_position_on_aave: 0.0, ethup3x_tokens:0.0})
  
  const expected_num_of_tokens = (amount) => {
    let new_total_weth = totalDepositedWeth +  amount;
    let new_total_borrowed_usdc = totalBorrowedUsdc + 2*amount*wethToUsdcCurrentPrice;
    let new_contract_value = new_total_weth*wethToUsdcCurrentPrice - new_total_borrowed_usdc;
    let new_total_tokens = new_contract_value/currentEthup3xPrice;
    return new_total_tokens-totalEthup3xMinted;
  }

  const leveraged_position = (amount) => {
    let new_total_weth = totalDepositedWeth +  amount;
    let new_total_borrowed_usdc = totalBorrowedUsdc + 2*amount*wethToUsdcCurrentPrice;
    let new_contract_value = new_total_weth*wethToUsdcCurrentPrice - new_total_borrowed_usdc;
    let new_total_tokens = new_contract_value/currentEthup3xPrice;
    let position_tokens = new_total_tokens-totalEthup3xMinted;
    let ratio = (position_tokens/new_total_tokens);
    let deposited = ratio*new_total_weth*wethToUsdcCurrentPrice;
    let borrowed =  ratio*new_total_borrowed_usdc;
    return deposited - borrowed;
  }

  const handleClick = async (e) => {
    e.preventDefault(); //to prevent page reload upon submitting
    await open_long_position(position.amount, address);
    setPosition({amount: 0.0, leveraged_position_on_aave: 0.0, ethup3x_tokens:0.0});
    await getAllPositions(address)
    navigate("/dashboard");
  }
  const handleOnChange = (e) => {
    setPosition({ ...position, [e.target.name]: e.target.value });
  }
  // const weth_balance=0;
  // const weth = useBalance({
  //   address: address,
  //   token: '0x5da5da6933637c1cafa5de9fdf2acb1b3758c9e3',
  // })

  return (isDisconnected ? navigate("/") : loading!=="no" ? <Loaderr text={loading}/> :
    <>
    <div className="position">

    <div className="d-flex justify-content-between">
        <div className="header">
            <h1 className="position_heading"><span className="back-arrow"> <Link to="/dashboard"><FaArrowLeft/></Link></span>Open WETHUP3x Position</h1>
        </div>
        <div><p style={{"fontSize":"20px","fontWeight":"700"}}>WETHUP3x Price: {currentEthup3xPrice.toFixed(3)}</p></div>
        {ens==="hey" ? <div><ConnectButton showBalance={true}/></div> : <div className="ens-box"><button type="button" className="btn btn-dark ens-btn">{ens}</button></div>}
    </div>

    <div className="d-flex justify-content-around">
      <div className="open-long-lifi">
        <LifiWidget amount={wethBalance<position.amount ? position.amount-wethBalance : 0}/>
      </div>

      <div className="open-long-details-box open-long-details">
        <div class="container text-center">
          <div class="row open-long-row">
            <div class="col-9 col-open-heading">Deposit(WETH):</div>
            <div class="col-3 col-input"><textarea className="form-control" name="amount" rows="1" value={position.amount} onChange={handleOnChange}></textarea></div>
          </div>
          <div class="row open-long-row">
            <div class="col-9 col-open-heading">Leveraged Position Value(WETH):</div>
            <div class="col-3 col-input"><input className="form-control" name="leveraged_position_on_aave" value={leveraged_position(position.amount)} onChange={handleOnChange} rows="4" disabled="disabled" /></div>
          </div>
        

          <div class="row open-long-row">
            <div class="col-9 col-open-heading">WETHUP3x tokens you will receive:</div>
            <div class="col-3 col-input"><input className="form-control" name="ethup3x_tokens" value={expected_num_of_tokens(position.amount)} onChange={handleOnChange} rows="4" disabled="disabled" /></div>
          </div>
          <div class="row open-long-row">
            <button disabled={wethBalance<position.amount ? true : false} type="submit" className="btn btn-primary open-long-button" onClick={handleClick}>Open Position</button>
        </div>
        </div>
      </div>

      <div className="open-graph-box">
        <Graph width="380px" height="250px" />
      </div>
    </div>
    </div>
    <Footer/>
  </>);
};

export default OpenLongPosition;