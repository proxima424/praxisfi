// import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import {ThreeDots} from "react-loader-spinner";

export function Loaderr(props) {
  return (<>
  <h3 style={{"textAlign":"center", "marginTop":"20px"}}>{props.text}</h3>
  <div style={{"textAlign":"center","marginTop":"50px","marginLeft":"47%"}}><ThreeDots
        color="#8c52ff"
        height={100}
        width={100}
      /></div>
  </>);
};

// export default Loaderr;
