"use client"
import Web3 from 'web3'
import { ethers } from "ethers";
import CryptoJS from 'crypto-js'
import { useEffect, useState } from 'react'
import contractABI from '../constants/abi.json'

interface Credentials{
  website: string,
  username: string,
  password: string,
  en_password: string,
  en_username: string,
}

export default function Home() {
  const [domReady, setDomReady] = useState(false)
  const [connected, setConnected] = useState(false)
  const [credential, setCredential] = useState({
    website: "",
    username: "",
    password: "",
  })
  const [en_credential, setEnCredential] = useState({
    en_username: "",
    en_password: "",
  })
  const [passPhrase, setPassphrase] = useState("")
  const [encryptedMessage, setEncryptedMessage] = useState("")
  const [signature, setSignature] = useState("")
  const [accounts, setAccounts] = useState([])
  const contractAddress = "0xc4C62aAE5eA3dE459Dd83A2Cc6BFdC33D53eFD41";
  let contract: ethers.Contract | null = null;

  useEffect(() => {
    setDomReady(true)
  }, [])

  const connect = async () => {
    if(window.ethereum){
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      contract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log({signer, contract})
    }
    else{
      alert('No wallet found')
    }
  }

  const encryptMessage = async (credential: {
    website: string,
    username: string,
    password: string,
  }) => {
    let en_username = CryptoJS.AES.encrypt(credential.username, passPhrase).toString()
    let en_password = CryptoJS.AES.encrypt(credential.password, passPhrase).toString()
    setEnCredential({en_username, en_password})
  }

  const addCreds = async (e: any) => {
    console.log("Contract call")
    e.preventDefault();
    if (contract) {
      try {
        const tx = await contract.addCredentials(
          credential.website,
          en_credential.en_username,
          en_credential.en_password
        );
        await tx.wait();
        console.log({ tx });
      } catch (error) {
        console.log(error)
      }
    }
  };

  const signMessage = async (encryptedMessage: string) => {
    if(accounts.length === 0){
      alert('Please connect wallet first')
      return
    }
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum)
      const signature: string = await window.web3.eth.personal.sign(
        encryptedMessage,
        accounts[0]
      );
      console.log({signature})
      setSignature(signature)
    }
  }

  return (
    <div>
      <h1 className={`text-6xl p-4`}>Home</h1>
      <div className="flex flex-col items-center justify-center">
        {domReady && (
          <button
            onClick={() => connect()}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-4`}
            disabled={connected}
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

        {/* sign message using metamask */}
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-4`}
          onClick={() => console.log("sign!")}
        >
          Sign Message
        </button>
        <label htmlFor="encryptedMessage" className={`text-2xl`}>
          Signed Message
        </label>
        <input
          type="text"
          name="passKey"
          id="key"
          className={`p-2 m-4 text-black border-2 border-black rounded`}
          value={signature}
          readOnly={true}
        />
      </div>
    </div>
  );
}
