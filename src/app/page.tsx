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
  const [decryptedPassword, setDecryptedPassword] = useState("");
  const [signature, setSignature] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const contractAddress = "0x298626f6cc3831EF8B15Bcf41E87c119AC90fA66";

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
          if (contract && signature) {
            console.log("Sign merkleroot");
            try {
              let tx_approve = await contract.approveCredentials(signature);
              console.log(tx_approve);
              const decryptedPassword = CryptoJS.AES.decrypt(
                en_credential.en_password,
                passPhrase
              ).toString(CryptoJS.enc.Utf8);
              //setting decryted password 
              setDecryptedPassword(decryptedPassword);
            } catch (error) {
              console.log(error);
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

  const getAllCredentials = async (website: any) => {
    website.preventDefault();
    if (contract && signer) {
      console.log("Calling contract to decrypt");
      try {
        console.log("Calling getAllCredentials");
        const tx = await contract.getAllCredentials();
        contract.on("all_creds", (creds: any) => {
          console.log({ creds });
        });
        await tx.wait();
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Missing contract or signer object");
    }
  };

  const getCredential = async (website: any) => {
    website.preventDefault();
    if (contract && signer) {
      console.log("Calling contract to decrypt");
      try {
        console.log("Calling getCredentials");
        const tx = await contract.getCredential(credential.website);
        contract.on(
          "cred",
          (website: string, username: string, password: string) => {
            console.log({ website, username, password });
          }
        );
        await tx.wait();
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Missing contract or signer object");
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
        {/* decrypt message */}

        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-4`}
          onClick={(e) => getCredential(e)}
        >
          Get Credential
        </button>
        <input
          type="text"
          name="passKey"
          id="key"
          className={`p-2 m-4 text-black border-2 border-black rounded`}
          value={decryptedPassword}
          readOnly={true}
        />
      </div>
    </div>
  );
}
