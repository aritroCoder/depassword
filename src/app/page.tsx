"use client";
import Web3 from "web3";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import { useEffect, useState } from "react";
import contractABI from "../constants/abi.json";

export default function Home() {
  const [domReady, setDomReady] = useState(false);
  const [connected, setConnected] = useState(false);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [credential, setCredential] = useState({
    website: "",
    username: "",
    password: "",
  });
  const [en_credential, setEnCredential] = useState({
    en_username: "",
    en_password: "",
  });
  const [passPhrase, setPassphrase] = useState("");
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const contractAddress = "0xA2cF1A444f4aB42b02b1053D7d87540f3Bced6ef";

  useEffect(() => {
    setDomReady(true);
  }, []);

  const connect = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      let contract = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contract);
      console.log({ signer, contract });
      setSigner(signer);
      setConnected(true);
    } else {
      alert("No wallet found");
    }
  };

  const encryptMessage = async (credential: {
    website: string;
    username: string;
    password: string;
  }) => {
    let en_username = CryptoJS.AES.encrypt(
      credential.username,
      passPhrase
    ).toString();
    let en_password = CryptoJS.AES.encrypt(
      credential.password,
      passPhrase
    ).toString();
    setEnCredential({ en_username, en_password });
  };

  const addCreds = async (e: any) => {
    e.preventDefault();
    if (contract) {
      console.log("Contract call");
      try {
        const tx = await contract.addCredentials(
          credential.website,
          en_credential.en_username,
          en_credential.en_password
        );
        contract.on("added_temp_credentials", async (merkleRoot: string) => {
          console.log({ merkleRoot });
          let signature = await signer?.signMessage(
            ethers.getBytes(merkleRoot)
            // merkleRoot
          );
          console.log({ signature });
          if(contract && signature){
            console.log("Sign merkleroot")
            try {
              let tx_approve = await contract.approveCredentials(
                signature
              );
              console.log(tx_approve)
            } catch (error) {
              console.log(error)
            }
          }
        });
        await tx.wait();
        console.log({ tx });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const signMessage = async (encryptedMessage: string) => {
    if (accounts.length === 0) {
      alert("Please connect wallet first");
      return;
    }
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      const signature: string = await window.web3.eth.personal.sign(
        encryptedMessage,
        accounts[0]
      );
      console.log({ signature });
      setSignature(signature);
    }
  };

  return (
    <div>
      <h1 className={`text-6xl p-4`}>Home</h1>
      <div className="flex flex-col items-center justify-center">
        {domReady && (
          <button
            onClick={() => connect()}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-4`}
          >
            {!connected ? "Connect Wallet" : "Wallet Connected"}
          </button>
        )}

        {/* Input message and passphrase */}
        <input
          type="text"
          name="message"
          id="msg"
          className={`p-2 m-4 text-black border-2 border-black rounded`}
          placeholder="website"
          value={credential.website}
          onChange={(e) =>
            setCredential({ ...credential, website: e.target.value })
          }
        />
        <input
          type="text"
          name="message"
          id="msg"
          className={`p-2 m-4 text-black border-2 border-black rounded`}
          placeholder="username"
          value={credential.username}
          onChange={(e) =>
            setCredential({ ...credential, username: e.target.value })
          }
        />
        <input
          type="text"
          name="message"
          id="msg"
          className={`p-2 m-4 text-black border-2 border-black rounded`}
          placeholder="Message"
          value={credential.password}
          onChange={(e) =>
            setCredential({ ...credential, password: e.target.value })
          }
        />
        <input
          type="text"
          name="passKey"
          id="key"
          className={`p-2 m-4 text-black border-2 border-black rounded`}
          placeholder="Passphrase"
          value={passPhrase}
          onChange={(e) => setPassphrase(e.target.value)}
        />

        {/* encrypt message using AES-256 */}
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-4`}
          onClick={() => encryptMessage(credential)}
        >
          Encrypt Message
        </button>
        <label htmlFor="encryptedMessage" className={`text-2xl`}>
          Encrypted Message
        </label>
        <input
          type="text"
          name="passKey"
          id="key"
          className={`p-2 m-4 text-black border-2 border-black rounded`}
          value={en_credential.en_username}
          readOnly={true}
        />
        <input
          type="text"
          name="passKey"
          id="key"
          className={`p-2 m-4 text-black border-2 border-black rounded`}
          value={en_credential.en_password}
          readOnly={true}
        />
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-4`}
          onClick={(e) => addCreds(e)}
        >
          Add Credential
        </button>
      </div>
    </div>
  );
}
