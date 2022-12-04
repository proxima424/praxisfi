import { ConnectButton, Theme } from '@rainbow-me/rainbowkit';
import { BrowserRouter as Router, Link, useLocation } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import { useAccount, useBalance } from 'wagmi'
import PositionContext from '../context/context'
import Graph from "./Graph.jsx"
import Footer from "./Footer.jsx"
import {Loaderr} from './Loaderr.jsx'
import { useNavigate } from "react-router-dom";

//font awesome:
import { FaArrowLeft } from "react-icons/fa";

const Position = (props) => {
  let navigate = useNavigate();
  const {transfer_position, loading, ens, fetch_ens_name, sell_position, activePosition, fetchCurrentValueOfPosition, currentEthup3xPrice} = useContext(PositionContext)
  const { address, isConnecting, isDisconnected } = useAccount()

  const [position, setPosition] = useState({receiver:""})

  const handleClick = async (e) => {
    e.preventDefault(); //to prevent page reload upon submitting
    await transfer(position.receiver);
    setPosition({receiver:""});
    navigate("/dashboard");
  }
  const handleOnChange = (e) => {
    setPosition({ ...position, [e.target.name]: e.target.value });
  }

  const sell = async () =>{
    let res = await sell_position(address, activePosition);
    return res;
  }
  const transfer = async (receiver_addr) =>{
    let res = await transfer_position(address, activePosition.id,receiver_addr);
    return res;
  }

  useEffect( () => {
    const fetch_position_value = async ()=>{
      let val = await fetchCurrentValueOfPosition(activePosition)
    }
    fetch_position_value();
    const fetch_ens = async ()=>{
      let res = await fetch_ens_name(address)
      return res
    }
    fetch_ens()

  }, []);

  // console.log(activePosition)
    return (isDisconnected ? navigate("/") : loading!=="no" ? <Loaderr text={loading}/> :
      <>
      <div className="position">

        <div className="d-flex justify-content-between">
            <div className="header">
                <h1 className="position_heading"><span className="back-arrow"> <Link to='/dashboard'><FaArrowLeft/></Link></span>Your Position: WETHUP3x</h1>
            </div>
            <a style={{"paddingTop":"10px", "textDecoration":"underline"}} href={activePosition.polyscan_link}>Proof of Position</a>
            {ens==="hey" ? <div><ConnectButton showBalance={true}/></div> : <div className="ens-box"><button type="button" className="btn btn-dark ens-btn">{ens}</button></div>}
        </div>

        <div className="d-flex justify-content-around">
          <div className="position-details-box">
            <div class="container text-center">
              <div class="row position-row">
                <div class="col-4 col-heading">Deposit:</div>
                <div class="col-4 col-val">{activePosition.deposited_funds}</div>
                <div class="col-1 col-unit">WETH</div>
              </div>
              <div class="row position-row">
                <div class="col-4 col-heading">Current Position Value:</div>
                <div class="col-4 col-val">{activePosition.current_value_of_position.toFixed(3)}</div>
                <div class="col-1 col-unit">USDC</div>
              </div>
              <div class="row position-row">
                <div class="col-4 col-heading">Value when Opened:</div>
                <div class="col-4 col-val">{activePosition.opening_position.toFixed(3)}</div>
                <div class="col-1 col-unit">USDC</div>
              </div>
              <div class="row position-row">
                <div class="col-4 col-heading">Expected P/L on selling:</div>
                <div class="col-4 col-val">{(activePosition.current_value_of_position-activePosition.opening_position).toFixed(3)}</div>
                <div class="col-1 col-unit">USDC</div>
              </div>
              <div class="row position-row">
                <div class="col-4 col-heading">WETHUP Price:</div>
                <div class="col-4 col-val">{currentEthup3xPrice.toFixed(3)}</div>
                <div class="col-1 col-unit">USDC</div>
              </div>
              <div class="row position-row">
                <div class="col-4 col-heading">Number of WETHUP3x tokens you hold:</div>
                <div class="col-4 col-val">{activePosition.num_of_tokens.toFixed(3)}</div>
                <div class="col-1 col-unit"></div>
              </div>
            </div>

            <div class="row open-long-row">
            <div class="col-4 col-input">
            <button disabled={position.receiver==="" ? true : false} type="submit" className="btn btn-primary transfer-btn" onClick={handleClick}>Transfer to: </button>
            </div>
            <div class="col-8 col-input"><textarea placeholder="Enter receiver's address" className="form-control" name="receiver" rows="1" value={position.receiver} onChange={handleOnChange}></textarea></div>
            </div>

            <div class="container text">
                <Link to="/Dashboard"><button type="button" className="btn btn-primary sell-button" onClick={sell}>Close Position with Praxis</button></Link>
            </div>

          </div>

          <div></div>

          <div className="position-graph-box">
            <Graph width="450px" height="250px"/>
          </div>
        </div>

        {/* <div className="position-card-col">graph link: {activePosition.graph_link}</div> */}
    </div>
    <Footer />
    </>
  );
};

export default Position;