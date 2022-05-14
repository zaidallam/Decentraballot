const Decentraballot = artifacts.require('Decentraballot');
const assert = require('assert');

contract('Decentraballot', () => {
    let ballot = null;
    before(async () => {
        ballot = await Decentraballot.deployed();
    });

    const toBytes32 = (value) => web3.utils.padLeft(web3.utils.asciiToHex(value), 32);

    it('Should create a Contest', async () => {
        try {
            await ballot.createContest(toBytes32("testContest1"), "This is a new contest", [toBytes32("Jimmy"), toBytes32("Samantha"), toBytes32("Theodore"), toBytes32("Katherine")]);
            let contest = await ballot.contests(toBytes32("testContest1"));

            assert(contest != null);
        } catch {
            assert(false);
        }
    });

    it('Should fail to create duplicate Contest', async () => {
        try {
            await ballot.createContest(toBytes32("testContest2"), "This is a new contest", [toBytes32("Jimmy"), toBytes32("Samantha"), toBytes32("Theodore"), toBytes32("Katherine")]);
            await ballot.createContest(toBytes32("testContest2"), "This is a new contest", [toBytes32("Jimmy"), toBytes32("Samantha"), toBytes32("Theodore"), toBytes32("Katherine")]);

            assert(false);
        } catch (e) {
            assert(e.message.includes("Contest with given identifier already exists"));
        }
    });

    it('Should retreive a contact address', async () => {
        try {
            await ballot.createContest(toBytes32("testContest3"), "This is a new contest", [toBytes32("Jimmy"), toBytes32("Samantha"), toBytes32("Theodore"), toBytes32("Katherine")]);
            let contest = await ballot.contests(toBytes32("testContest3"));
            let address = await ballot.getContestAddress(toBytes32("testContest3"));

            assert(address == contest.contractAddress);
        } catch {
            assert(false);
        }
    });

    it('Should fail to retreive a contact address', async () => {
        try {
            await ballot.getContestAddress(toBytes32("testContest4"));

            assert(false);
        } catch (e) {
            assert(e.message.includes("Contest with given identifier does not exist"));
        }
    });

    it('Should retreive a contact description', async () => {
        try {
            await ballot.createContest(toBytes32("testContest4"), "This is a new contest", [toBytes32("Jimmy"), toBytes32("Samantha"), toBytes32("Theodore"), toBytes32("Katherine")]);
            let contest = await ballot.contests(toBytes32("testContest4"));
            let description = await ballot.getContestDescription(toBytes32("testContest4"));

            assert(description == contest.description);
        } catch {
            assert(false);
        }
    });

    it('Should fail to retreive a contact description', async () => {
        try {
            await ballot.getContestDescription(toBytes32("testContest5"));

            assert(false);
        } catch (e) {
            assert(e.message.includes("Contest with given identifier does not exist"));
        }
    });
})