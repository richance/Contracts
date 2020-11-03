// imports
const { expect } = require("chai");
const { waffle } = require("hardhat");
const { deployContract, solidity  } = waffle;
const provider = waffle.provider;
const zeroaddress = "0x0000000000000000000000000000000000000000";

// test suite for the basic constructor of Treasury Drip
describe("Treasury Drip Constructor", function() {
	
  // variable to store the deployed smart contract	
  let tok;	
  let drip;	
	
  // initial deployment of Treasury Drip	
  before(async function() {
	const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();  
	  
    const Tok = await ethers.getContractFactory("Tok");
    tok = await Tok.deploy("0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5");
	await tok.deployed();
    const Drip = await ethers.getContractFactory("TreasuryDrip");
    drip = await Drip.deploy(tok.address,tok.address);
	await drip.deployed();	
	
  })	
	
  it("Should return the right Token", async function() {
    expect(await drip.Token()).to.equal(tok.address);
  });

  it("Should return the right bucket", async function() {
	const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    expect(await drip.bucket()).to.equal(tok.address);
  });
 
  it("Blocklock equals zero", async function() {
	const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    expect(await drip.blocklock()).to.equal(0);
  }); 
 
});

// test suite for basic functions
describe("Basic Treasury Drip Functions Functions", function() {
	
  // variable to store the deployed smart contract	
  let tok;	
  let drip;
	
  before(async function() {
	const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();  
	  
    const Tok = await ethers.getContractFactory("Tok");
    tok = await Tok.deploy("0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5");
	await tok.deployed();
    const Drip = await ethers.getContractFactory("TreasuryDrip");
    drip = await Drip.deploy(tok.address,tok.address);
	await drip.deployed();	
  })	

  it("Should tap but without any changes (only tlock)", async function() {	
  
    let treasurydao = await tok.treasuryDAO();
	let balance_tdao = await tok.balanceOf(treasurydao);
  
    await drip.tap();
	
	expect(await tok.balanceOf(treasurydao)).to.equal(balance_tdao);
  });
	
  it("Should not tap because of timelock", async function() {	
  
    let treasurydao = await tok.treasuryDAO();
    await tok.transfer(drip.address, 100000);
	
	await expect(drip.tap()).to.be.reverted;
  });	
	
});

// test suite for basic functions
describe("Basic Treasury Drip Functions Functions 2", function() {
	
  // variable to store the deployed smart contract	
  let tok;	
  let drip;
		
  before(async function() {
	const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();  
	  
    const Tok = await ethers.getContractFactory("Tok");
    tok = await Tok.deploy("0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5");
	await tok.deployed();
    const Drip = await ethers.getContractFactory("TreasuryDrip");
    drip = await Drip.deploy(tok.address,tok.address);
	await drip.deployed();	
  })	

	
  it("Should tap", async function() {	
  
    let treasurydao = await tok.treasuryDAO();
    await tok.transfer(drip.address, 100000);
	
    await drip.tap();
	
	expect(await tok.balanceOf(treasurydao)).to.equal(1483);
  });	
	
});
