import Head from 'next/head';
import { useState } from 'react';
import { ethers } from 'ethers';
import useMetamask from '../components/useMetamask';
import useDecentraballot from '../components/useDecentraballot';
import { useRouter } from 'next/router';

export default function Home() {
    const { isConnected, provider, signer, connectWallet } = useMetamask();
    const decentraballot = useDecentraballot(isConnected, provider, signer);
    const router = useRouter();

    const [newContest, setNewContest] = useState({
        id: "",
        candidates: [],
        description: ""
    });
    const [existingContestId, setExistingContestId] = useState("");

    const createContest = async (e) => {
        e.preventDefault();

        try {
            await decentraballot.createContest(ethers.utils.formatBytes32String(newContest.id), newContest.description, newContest.candidates.map(x => ethers.utils.formatBytes32String(x)));
            router.push(`/${newContest.id}`)
        } catch (e) {
            console.log(e);
            alert("Whoops! Something went wrong...")
        }
    }

    const lookupContest = async (e) => {
        e.preventDefault();

        try {
            await decentraballot.getContestAddress(ethers.utils.formatBytes32String(existingContestId));
            router.push(`/${existingContestId}`);
        } catch (e) {
            console.log(e);
            alert("Contest with your chosen identifier does not exist");
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
                        <a className="flex items-center text-indigo-400 no-underline hover:no-underline font-bold text-2xl lg:text-4xl hover:opacity-75 hover:scale-105 duration-150" href="#">
                            Decentra<span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-pink-500 to-purple-500">ballot</span>
                        </a>
                        {!isConnected ? <button type="button" onClick={connectWallet} className="text-white bg-blue-700 duration-150 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">CONNECT WALLET</button>
                            : <div className="text-white cursor-default bg-green-700 duration-150 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600">WALLET CONNECTED!</div>}
                    </div>
                </div>

                <div className="container pt-24 md:pt-36 mx-auto flex flex-wrap flex-col md:flex-row items-center justify-between">
                    <div className="flex flex-col w-full xl:w-2/5 justify-center lg:items-start overflow-y-hidden">
                        <h1 className="my-4 text-3xl md:text-5xl text-white opacity-75 font-bold leading-tight text-center md:text-left">
                            A Ballot&nbsp;
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-pink-500 to-purple-500">
                                You Can Trust
                            </span>
                        </h1>
                        <p className="leading-normal text-base md:text-2xl mb-8 text-center md:text-left">
                            Decentraballot runs on the blockchain, which makes dishonesty impossible.
                        </p>

                        <form className="bg-gray-900 opacity-75 w-full shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4" onSubmit={lookupContest}>
                            <div className="mb-4">
                                <label className="block text-blue-300 py-2 font-bold mb-2" htmlFor="emailaddress">
                                    Find an existing contest...
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition duration-300 ease-in-out"
                                    id="emailaddress"
                                    type="text"
                                    placeholder="Unique Identifier Goes Here"
                                    onChange={(e) => {
                                        const id = e.target.value.replaceAll(/[^\x00-\x7F]/g, "");
                                        e.target.value = id;
                                        setExistingContestId(id);
                                    }}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <button
                                    className="bg-gradient-to-r from-purple-800 to-green-500 hover:from-pink-500 hover:to-green-500 text-white font-bold py-2 px-4 rounded focus:ring transform transition hover:scale-105 duration-300 ease-in-out"
                                    type="submit"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="flex flex-col w-full xl:w-2/5 justify-center lg:items-start overflow-y-hidden">
                        <form className="bg-gray-900 opacity-75 w-full shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4" onSubmit={createContest}>
                            <div className="mb-4">
                                <label className="block text-blue-300 py-2 font-bold mb-2">
                                    ...or create your own!
                                </label>
                                <label className="block text-white font-bold mb-1 mt-3" htmlFor="emailaddress">
                                    Choose a Unique ID
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition duration-300 ease-in-out"
                                    id="emailaddress"
                                    type="text"
                                    placeholder="Unique Identifier Goes Here"
                                    onChange={(e) => {
                                        const id = e.target.value.replaceAll(/[^\x00-\x7F]/g, "");
                                        e.target.value = id;
                                        setNewContest({
                                            ...newContest,
                                            id: id
                                        })
                                    }}
                                    maxLength="32"
                                />
                                <label className="block text-white font-bold mb-1 mt-3" htmlFor="candidates">
                                    Choose Your Candidates (one per line)
                                </label>
                                <textarea
                                    className="shadow h-40 appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition duration-300 ease-in-out"
                                    id="candidates"
                                    type="text"
                                    placeholder="Candidates Go Here"
                                    onChange={(e) => {
                                        const candidates = e.target.value.replaceAll(/[^\x00-\x7F]/g, "");
                                        e.target.value = candidates;
                                        let array = candidates.split('\n');
                                        if (array.length > 32) e.target.value = array.slice(0, -1).join("\n");
                                        setNewContest({
                                            ...newContest,
                                            candidates: array
                                        })
                                    }}
                                />
                                <label className="block text-white font-bold mb-1 mt-3" htmlFor="description">
                                    Describe Your Contest
                                </label>
                                <textarea
                                    className="shadow appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition duration-300 ease-in-out"
                                    id="description"
                                    type="textarea"
                                    placeholder="Description Goes Here"
                                    onChange={(e) => {
                                        const description = e.target.value.replaceAll(/[^\x00-\x7F]/g, "");
                                        e.target.value = description;
                                        setNewContest({
                                            ...newContest,
                                            description: description
                                        })
                                    }}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <button
                                    className="bg-gradient-to-r from-purple-800 to-green-500 hover:from-pink-500 hover:to-green-500 text-white font-bold py-2 px-4 rounded focus:ring transform transition hover:scale-105 duration-300 ease-in-out"
                                    type="submit"
                                >
                                    Let's Get Voting
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="w-full pt-16 pb-6 text-sm text-center fade-in">
                    <a className="text-gray-500 no-underline hover:no-underline" href="#">Zaid Allam - 2022</a>
                </div>
            </div>
        </>
    )
}