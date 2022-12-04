import { ConnectButton, cssObjectFromTheme, Theme } from '@rainbow-me/rainbowkit';
import PositionCard from "./PositionCard.jsx"
import {Loaderr} from "./Loaderr.jsx"
import React, { useEffect, useState, useContext } from "react";
import { BrowserRouter as Router, Link, useLocation } from "react-router-dom";
import { useAccount, useBalance } from 'wagmi'
import PositionContext from '../context/context'
import Footer from "./Footer.jsx"
import sendNotification from './PushProtocol.js'
import { useNavigate } from "react-router-dom";

//font awesome:
import { FaBell } from "react-icons/fa";

const Dashboard = () => {
  let navigate = useNavigate();
  let location = useLocation();

  const { address, isConnecting, isDisconnected } = useAccount()
  const {ens, fetch_ens_name, loading, positions, wethToUsdcCurrentPrice,  get_weth_to_usdc_current_price, getAllPositions, getActivePosition, totalDepositedWethByUser, totalEthup3xMintedByUser, totalvalueOfUser, currentEthup3xPrice} = useContext(PositionContext)
  
  const send_notif = async ()=>{
      let pos = await sendNotification(address,wethToUsdcCurrentPrice)
      return pos
    }

  useEffect( () => {
    const fetchAllPositions = async ()=>{
      let pos = await getAllPositions(address)
      return pos
    }
    fetchAllPositions();
    send_notif();
    const fetch_ens = async ()=>{
      let res = await fetch_ens_name(address)
      return res
    }
    fetch_ens()
  }, [])

  //send notification every
  setInterval(send_notif, 7200000);

  const weth_balance = useBalance({
    address: address,
    token: '0x5da5da6933637c1cafa5de9fdf2acb1b3758c9e3',
  })

  const usdc_balance = useBalance({
    address: address,
    // token: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    token: '0x2170ed0880ac9a755fd29b2688956bd959f933f8'
  })

  return ( isDisconnected ? navigate("/") :
  loading!=="no" ? <Loaderr text={loading}/> :
  <div className="dashboard">
  <div className="d-flex justify-content-between">
    <div className="header">
        <h1 className="dash_heading">Dashboard</h1>
    </div>
    <div></div>
    <div>
    <div className="d-flex justify-content-between">
      <div className="notif-icon" title="Click to subscribe and get notified daily about your position"><span><a href="/https://staging.push.org/#/channels"><img width="30px" height="30px" src="https://static.vecteezy.com/system/resources/previews/001/505/138/original/notification-bell-icon-free-vector.jpg" alt="notify"/></a></span></div>
      <div></div>
      {ens==="hey" ? <div><ConnectButton showBalance={true}/></div> : <div className="ens-box"><button type="button" className="btn btn-dark ens-btn">{ens}</button></div>}
    </div>
    </div>
  </div>

    <div className="dash_body">
    <h1 className="dash_subheading">Your Positions</h1>
    </div>

    <div className="d-flex justify-content-start">
      <div>
        <div className="d-flex justify-content-around" style={{marginBottom:"0px",fontSize:"12px",paddingBottom:"0px"}}>
          <div className="position-card-col">Perps</div>
          <div className="position-card-col">Deposited</div>
          <div className="position-card-col">Current Value</div>
          <div className="position-card-col">24h Change</div>
        </div>

        {positions.length===0 ? <h3>No positions opened yet.</h3> : positions.slice(0).reverse().map((position) => {
            return <>
            <PositionCard key={position.id} position={position}/>
            <PositionCard key={position.id} position={position}/>
            <PositionCard key={position.id} position={position}/>
            </>
        })}
      </div>

      <div className="open-buttons">
      <div className="position-details-box">
            <div class="container text-center">
              <div class="row position-row">
                <div class="col-3 col-heading-dash">Total Deposit:</div>
                <div class="col-1 col-val">{totalDepositedWethByUser.toFixed(3)}</div>
              </div>
              <div class="row position-row">
                <div class="col-3 col-heading-dash" width="220px">ETHUP3x Tokens:</div>
                <div class="col-1 col-val">{totalEthup3xMintedByUser.toFixed(3)}</div>
              </div>
              <div class="row position-row">
                <div class="col-3 col-heading-dash">Total Position:</div>
                <div class="col-1 col-val">{totalvalueOfUser.toFixed(3)}</div>
              </div>
              <div class="row position-row">
                <div class="col-3 col-heading-dash">ETHUP3x Price:</div>
                <div class="col-4 col-val">{currentEthup3xPrice.toFixed(3)}</div>
              </div>
            </div>

            <div class="container text">
                <Link to="/OpenLongPosition"><button type="button" className="btn btn-primary open-button" >Open ETHUP3x</button></Link>
            </div>

      </div>
        {/* <Link to="/OpenLongPosition"><button type="button" className="btn btn-primary open-button" >Open ETHUP3X</button></Link> */}
      </div>
    </div>
    <Footer/>
  </div>
  );
};

export default Dashboard;