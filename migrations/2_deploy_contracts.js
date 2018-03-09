var PrivateSale = artifacts.require("./PrivateSale.sol");
var Token = artifacts.require("./SimpleToken.sol");


module.exports = function(deployer, network, accounts) {
    if (network == "develop" || network == "development") {
        deployer.then(() => {
            return deployer.deploy(Token, {gas: 3000000});
        }).then((result) => {
            return Token.deployed();
        }).then((instance) => {
            deployer.deploy(PrivateSale, instance.address, {gas: 3000000});
        });
    } else if (network == "rinkeby") {
        let token;
        deployer.then(() => {
            return deployer.deploy(Token, {gas: 3000000});
        }).then((result) => {
            return Token.deployed();
        }).then((instance) => {
            token = instance;
            return deployer.deploy(PrivateSale, instance.address, {gas: 3000000});
        }).then((result) => {
            return PrivateSale.deployed();
        }).then((sale) => {
            return token.mint(sale.address, web3.toWei(10000, "ether"));
        });
    } else if (network == "mainnet") {
        deployer.deploy(PrivateSale, "0x0", {gas: 1100000});
    }
};
