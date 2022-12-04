//push protocol
import * as PushAPI from "@pushprotocol/restapi";
import * as ethers from "ethers";
const PK = '35c2957c674d5f3a190d7ddffac693e3c8dc9d882aac3471e685fa726ab8b625'; // channel private key
const Pkey = `0x${PK}`;
const signer = new ethers.Wallet(Pkey);

const sendNotification = async(address, value) => {
    try {
      const apiResponse = await PushAPI.payloads.sendNotification({
        signer,
        type: 3, // target
        identityType: 2, // direct payload
        notification: {
          title: `Update on your leveraged position on AAVE`,
          body: `Your current total position is ${value}`
        },
        payload: {
          title: `Update on your leveraged position on AAVE`,
          body: `Your current total position is ${value}`,
          cta: '',
          img: ''
        },
        recipients: 'eip155:5:'+address, // recipient address
        channel: 'eip155:5:0x4CE6bb35589Ab4B1ADdB20260067E4c29D5698a1', // your channel address
        env: 'staging'
      });
      
      // apiResponse?.status === 204, if sent successfully!
      console.log('API repsonse: ', apiResponse);
    } catch (err) {
      console.error('Error: ', err);
    }
}

export default sendNotification;