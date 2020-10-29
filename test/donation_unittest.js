// imports
const { expect } = require("chai");
const { waffle } = require("hardhat");
const { deployContract, solidity  } = waffle;
const provider = waffle.provider;

const zeroaddress = "0x0000000000000000000000000000000000000000";

// test suite for the basic constructor of Tok
describe("Donation Constructor", function() {
	
  // variable to store the deployed smart contract	
  let tok;	
  let donation;	
	
  // initial deployment of Tok.sol	
  before(async function() {
	const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();  
	  
    const Tok = await ethers.getContractFactory("Tok");
    tok = await Tok.deploy("0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5");
	await tok.deployed();
    const Donation = await ethers.getContractFactory("Donation");
    donation = await Donation.deploy(tok.address, addr1.address, addr2.address, addr3.address, addr4.address);
	await donation.deployed();	
	
  })	
	
  it("Should return the right Token", async function() {
    expect(await donation.Token()).to.equal(tok.address);
  });

  it("Should return the right address1", async function() {
	const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    expect(await donation.ad1()).to.equal(addr1.address);
  });
 
  it("Should return the right address2", async function() {
	const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    expect(await donation.ad2()).to.equal(addr2.address);
  });

  it("Should return the right address3", async function() {
	const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    expect(await donation.ad3()).to.equal(addr3.address);
  });

  it("Should return the right address4", async function() {
	const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    expect(await donation.ad4()).to.equal(addr4.address);
  });

  it("Should have tbal 0", async function() {
	const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    expect(await donation.tbal()).to.equal(0);
  });

  it("Should return the right start and finish", async function() {
	
    let start = await donation.start();
	let finish = await donation.finish();
	  
    expect(finish).to.equal(start.add(20 * 60 * 60));
  });  
 
  it("Should not reset at start", async function() {
    await expect(donation.reset()).to.be.reverted;
  });   
 
});

// test suite for basic functions
describe("Basic Donation Functions", function() {
	
  // variable to store the deployed smart contract	
  let tok;	
  let donation;
	
  // initial deployment of Tok.sol	
  before(async function() {
	const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();  
	  
    const Tok = await ethers.getContractFactory("Tok");
    tok = await Tok.deploy("0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5");
	await tok.deployed();
    const Donation = await ethers.getContractFactory("Donation");
    donation = await Donation.deploy(tok.address, addr1.address, addr2.address, addr3.address, addr4.address);
	await donation.deployed();	
  })	
	
  it("Should call donate", async function() {
	const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
	
	//let balance_owner = await provider.getBalance(owner.address);
	let balance_addr1 = await provider.getBalance(addr1.address);
	let balance_addr2 = await provider.getBalance(addr2.address);
	let balance_addr3 = await provider.getBalance(addr3.address);
	let balance_addr4 = await provider.getBalance(addr4.address);
	
	// hex of 10000000000000000000000
	expect(balance_addr1).to.equal("0x021e19e0c9bab2400000");
	expect(balance_addr2).to.equal("0x021e19e0c9bab2400000");
	expect(balance_addr3).to.equal("0x021e19e0c9bab2400000");
	expect(balance_addr4).to.equal("0x021e19e0c9bab2400000");
	
    await donation.donate();

	let balance_owner = await provider.getBalance(owner.address);
	balance_addr1 = await provider.getBalance(addr1.address);
	balance_addr2 = await provider.getBalance(addr2.address);
	balance_addr3 = await provider.getBalance(addr3.address);
	balance_addr4 = await provider.getBalance(addr4.address);
	
	expect(balance_addr1).to.equal("0x021e19e0c9bab2400000");
	expect(balance_addr2).to.equal("0x021e19e0c9bab2400000");
	expect(balance_addr3).to.equal("0x021e19e0c9bab2400000");
	expect(balance_addr4).to.equal("0x021e19e0c9bab2400000");	
  });
  
  it("Should not be able to receive ether at start", async function() {
	const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
	
    const trans_obj = {
        to: donation.address,
        gasLimit: 4000000,
		gasPrice: 4000000,
        value: 1000}

	await expect(owner.sendTransaction(trans_obj)).to.be.reverted;
	
  });

  it("Should be able to check getamout", async function() {
	const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
	expect(await donation.getamout(0)).to.equal(0);
	
  });
});

