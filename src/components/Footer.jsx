import { ConnectButton, Theme } from '@rainbow-me/rainbowkit';
import React, { useEffect, useState, useContext } from "react";
import { BrowserRouter as Router, Link, useLocation } from "react-router-dom";
import { useAccount, useBalance } from 'wagmi'
import PositionContext from '../context/context'
import { useNavigate } from "react-router-dom";

const Footer = () => {
  let navigate = useNavigate();
  const { address, isConnecting, isDisconnected } = useAccount()

  return (
  <footer className="footer">
    <h3 className="footer_text">Praxis Finance</h3>
  </footer>
  );
};

export default Footer;