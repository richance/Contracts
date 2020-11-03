// imports
const { expect } = require("chai");
const { waffle } = require("hardhat");
const { deployContract, solidity  } = waffle;
const provider = waffle.provider;
const {BigNumber} = require('@ethersproject/bignumber');

const zeroaddress = "0x0000000000000000000000000000000000000000";
const deployer = "0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5";

const errorDelta = 1e-4;

function calcRelativeDiff(expected, actual) {
  const diff = BigNumber.from(expected).sub(actual).toNumber();
  return Math.abs(diff / expected);
}

// test suite for the Dist Pool Constructor
describe("Distpool Constructor", function() {
	
  // variable to store the deployed smart contract	
  let weth;	
  let weth_rewards;
  let distpool;
  let owner, addr1, addr2, addr3, addr4;
	
  // initial deployment of Dist Pool
  before(async function() {
	[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners(); 
	
	// weth 
	const Weth = await ethers.getContractFactory("WETH9");
    weth = await Weth.deploy();
	await weth.deployed();
	
	// tok
	const Tok = await ethers.getContractFactory("WETH9");
    weth_rewards = await Tok.deploy();
	await weth_rewards.deployed();

	// dist pool
	const DistPool = await ethers.getContractFactory("StakingRewards");
    distpool = await DistPool.deploy(deployer, deployer, weth_rewards.address, weth.address);
	await distpool.deployed();
	
  })		

 
  it("Should return the right total supply", async function() {
    expect(await distpool.totalSupply()).to.equal("0");
  });

  it("Should return the right reward per token", async function() {
    expect(await distpool.rewardPerToken()).to.equal(0);
  });

  it("Should return the right finish period", async function() {
    expect(await distpool.periodFinish()).to.equal(0);
  });
 
  it("Should return the right rewardRate ", async function() {
    expect(await distpool.rewardRate()).to.equal(0);
  });

  it("Should return the right rewardsDuration", async function() {
    expect(await distpool.rewardsDuration()).to.equal(60*60*24*7);
	
  });  
});

// test suite for the Dist Pool Notify
describe("Distpool Notify", function() {
	
  // variable to store the deployed smart contract	
  let weth;	
  let weth_rewards;
  let distpool;
  let owner, addr1, addr2, addr3, addr4;
	
  // initial deployment of Dist Pool
  before(async function() {
	[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners(); 
	
	// weth 
	const Weth = await ethers.getContractFactory("WETH9");
    weth = await Weth.deploy();
	await weth.deployed();
	
	// tok
	const Tok = await ethers.getContractFactory("WETH9");
    weth_rewards = await Tok.deploy();
	await weth_rewards.deployed();

	// dist pool
	const DistPool = await ethers.getContractFactory("StakingRewards");
    distpool = await DistPool.deploy(owner.address, owner.address, weth_rewards.address, weth.address);
	await distpool.deployed();
	
  })		

 
  it("Should setRewardsDuration", async function() {
    await distpool.setRewardsDuration(60*60*24*10);
  });

  it("Should call notify rewards", async function() {
	  
    const trans_obj = {
        to: weth_rewards.address,
        gasLimit: 4000000,
		gasPrice: 4000000,
        value: 10000000000}
	
    // can call this without balance!!!
	await owner.sendTransaction(trans_obj);
	await weth_rewards.approve(distpool.address, "10000000000");
	await weth_rewards.transfer(distpool.address, "10000000000");
	
    await distpool.notifyRewardAmount("10000000000");
	
  });

  it("Should let useres stake", async function() {
	  	  
    const trans_obj = {
        to: weth.address,
        gasLimit: 4000000,
		gasPrice: 4000000,
        value: 5000000000}

    // get weth for addr1, approve and stake
	
	let balance_addr1 = await provider.getBalance(addr1.address);
	
    await addr1.sendTransaction(trans_obj);
	
	balance_addr1 = await provider.getBalance(addr1.address);
	
    await weth.connect(addr1).approve(distpool.address, "10000000000");	
    await distpool.connect(addr1).stake("5000000000");
	
    // get weth for addr1, approve and stake
    await addr2.sendTransaction(trans_obj);
    await weth.connect(addr2).approve(distpool.address, "10000000000");	
    await distpool.connect(addr2).stake("5000000000");
	
	// check the staking
	expect(await distpool.totalSupply()).to.equal("10000000000");
	expect(await distpool.balanceOf(addr1.address)).to.equal("5000000000");
	expect(await distpool.balanceOf(addr2.address)).to.equal("5000000000");
	

	expect(await weth.balanceOf(distpool.address)).to.equal("10000000000");
	expect(await weth.balanceOf(addr1.address)).to.equal("0");
	expect(await weth.balanceOf(addr2.address)).to.equal("0");	
  });

  it("Should let useres stake 2", async function() {


    //let bn = provider.send("eth_getBlockByNumber")

	
	//increase time by one day
    await provider.send("evm_increaseTime", [60*60*24*1])  
	await provider.send("evm_mine")  

    await expect(distpool.connect(addr1).getReward()).to.emit(distpool, "RewardPaid"); //.withArgs(addr1.address,2);
	
	let bal_addr1 = await weth_rewards.balanceOf(addr1.address);
	let bal_addr2 = await weth_rewards.balanceOf(addr1.address);
	
	const diff1 = calcRelativeDiff(10000000000/10/2, bal_addr1);
    expect(diff1).to.be.lt(errorDelta);
	
	const diff2 = calcRelativeDiff(10000000000/10/2, bal_addr2);
    expect(diff2).to.be.lt(errorDelta);
	
  });

  it("Should let useres stake 3", async function() {

    const trans_obj = {
        to: weth_rewards.address,
        gasLimit: 4000000,
		gasPrice: 4000000,
        value: 10000000000}
    // can call this without balance!!!
	await owner.sendTransaction(trans_obj);
	await weth_rewards.approve(distpool.address, "10000000000");
	await weth_rewards.transfer(distpool.address, "10000000000");
	
    await distpool.notifyRewardAmount("10000000000");
	
	//increase time by one day
    await provider.send("evm_increaseTime", [60*60*24*30]); //go after the end of the rewards period
	await provider.send("evm_mine")  

    await expect(distpool.connect(addr1).getReward()).to.emit(distpool, "RewardPaid");
    await expect(distpool.connect(addr2).getReward()).to.emit(distpool, "RewardPaid");

	let bal_addr1 = await weth_rewards.balanceOf(addr1.address);
	let bal_addr2 = await weth_rewards.balanceOf(addr1.address);
	
	const diff1 = calcRelativeDiff(20000000000/2, bal_addr1);
    expect(diff1).to.be.lt(errorDelta);
	
	const diff2 = calcRelativeDiff(20000000000/2, bal_addr2);
    expect(diff2).to.be.lt(errorDelta);
  });

});
