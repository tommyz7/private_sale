var PrivateSale = artifacts.require("./PrivateSale.sol");
var Token = artifacts.require("./SimpleToken.sol");


contract('PrivateSale', function(accounts) {
    let privateSale, token;
    let newsale, newtoken;

    before('new token', async () => {
        token = await Token.new();
        privateSale = await PrivateSale.new(token.address, {from: accounts[8]});
        await token.mint(privateSale.address, web3.toWei(1000, "ether"));
        
        newtoken = await Token.new();
        newsale = await PrivateSale.new(newtoken.address, {from: accounts[8]});
        await newtoken.mint(newsale.address, web3.toWei(1000, "ether"));
    });

    describe('Setup', function(){
        it('should have token', async () => {
            var bal = await token.balanceOf.call(privateSale.address);
            assert.equal(bal.toNumber(), web3.toWei(1000, "ether"), "PrivateSale contract token balance incorrect");
        });

        it('should have rate', async () => {
            var rate = await privateSale.rate.call();
            assert.equal(rate.toNumber(), 1000, "Rate incorrect");
        });
    });

    describe('Purchase', function(){
        it('should sell token anyone', async () => {
            var ownerWallet = await newsale.owner.call();
            var ownerWalletBal = await web3.eth.getBalance(ownerWallet);
            var acc2Bal = await newtoken.balanceOf.call(accounts[9]);

            var tx = await web3.eth.sendTransaction({
                from: accounts[9],
                to: newsale.address,
                value: web3.toWei(0.6, "ether"),
                gas: 150000,
            });

            var acc2Bal2 = await newtoken.balanceOf.call(accounts[9]);
            
            assert.equal(
                acc2Bal2.toNumber(),
                acc2Bal.add(web3.toWei(600, "ether")).toNumber(),
                "accounts[2] token balance incorrect");

            var ownerWalletBal2 = await web3.eth.getBalance(ownerWallet);

            assert.equal(
                ownerWalletBal2.toNumber(),
                ownerWalletBal.add(web3.toWei(0.6, "ether")).toNumber(),
                "PrivateSale contract owner balance incorrect"
                );
        });

        it('should return oversell to sender', async () => {
            var ownerWallet = await newsale.owner.call();
            var ownerWalletBal = await web3.eth.getBalance(ownerWallet);
            var acc2Bal = await newtoken.balanceOf.call(accounts[2]);

            var tx = await web3.eth.sendTransaction({
                from: accounts[2],
                to: newsale.address,
                value: web3.toWei(0.5, "ether"),
                gas: 150000,
            });

            var acc2Bal2 = await newtoken.balanceOf.call(accounts[2]);
            assert.equal(
                acc2Bal2.toNumber(),
                acc2Bal.add(web3.toWei(400, "ether")).toNumber(),
                "accounts[2] token balance incorrect");

            var ownerWalletBal2 = await web3.eth.getBalance(ownerWallet);

            assert.equal(
                ownerWalletBal2.toNumber(),
                ownerWalletBal.add(web3.toWei(0.4, "ether")).toNumber(),
                "PrivateSale contract owner balance incorrect"
                );
        });
    });

    describe('Transfer Token', function(){
        before('freash pre ICO', async () => {
            newtoken = await Token.new({from: accounts[0]});
            newsale = await PrivateSale.new(newtoken.address, {from: accounts[8]});
            var tx = await newtoken.mint(newsale.address, web3.toWei(1000, "ether"), {from: accounts[0]});
        });

        it('should transfer token to accounts[5]', async () => {
            var bal = await newtoken.balanceOf.call(newsale.address);
            assert.equal(bal.toNumber(), web3.toWei(1000, "ether"), "PrivateSale contract balance incorrect.");
            var bal2 = await newtoken.balanceOf.call(accounts[5]);
            assert.equal(bal2.toNumber(), 0, "Accounts[5] balance incorrect.");

            await newsale.transferToken(accounts[5], bal, {from: accounts[8]});
            var bal2 = await newtoken.balanceOf.call(accounts[5]);
            assert.equal(bal.toNumber(), bal2.toNumber(), "Transfer failed.");
        });
    });
});
