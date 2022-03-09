
const getWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      window.alert('Non-Ethereum browser detected. Please install MetaMask!');
    }
    return window.web3;
}
  
const getContract = async (web3, path) => {
    const data = await $.getJSON(path); //"./contracts/AutomaticInvoice.json"

    const netId = await web3.eth.net.getId();
    const deployedNetwork = data.networks[netId];
    const abi = data.abi;
    const address = deployedNetwork.address;

    const contract = new web3.eth.Contract(abi, address);

    return contract;
};