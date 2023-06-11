"use client"
import Web3 from 'web3'
import CryptoJS from 'crypto-js'
import { useEffect, useState } from 'react'

export default function Home() {
  const [domReady, setDomReady] = useState(false)
  const [connected, setConnected] = useState(false)
  const [message, setMessage] = useState("")
  const [passPhrase, setPassphrase] = useState("")
  const [encryptedMessage, setEncryptedMessage] = useState("")
  const [signature, setSignature] = useState("")
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    setDomReady(true)
  }, [])

  const connect = async () => {
    if(window.ethereum){
      let account_arr = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccounts(account_arr)
      setConnected(true)
      console.log(accounts)
    }
    else{
      alert('No wallet found')
    }
  }

  const encryptMessage = async (message: string) => {
    let encryptedMessage = CryptoJS.AES.encrypt(message, passPhrase).toString()
    setEncryptedMessage(encryptedMessage)
    console.log({encryptedMessage})
  }

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
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
          onClick={() => encryptMessage(message)}
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
          value={encryptedMessage}
          readOnly={true}
        />

        {/* sign message using metamask */}
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-4`}
          onClick={() => signMessage(message)}
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
