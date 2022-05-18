import Head from 'next/head';
import { useRouter } from 'next/router';
import useMetamask from '../components/useMetamask';
import useDecentraballot from '../components/useDecentraballot';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ContestChart } from '../components/ContestChart';

export default function ContestView() {
  const { isConnected, provider, signer, connectWallet, account } = useMetamask();
  const decentraballot = useDecentraballot(isConnected, provider, signer);

  const [selectedCandidate, setSelectedCandidate] = useState();
  const [canVote, setCanVote] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [newVoter, setNewVoter] = useState("");
  const [contestInfo, setContestInfo] = useState({
    identifier: "",
    candidates: [
      {
        name: "",
        voteCount: 0
      }
    ],
    description: "",
    address: "",
    contract: {}
  });

  const router = useRouter();
  const { id } = router.query;
  const contestABI = [
    {
      "inputs": [
        {
          "internalType": "bytes32[]",
          "name": "candidateNames",
          "type": "bytes32[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "candidates",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "name",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "voteCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "creator",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "voters",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "vote",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "weight",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "delegatedTo",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "hasVoted",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "voter",
          "type": "address"
        }
      ],
      "name": "giveRightToVote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCandidates",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "name",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "voteCount",
              "type": "uint256"
            }
          ],
          "internalType": "struct Contest.Candidate[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "delegateAddress",
          "type": "address"
        }
      ],
      "name": "delegate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "candidateID",
          "type": "uint256"
        }
      ],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "winnerID",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "candidateID",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "winnerName",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "candidateName",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]

  const getContestData = async () => {
    if (!id || !decentraballot || !signer) {
      return;
    }

    let identifier;
    let address;

    try {
      identifier = ethers.utils.formatBytes32String(id);
      address = await decentraballot.getContestAddress(identifier);
    } catch (e) {
      console.log(e);
      if (e.error.data.message.includes("Contest with given identifier does not exist")) router.push('/');
      return;
    }

    let contest = new ethers.Contract(address, contestABI, signer);
    let candidates;
    let description;

    try {
      candidates = await contest.getCandidates();
      description = await decentraballot.getContestDescription(identifier);
    } catch (e) {
      console.log(e);
      router.push("/");
    }

    setContestInfo({
      identifier: id,
      candidates: candidates.map(candidate => ({ name: ethers.utils.parseBytes32String(candidate.name), voteCount: candidate.voteCount.toNumber() })),
      description,
      address,
      contract: contest
    });
  }

  useEffect(() => {
    getContestData();
  }, [id, decentraballot, signer]);

  const checkVoterStatus = async () => {
    if (!contestInfo || !contestInfo.contract.voters || !account) {
      return;
    }

    if (!account) {
      setCanVote(false);
      return;
    }

    let voter;
    try {
      voter = await contestInfo.contract.voters(account);
    } catch (e) {
      console.log(e);
      return;
    }

    if (voter.hasVoted) {
      setCanVote(false);
      return;
    }

    setCanVote(true);
  }

  useEffect(() => {
    checkVoterStatus();
  }, [account, contestInfo]);

  const checkIfOwner = async () => {
    if (!contestInfo || !contestInfo.contract.creator || !account) {
      return;
    }

    const creator = await contestInfo.contract.creator();

    if (creator.toUpperCase() == account.toUpperCase()) {
      setIsOwner(true);
      return
    }

    setIsOwner(false);
  }

  useEffect(() => {
    checkIfOwner();
  }, [contestInfo, account])

  const castVote = async () => {
    if (!selectedCandidate && selectedCandidate != 0) {
      alert("Please select a candidate first");
      return;
    }

    try {
      await contestInfo.contract.vote(selectedCandidate);
      setCanVote(false);
      router.reload();
    } catch (e) {
      console.log(e);
      alert("Whoops! Something went wrong while trying to cast your vote. Please try again later.");
    }
  }

  const authorizeVoter = async () => {
    try {
      await contestInfo.contract.giveRightToVote(newVoter);
    } catch (e) {
      console.log(e);
      alert("Unable to authorize this address. The address may already be authorized.");
    }
  }

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <title>Decentraballot</title>
      </Head>
      <div className="leading-normal tracking-normal text-indigo-400 m-6 bg-cover bg-fixed h-full">
        <div className="w-full container mx-auto">
          <div className="w-full flex items-center justify-between">
            <a className="flex items-center text-indigo-400 no-underline hover:no-underline font-bold text-2xl lg:text-4xl hover:opacity-75 hover:scale-105 duration-150" href="/">
              Decentra<span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-pink-500 to-purple-500">ballot</span>
            </a>
            {!isConnected ? <button type="button" onClick={connectWallet} className="text-white bg-blue-700 duration-150 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">CONNECT WALLET</button>
              : <div className="text-white cursor-default bg-green-700 duration-150 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600">WALLET CONNECTED!</div>}
          </div>
        </div>

        <div className="container pt-24 md:pt-36 mx-auto flex flex-wrap flex-col md:flex-row items-center justify-between">
          <div className="flex flex-col w-full xl:w-2/5 justify-center lg:items-start overflow-y-hidden">
            <h1 className="my-4 text-3xl md:text-5xl text-white opacity-75 font-bold leading-tight text-center md:text-left">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-pink-500 to-purple-500">
                {contestInfo.identifier}
              </span>
            </h1>
            <p className="leading-normal text-base md:text-2xl mb-8 text-center md:text-left">
              {contestInfo.description}
            </p>

            <div className="bg-gray-900 opacity-75 w-full shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
              <span className="block text-blue-300 py-2 font-bold mb-2">
                Contest results:
              </span>
              <ContestChart candidates={contestInfo.candidates} contestName={contestInfo.identifier} />
            </div>
          </div>
          <div className="flex flex-col w-full xl:w-2/5 justify-center lg:items-start max-h-fit">
            <div className="bg-gray-900 opacity-75 w-full shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
              {canVote ? <span className="block text-blue-300 py-2 font-bold mb-2">
                Cast your vote!
              </span> : <span className="block text-blue-300 py-2 font-bold mb-2">You are not currently permitted to vote</span> }
              <div className='overflow-y-auto h-96 overflow-x-hidden mb-6'>
                {contestInfo.candidates.map((candidate, index) => {
                  return (
                    <div className='h-fit min-w-full text-5xl text-white my-4 p-4 bg-black rounded-lg cursor-pointer duration-100 hover:opacity-50' key={index} onClick={() => setSelectedCandidate(index)}>
                      {selectedCandidate === index ? <>&#10004;</> : null}{candidate.name}
                    </div>
                  )
                })}
              </div>
              <div>
                {canVote ? <button onClick={castVote} className="bg-gradient-to-r from-purple-800 to-green-500 hover:from-pink-500 hover:to-green-500 text-white font-bold py-2 px-4 rounded focus:ring transform transition hover:scale-105 duration-300 ease-in-out">
                  Cast Vote
                </button> : null}
              </div>
            </div>
            { isOwner ? <div className="bg-gray-900 opacity-75 w-full shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
              <span className="block text-blue-300 py-2 font-bold mb-2">
                Add authorized voting addresses:
              </span>
              <input
                className="shadow appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition duration-300 ease-in-out mb-6"
                id="new-voter"
                type="text"
                placeholder="Ethereum address goes here..."
                maxLength="42"
                value={newVoter}
                onChange={(e) => setNewVoter(e.target.value)}
              />
              <div>
                {newVoter.length == 42 ? <button onClick={authorizeVoter} className="bg-gradient-to-r from-purple-800 to-green-500 hover:from-pink-500 hover:to-green-500 text-white font-bold py-2 px-4 rounded focus:ring transform transition hover:scale-105 duration-300 ease-in-out">
                  Add Voter
                </button> : "Please input a valid ethereum address"}
              </div>
            </div> : null }
          </div>
        </div>

        <div className="w-full pt-16 pb-6 text-sm text-center fade-in">
          <a className="text-gray-500 no-underline hover:no-underline" href="#">Zaid Allam - 2022</a>
        </div>
      </div>
    </>
  )
}