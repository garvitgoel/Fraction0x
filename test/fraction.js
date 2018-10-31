const fraction0x = artifacts.require('fraction0x.sol');

const Crowdsale = artifacts.require('Crowdsale.sol');

var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var tokenhold;
var crowdhold;
contract('Solar91', async (accounts) => {

  it('Should correctly initialize constructor values of Token Contract', async () => {

    this.tokenhold = await fraction0x.new(accounts[0]);
    //console.log(this.tokenhold);
    let total = await this.tokenhold.totalReleased.call();
    //let owner = await this.tokenhold.owner.call();
    //assert.equal(owner, accounts[0]);
    assert.equal(total, 0);

  });

  it("Should Deploy Crowdsale only", async () => {

    this.crowdhold = await Crowdsale.new(accounts[0], accounts[1], this.tokenhold.address, 20000);

  });

  it("Should Activate Sale contract", async () => {

    var Activate = await this.tokenhold.activateSaleContract(this.crowdhold.address);
  });

  it("Should check balance of Crowdsale after, crowdsale activate from token contract", async () => {
    let balancOfCrowdsale = 1000000000000000000000000000;
    var balance = await this.tokenhold.balanceOf.call(this.crowdhold.address);
    assert.equal(balance.toNumber(), balancOfCrowdsale);
  });

  it("Should Authorize KYC first", async () => {

    var whiteListAddress = await this.crowdhold.whitelistedContributors.call(accounts[2]);
    assert.equal(whiteListAddress, false, 'not white listed');
    var authorizeKYC = await this.crowdhold.authorizeKyc([accounts[2]], { from: accounts[0] });
    var whiteListAddressNow = await this.crowdhold.whitelistedContributors.call(accounts[2]);
    assert.equal(whiteListAddressNow, true, ' now white listed');

  });

  it("Should Start CrowdSale ", async () => {

    var crowdsaleStart = await this.crowdhold.startCrowdSale({ from: accounts[0] });
    var status = await this.crowdhold.crowdsalestarted.call();
    assert.equal(status, true, ' crwod sale started');

  });

  it("Should be able to buy Tokens  ", async () => {


    var whiteListAddressNow1 = await this.crowdhold.whitelistedContributors.call(accounts[2]);
    //console.log(whiteListAddressNow1);

    let Contract_bal_before = await web3.eth.getBalance(this.crowdhold.address);
    let fundWalletBefore = await web3.eth.getBalance(accounts[1]);
    let AccountBalance_oneBefore = await web3.eth.getBalance(accounts[2]);

    //console.log(Contract_bal_before.toNumber(),'contract balance before');
    //console.log(fundWalletBefore.toNumber(),'fund wallet before buy');
    //console.log(AccountBalance_oneBefore.toNumber(),'one before buy');

    var buy_Tokens = await this.crowdhold.buyTokens(accounts[2], { from: accounts[2], value: web3.toWei("1", "ether") });

    var tokens = 8000000000000000000000;

    var balance_after = await this.tokenhold.balanceOf.call(accounts[2]);

    let Contract_bal_After = await web3.eth.getBalance(this.crowdhold.address);
    let fundWalletAfter = await web3.eth.getBalance(accounts[1]);
    let AccountBalance_oneAfter = await web3.eth.getBalance(accounts[2]);

    //console.log(Contract_bal_After.toNumber(),'contract balance After');
    //console.log(fundWalletAfter.toNumber(),'fund wallet After buy');
    //console.log(AccountBalance_oneAfter.toNumber(),'one After buy');

    assert.equal(balance_after.toNumber(), tokens, 'Token ammount');

  });

  it("Should not be able to transfer tokens before getting approved by owner  ", async () => {

    try {
      var beforetrans = await this.tokenhold.balanceOf.call(accounts[2]);
      var balanceOfBeneficiary3 = await this.tokenhold.balanceOf.call(accounts[3]);
      var trans = await this.tokenhold.transfer(accounts[6], 100);
      var aftertrans = await this.tokenhold.balanceOf.call(accounts[2]);
      //console.log(beforetrans.toNumber(),'acc2 bal before');
      //console.log(balanceOfBeneficiary3.toNumber(),'acc 3 before');
      //console.log(aftertrans.toNumber(),'acc2 after transfer');
    } catch (error) {
      var error_ = 'VM Exception while processing transaction: revert';
      assert.equal(error.message, error_, 'Token ammount');
    }

  });

  it("Owner should Approve address to transfer any no of tokens to beneficiary ", async () => {

    let notAllowdToTransfer = await this.tokenhold.approveByOwner.call(accounts[2], accounts[3]);

    assert.equal(notAllowdToTransfer, false, "allowance is wrong");
    this.tokenhold.approveTransfer(accounts[2], accounts[3]);

    let allowdToTransfer = await this.tokenhold.approveByOwner.call(accounts[2], accounts[3]);
    assert.equal(allowdToTransfer, true, "allowance is wrong");

  });

  it("Should able to transfer tokens after getting approved by owner  ", async () => {

    let allowdToTransfer1 = await this.tokenhold.approveByOwner.call(accounts[2], accounts[3]);
    assert.equal(allowdToTransfer1, true, "allowance is wrong");

    var beforetrans1 = await this.tokenhold.balanceOf.call(accounts[2]);
    var balanceOfBeneficiary4 = await this.tokenhold.balanceOf.call(accounts[3]);
    var trans1 = await this.tokenhold.transfer(accounts[3],1000000000000000000000,{from:accounts[2]});
    var aftertrans2 = await this.tokenhold.balanceOf.call(accounts[2]);
    var aftertrans3 = await this.tokenhold.balanceOf.call(accounts[3]);
    console.log(beforetrans1.toNumber(), 'acc2 bal before');
    console.log(balanceOfBeneficiary4.toNumber(), 'acc 3 before');
    console.log(aftertrans2.toNumber(), 'acc2 after transfer');
    console.log(aftertrans3.toNumber(), 'acc3 after transfer');

  });

  it("Owner should disApprove address to transfer any no of tokens to beneficiary ", async () => {

    let notAllowdToTransfer = await this.tokenhold.approveByOwner.call(accounts[2], accounts[3]);
    assert.equal(notAllowdToTransfer, true, "allowance is wrong");
    this.tokenhold.disApproveTransfer(accounts[2], accounts[3]);
    let allowdToTransfer = await this.tokenhold.approveByOwner.call(accounts[2], accounts[3]);
    assert.equal(allowdToTransfer, false, "allowance is wrong");

  });

  it("Should be able to transfer ownership of Crowdsale Contract ", async () => {

    let ownerOld1 = await this.crowdhold.owner.call();
    let newowner1 = await this.crowdhold.transferOwnership(accounts[4], { from: accounts[0] });
    let ownerNew1 = await this.crowdhold.owner.call();
    assert.equal(ownerNew1, accounts[4], 'Transfered ownership');

  });



})