import { ConnectButton, Theme } from '@rainbow-me/rainbowkit';
import React, { useEffect, useState, useContext } from "react";
import { BrowserRouter as Router, Link, useLocation } from "react-router-dom";
import { useAccount, useBalance } from 'wagmi'
import PositionContext from '../context/context'
import { useNavigate } from "react-router-dom";
import Graph from './Graph.jsx'
import Dashboard from './Dashboard.jsx'

const Home = () => {
  let navigate = useNavigate();
  const { address, isConnecting, isDisconnected } = useAccount()

  useEffect( () => {
    // if(!isDisconnected){
    //   navigate("/dashboard");
    // }
    
  }, []);

  return ( !isDisconnected ? navigate("/Dashboard"):
  <div>
  <div className="home">
    <h1 className="home_heading">Praxis Finance</h1>
    <h4 className="home_subheading">Trade with OnChain Perpetual futures <br/> built over AAVE'S deep liquidity</h4>
    {/* <p className="home_text">Trade with OnChain Perpetual futures built over AAVE'S deep liquidity</p> */}
  </div>
  {isDisconnected ? <div className="disconnected"><ConnectButton/></div> : <div className="connected"><ConnectButton/></div>}
  </div>);
};

export default Home;