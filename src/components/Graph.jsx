//Li-fi integration
import { LiFiWidget, WidgetConfig } from '@lifi/widget';
import { useMemo } from 'react';
import { useAccount } from 'wagmi'

const Graph = (props) => {
    return(
      <div class="tradingview-widget-container" style={{"width": props.width, "height": props.height}}>
      <iframe scrolling="no" allowtransparency="true" frameborder="0" src="https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=in#%7B%22symbol%22%3A%22UNISWAP3ARBITRUM%3AWETHUSDC%22%2C%22width%22%3A350%2C%22height%22%3A220%2C%22dateRange%22%3A%221M%22%2C%22colorTheme%22%3A%22dark%22%2C%22trendLineColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%201)%22%2C%22underLineColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.3)%22%2C%22underLineBottomColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200)%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Afalse%2C%22largeChartUrl%22%3A%22%22%2C%22noTimeScale%22%3Afalse%2C%22utm_source%22%3A%22%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22mini-symbol-overview%22%2C%22page-uri%22%3A%22__NHTTP__%22%7D" style={{"boxSizing": "borderBox", "height": props.height, "width": props.width}}></iframe>
      <div class="tradingview-widget-copyright"><a href="https://in.tradingview.com/symbols/WETHUSDC/?exchange=UNISWAP3ARBITRUM" rel="noopener" target="_blank"><span class="blue-text">WETHUSDC Quotes</span></a> by TradingView</div>
      </div>);
};

export default Graph;
