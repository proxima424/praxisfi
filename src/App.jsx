//rainbowkit
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  Theme
} from '@rainbow-me/rainbowkit';
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

//others
import merge from 'lodash.merge';
import React, { useEffect, useState, useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

//components
import PositionState from './context/state';
import PositionContext from './context/context'
import Home from "./components/Home.jsx"
import Position from "./components/Position.jsx"
import OpenLongPosition from "./components/OpenLongPosition.jsx"
import Dashboard from "./components/Dashboard.jsx"
import Dashboard_2 from "./components/Dashboard_2.jsx"
import Dashboard_3 from "./components/Dashboard_3.jsx"
import Footer from "./components/Footer.jsx"
import Loaderr from "./components/Loaderr.jsx"
import { useAccount, useBalance } from 'wagmi'

//styles:
import './styles/index.css';

//ens

const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

//rainbowkit theme:
const myTheme = merge(darkTheme(), {
  colors: {
    accentColor: '#8c52ff',
    connectButtonBackground:'#8c52ff',
    standby:'#8c52ff'
  },
} );

const App = () => {

  const { address, isConnecting, isDisconnected } = useAccount()

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider coolMode chains={chains} theme={myTheme}>
      <PositionState>
      <Routes>
            <Route exact path="/" element={<Home />} />
            {/* <Route exact path="/dashboard" element={<Protocol protocol={"protocol"}  min_tokens_to_create={2} />} /> */}
            <Route exact path="/dashboard" element={<Dashboard />} />
            <Route exact path="/dashboard_2" element={<Dashboard_2 />} />
            <Route exact path="/dashboard_3" element={<Dashboard_3 />} />
            <Route path="/Position" element={<Position />} />
            <Route path="/OpenLongPosition" element={<OpenLongPosition />} />
      </Routes>
      </PositionState>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default App;