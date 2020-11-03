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
describe("Founder Pool Constructor", function() {
	
  // variable to store the deployed smart contract	
  let weth;	
  let founderpool;
  let owner, addr1, addr2, addr3, addr4;
	
  // initial deployment of Dist Pool
  before(async function() {
	[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners(); 
	
	// weth 
	const Weth = await ethers.getContractFactory("WETH9");
    weth = await Weth.deploy();
	await weth.deployed();
	
	// founder pool
	const FounderPool  = await ethers.getContractFactory("FounderPool");
    founderpool = await FounderPool .deploy(weth.address, addr1.address);
	await founderpool.deployed();
	
  })		

 
  it("Should return the right blocklock", async function() {
    expect(await founderpool.blocklock()).to.equal("0");
  });

  it("Should return the right reward per token", async function() {
    expect(await founderpool.Token()).to.equal(weth.address);
  });

  it("Should return the right bucket", async function() {
    expect(await founderpool.bucket()).to.equal(addr1.address);
  });
 
  it("Should return the right balmin", async function() {
    expect(await founderpool.balmin()).to.equal(0);
  }); 
});

// test suite for the Founder Pool
describe("Founder Pool Tap", function() {
	
  // variable to store the deployed smart contract	
  let weth;	
  let founderpool;
  let owner, addr1, addr2, addr3, addr4;
	
  // initial deployment of Dist Pool
  before(async function() {
	[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners(); 
	
	// weth 
	const Weth = await ethers.getContractFactory("WETH9");
    weth = await Weth.deploy();
	await weth.deployed();
	
	// founder pool
	const FounderPool  = await ethers.getContractFactory("FounderPool");
    founderpool = await FounderPool .deploy(weth.address, addr1.address);
	await founderpool.deployed();
	
  })		

 
  it("Should tap", async function() {
    await founderpool.tap();
  });

  it("Should not tap", async function() {
    await expect(founderpool.tap()).to.be.reverted;
	expect(await founderpool.balmin()).to.equal(0);
  });

});

// test suite for the Founder Pool
describe("Founder Pool Tap with value", function() {
	
  // variable to store the deployed smart contract	
  let weth;	
  let founderpool;
  let owner, addr1, addr2, addr3, addr4;
  let tokenscontract;
  let accruedholder;
	
  // initial deployment of Dist Pool
  before(async function() {
	[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners(); 
	
	// weth 
	const Weth = await ethers.getContractFactory("WETH9");
    weth = await Weth.deploy();
	await weth.deployed();
	
	// founder pool
	const FounderPool  = await ethers.getContractFactory("FounderPool");
    founderpool = await FounderPool .deploy(weth.address, addr1.address);
	await founderpool.deployed();
	
  })		

 
  it("Should tap", async function() {
	  
    const trans_obj = {
        to: weth.address,
        gasLimit: 4000000,
		gasPrice: 4000000,
        value: 10000000000000}
	
	await owner.sendTransaction(trans_obj);
	await weth.approve(founderpool.address, "10000000000000");
	await weth.transfer(founderpool.address, "10000000000000");	
    tokenscontract = await weth.balanceOf(founderpool.address);
	  
    await founderpool.tap();

	
  });

  it("Should have the right values", async function() {	    
    expect(await founderpool.balmin()).to.equal(tokenscontract.div(24));
	expect(await weth.balanceOf(addr1.address)).to.equal(tokenscontract.div(24));
  });

  it("Should not tap", async function() {	    
    await expect(founderpool.tap()).to.be.reverted;
  });

  it("Should tap after time increase", async function() {	    
	//increase time by 15 days
    await provider.send("evm_increaseTime", [60*60*24*15]);
	await provider.send("evm_mine");

    accruedholder = await weth.balanceOf(addr1.address);
	await founderpool.tap();

  });

  it("Should have the right values", async function() {	    
    expect(await founderpool.balmin()).to.equal(tokenscontract.div(24));
	expect(await weth.balanceOf(addr1.address)).to.equal(accruedholder.add(tokenscontract.div(24)));
  });

  it("Increase pool and tap", async function() {
	  
    const trans_obj = {
        to: weth.address,
        gasLimit: 4000000,
		gasPrice: 4000000,
        value: 10000000000000}
	
	await owner.sendTransaction(trans_obj);
	await weth.approve(founderpool.address, "10000000000000");
	await weth.transfer(founderpool.address, "10000000000000");	
    tokenscontract = await weth.balanceOf(founderpool.address);
	
	//increase time by 15 days
    await provider.send("evm_increaseTime", [60*60*24*15]);
	await provider.send("evm_mine");
	accruedholder = await weth.balanceOf(addr1.address);  
    await founderpool.tap();

	
  });

  it("Should have the right values", async function() {	    
    expect(await founderpool.balmin()).to.equal(tokenscontract.div(24));
	expect(await weth.balanceOf(addr1.address)).to.equal(accruedholder.add(tokenscontract.div(24)));
  });

});
