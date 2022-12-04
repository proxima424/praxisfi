import { ConnectButton, Theme } from '@rainbow-me/rainbowkit';
import { BrowserRouter as Router, Link, useLocation } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import { useAccount, useBalance } from 'wagmi'
import PositionContext from '../context/context'

const PositionCard = (props) => {
  const {getActivePosition} = useContext(PositionContext)

  const goToActivePosition = async () => {
    await getActivePosition(props.position.id)
    console.log("active")
  }

  return (
    <Link to="/Position">
    <div className="d-flex justify-content-around position-card" style={{"cursor": "pointer"}}>
      <div className="position-card-col" onClick={goToActivePosition}>WETHUP3x</div>
      <div className="position-card-col">{props.position.deposited_funds}WETH</div>
      <div className="position-card-col">{props.position.current_value_of_position.toFixed(3)}WETH</div>
      {/* {props.position.change_24h > 0 ? <div className="position-card-col" style={{color:"green"}}>{props.position.change_24h}%</div> : 
      <div className="position-card-col" style={{color:"red"}}>{props.position.change_24h}%</div>} */}
    </div>
    </Link>
  );
};

export default PositionCard;