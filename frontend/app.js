const contractAddress = "0x61E0b08a5e7a13FA5A4481Ff0f52fd32aa2F56E3";
let contractABI;
let web3;
let votingContract;

async function loadABI() {
    try {
        const response = await fetch("../web3/build/contracts/Voting.json");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        contractABI = await response.json();
        console.log("ABI loaded:", contractABI);
    } catch (error) {
        console.error("Failed to load ABI:", error);
        alert("Could not load contract ABI. Check path.");
    }
}

async function connectMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            web3 = new Web3(window.ethereum);
            const networkId = await web3.eth.net.getId();
            console.log("Connected to network ID:", networkId);
            const accounts = await web3.eth.getAccounts();
            if (!accounts || accounts.length === 0) {
                throw new Error("No accounts found");
            }
            document.getElementById('account').innerText = `Connected Account: ${accounts[0]}`;
            if (!contractABI) {
                await loadABI();
            }
            if (!contractABI?.abi) {
                throw new Error("Invalid or missing ABI");
            }
            votingContract = new web3.eth.Contract(contractABI.abi, contractAddress);
            console.log("Contract instance:", votingContract);
            loadCandidates(votingContract, accounts[0]);
        } catch (err) {
            console.error("Failed to connect MetaMask:", err);
            alert("Failed to connect MetaMask. Check console.");
        }
    } else {
        console.error("MetaMask not detected!");
        alert("MetaMask not detected!");
    }
}

async function loadCandidates(contract, account) {
    try {
        const count = await contract.methods.candidatesCount().call();
        console.log("Candidates count:", count);
        const list = document.getElementById("candidates");
        list.innerHTML = "";
        for (let i = 1; i <= count; i++) {
            const candidate = await contract.methods.candidates(i).call();
            console.log(`Candidate ${i}:`, candidate);
            const li = document.createElement("li");
            li.innerText = `${candidate.name} (${candidate.voteCount} votes)`;
            const button = document.createElement("button");
            button.innerText = "Vote";
            button.onclick = () => vote(contract, account, i);
            li.appendChild(button);
            list.appendChild(li);
        }
    } catch (err) {
        console.error("Error loading candidates:", err);
        alert("Error loading candidates. Check console.");
    }
}

async function vote(contract, account, candidateId) {
    try {
        await contract.methods.vote(candidateId).send({ from: account });
        alert("Vote successfully cast!");
        loadCandidates(contract, account);
    } catch (err) {
        console.error("Error casting vote:", err);
        alert("Transaction failed or already voted.");
    }
}

async function addCandidate() {
    try {
        if (!votingContract || !web3) {
            throw new Error("MetaMask not connected or contract not initialized");
        }
        const candidateName = document.getElementById("candidateInput").value;
        if (!candidateName) {
            throw new Error("Candidate name cannot be empty");
        }
        const accounts = await web3.eth.getAccounts();
        if (!accounts || accounts.length === 0) {
            throw new Error("No accounts found");
        }
        await votingContract.methods.addCandidate(candidateName).send({ from: accounts[0] });
        alert("Candidate added successfully!");
        loadCandidates(votingContract, accounts[0]);
        document.getElementById("candidateInput").value = ""; // Clear input
    } catch (err) {
        console.error("Error adding candidate:", err);
        alert("Failed to add candidate. Check console.");
    }
}

// Load ABI on page load
window.onload = loadABI;