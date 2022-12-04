//Li-fi integration
import { LiFiWidget, WidgetConfig } from '@lifi/widget';
import { useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi'
import React, { useEffect, useState, useContext } from "react";
import { BrowserRouter as Router, Link, useLocation } from "react-router-dom";
import PositionContext from '../context/context'

const LifiWidget = (props) => {

  const { address, isConnecting, isDisconnected } = useAccount()
  const {wethToUsdcCurrentPrice, get_weth_to_usdc_current_price} = useContext(PositionContext);
  useEffect( () => {
    const get_weth_To_usdc = async ()=>{
      let pos = await get_weth_to_usdc_current_price()
    }
    get_weth_To_usdc();
  }, []);
  
  // const ethers = require('ethers');
  // const axios = require('axios');

  // const API_URL = 'https://li.quest/v1';
  //   const getQuote = async (fromChain, toChain, fromToken, toToken, fromAmount, fromAddress) => {
  //       const result = await axios.get(`${API_URL}/quote`, {
  //           params: {
  //               fromChain,
  //               toChain,
  //               fromToken,
  //               toToken,
  //               fromAmount,
  //               fromAddress,
  //           }
  //       });
  //       return result.data;
  //   }

  //   // Check the status of your transfer
  //   const getStatus = async (bridge, fromChain, toChain, txHash) => {
  //       const result = await axios.get(`${API_URL}/status`, {
  //           params: {
  //               bridge,
  //               fromChain,
  //               toChain,
  //               txHash,
  //           }
  //       });
  //       return result.data;
  //   }

  //   const fromChain = 'GOR';
  //   const fromToken = 'ETH';
  //   const toChain = 'GOR';
  //   const toToken = 'USDC';
  //   const fromAmount = '0.0001';
  //   const fromAddress = address;

  //   // Set up your wallet
  //   const provider = new ethers.providers.JsonRpcProvider('https://rpc.xdaichain.com/', 100);
  //   const wallet = ethers.Wallet.fromMnemonic("YOUR_PERSONAL_MNEMONIC").connect(
  //       provider
  //   );

  //   const run = async () => {
  //       const quote = await getQuote(fromChain, toChain, fromToken, toToken, fromAmount, fromAddress);
  //       const tx = await wallet.sendTransaction(quote.transactionRequest);

  //       await tx.wait();

  //       // Only needed for cross chain transfers
  //       if (fromChain !== toChain) {
  //           let result;
  //           do {
  //               result = await getStatus(quote.tool, fromChain, toChain, tx.hash);
  //           } while (result.status !== 'DONE' && result.status !== 'FAILED')
  //       }
  //   }

  //   run().then(() => {
  //       console.log('DONE!')
  //   });

  const widgetConfig: WidgetConfig = {
    // variant: 'standard',
    containerStyle: {
      width:'70px',
      border: `1px solid ${
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'rgb(66, 66, 66)'
          : 'rgb(234, 234, 234)'
      }`,
      borderRadius: '16px',
    },
    // theme: {
    //   palette: {
    //     primary: { main: '#9900d1' },
    //     secondary: { main: '#F5B5FF' },
    //   },
    //   shape: {
    //     borderRadius: 0,
    //     borderRadiusSecondary: 0,
    //   },
    //   typography: {
    //     fontFamily: 'Arial',
    //   },
    // },
    // appearance: 'dark',
    // disableAppearance: true,
    // fromAmount: props.amount*wethToUsdcCurrentPrice, //ideally: props.amount*weth to source token current price

    // fromChain: 5, // Goerli
    // toChain: 5, // Goerli
    // fromToken: '0x0000000000000000000000000000000000000000', // ETH
    // toToken: '0xb5B640E6414b6DeF4FC9B3C1EeF373925effeCcF', // USDC,
    // fromAmount: 0.0001,
  };

  return (<>
  <LiFiWidget config={widgetConfig} />
  </>);
};

export default LifiWidget;
