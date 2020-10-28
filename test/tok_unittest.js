// imports
const { expect } = require("chai");
const { waffle } = require("hardhat");
const { deployContract, solidity  } = waffle;

const zeroaddress = "0x0000000000000000000000000000000000000000";

// test suite for the basic constructor of Tok
describe("Tok Constructor", function() {
	
  // variable to store the deployed smart contract	
  let tok;	
	
  // initial deployment of Tok.sol	
  before(async function() {
    const Tok = await ethers.getContractFactory("Tok");
    tok = await Tok.deploy("0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5");
	await tok.deployed();
  })	
	
  it("Should return the address for treasury dao set in the constructor", async function() {
    expect(await tok.treasuryDAO()).to.equal("0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5");
	expect(await tok.balanceOf("0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5")).to.equal("0");
  });

  it("Should return the right name Sprout (_name)", async function() {
    expect(await tok.name()).to.equal("Sprout");
  });  
  
  it("Should return the right symbol Seed (_symbol)", async function() {
    expect(await tok.symbol()).to.equal("Seed");
  });   

  it("Should return the right decimals 18 (_decimals)", async function() {
    expect(await tok.decimals()).to.equal(18);
  });   

  it("Should return the right total supply 1e25 (_totalSupply)", async function() {
    expect(await tok.totalSupply()).to.equal("10000000000000000000000000");
  }); 

  it("Should return the right burned supply 0 (burnedSupply)", async function() {
    expect(await tok.burnedSupply()).to.equal("0");
  }); 

  it("Should send 10.000.000 Sprout Tokens to the creator of the contract", async function() {
	const [owner, addr1] = await ethers.getSigners();
    expect(await tok.balanceOf(owner.address)).to.equal("10000000000000000000000000");
	expect(await tok.balanceOf(addr1.address)).to.equal("0");
  }); 
 
});

// test suite for basic functions
describe("Basic Tok Functions", function() {
	
  // variable to store the deployed smart contract	
  let tok;	
	
  // initial deployment of Tok.sol	
  before(async function() {
    const Tok = await ethers.getContractFactory("Tok");
    tok = await Tok.deploy("0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5");
	await tok.deployed();
  })	
	
  it("Should return allowance of 0 initial", async function() {
	const [owner, addr1] = await ethers.getSigners();
    expect(await tok.allowance(owner.address,tok.address)).to.equal("0");
  });
  
  it("Should increase the allowance by 1000", async function() {
	const [owner, addr1] = await ethers.getSigners();
    await tok.increaseAllowance(tok.address,1000);
	expect(await tok.allowance(owner.address,tok.address)).to.equal("1000");
  });  
 
  it("Should decrease increase the allowance by 1000", async function() {
	const [owner, addr1] = await ethers.getSigners();
	expect(await tok.allowance(owner.address,tok.address)).to.equal("1000");
    await tok.decreaseAllowance(tok.address,1000);
	expect(await tok.allowance(owner.address,tok.address)).to.equal("0");
  }); 
  
  it("Should not decrease below zero", async function() {
	await expect(tok.decreaseAllowance(zeroaddress,10000)).to.be.revertedWith('ERC20: decreased allowance below zero');
  });   

  it("Should approve 1000", async function() {
	const [owner, addr1] = await ethers.getSigners();
    await tok.approve(tok.address,1000);
	expect(await tok.allowance(owner.address,tok.address)).to.equal("1000");
  });    
 
  it("Should approve 0", async function() {
	const [owner, addr1] = await ethers.getSigners();
	expect(await tok.allowance(owner.address,tok.address)).to.equal("1000");
    await tok.approve(tok.address,0);
	expect(await tok.allowance(owner.address,tok.address)).to.equal("0");
  });  
 
  it("Should not approve zero address spender", async function() {
    await expect(tok.approve(zeroaddress,0)).to.be.revertedWith('ERC20: approve to the zero address');
	await expect(tok.increaseAllowance(zeroaddress,1000)).to.be.revertedWith('ERC20: approve to the zero address');
	await expect(tok.decreaseAllowance(zeroaddress,0)).to.be.revertedWith('ERC20: approve to the zero address');
  });  
 
  it("Should not approve zero address owner", async function() {
    await expect(tok.approve(zeroaddress,0)).to.be.revertedWith('ERC20: approve to the zero address');
  });  
 
});


// burn test
describe("Tok Burn Function", function() {
	
  // variable to store the deployed smart contract	
  let tok;	
	
  // initial deployment of Tok.sol	
  before(async function() {
    const Tok = await ethers.getContractFactory("Tok");
    tok = await Tok.deploy("0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5");
	await tok.deployed();
  })	
		
  it("Should not be allowed with more than available amount", async function() {
	await expect(tok.burnt("10000000000000000000000001")).to.be.revertedWith('ERC20: transfer amount exceeds balance');
  });

  it("Should increase burend supply by 1000 *99/100 + 1000/200 = 995", async function() {
	await tok.burnt("1000");
	expect(await tok.burnedSupply()).to.equal("995");
  });  
 
  it("Should increase balance of treasury dao to 1000/200 = 5", async function() {
	let treasurydao = await tok.treasuryDAO();
	expect(await tok.balanceOf(treasurydao)).to.equal("5");
  });   
 
  it("Should decrease balance of sender by 1000 -  ", async function() {
	const [owner, addr1] = await ethers.getSigners();
	expect(await tok.balanceOf(owner.address)).to.equal("9999999999999999999999994");
  });   
 
  it("Should not affect voted of msg.sender should still be 0  ", async function() {
	const [owner, addr1] = await ethers.getSigners();
	expect(await tok.voted(owner.address)).to.equal("0");
  });   
 
 
});

// voting and treasury dao
describe("Voting and treasury dao", function() {
	
  // variable to store the deployed smart contract	
  let tok;	
	
  // initial deployment of Tok.sol	
  before(async function() {
    const Tok = await ethers.getContractFactory("Tok");
    tok = await Tok.deploy("0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5");
	await tok.deployed();
	tok2 = await Tok.deploy("0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5");
	await tok2.deployed();
  })	
		
  it("Should not be allowed to set treasury dao with no majority", async function() {
	const [owner, addr1] = await ethers.getSigners();  
	await expect(tok.setNewTDao(addr1.address)).to.be.revertedWith('Sprout: setNewTDao requires majority approval');
  }); 
 
  it("Should update votes", async function() {
	const [owner, addr1] = await ethers.getSigners();  
	
	expect(await tok.votedad(owner.address)).to.equal(zeroaddress);
	expect(await tok.votet(owner.address)).to.equal(0);
	expect(await tok.votedad(addr1.address)).to.equal(zeroaddress);
	expect(await tok.votet(addr1.address)).to.equal(0);
	expect(await tok.votet(tok.votedad(owner.address))).to.equal(0);
	
	// now owner votes for addr1
	await tok.updateVote(addr1.address);
  });  
  
  it("Check the values after first vote", async function() {
	const [owner, addr1] = await ethers.getSigners();  
	expect(await tok.votedad(owner.address)).to.equal(addr1.address);
	expect(await tok.votet(owner.address)).to.equal(0);
	expect(await tok.votedad(addr1.address)).to.equal(zeroaddress);
	expect(await tok.votet(addr1.address)).to.equal("10000000000000000000000000");
	expect(await tok.votet(tok.votedad(owner.address))).to.equal("10000000000000000000000000");
  });   

  it("Should  be allowed to set treasury dao", async function() {
	const [owner, addr1] = await ethers.getSigners();  
	await tok.setNewTDao(addr1.address);
	expect(await tok.treasuryDAO()).to.equal(addr1.address);
  });   
 
});

// transfering
describe("Transfering of tokens", function() {
	
  // variable to store the deployed smart contract	
  let tok;	
	
  // initial deployment of Tok.sol	
  before(async function() {
    const Tok = await ethers.getContractFactory("Tok");
    tok = await Tok.deploy("0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5");
	await tok.deployed();
	tok2 = await Tok.deploy("0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5");
	await tok2.deployed();
  })	
		
  it("Should not be allowed with exceeding tokens", async function() {
	const [owner, addr1] = await ethers.getSigners();  
	await expect(tok.transferFrom(owner.address, addr1.address,"10000000000000000000000001")).to.be.revertedWith('ERC20: transfer amount exceeds balance');
  }); 
   
  it("Should not be allowed with transfer from zero", async function() {
	const [owner, addr1] = await ethers.getSigners();  
	await expect(tok.transferFrom(zeroaddress, addr1.address,1000)).to.be.revertedWith('ERC20: transfer from the zero address');
  });    
 
  it("Should not be allowed with transfer to zero", async function() {
	const [owner, addr1] = await ethers.getSigners();  
	await expect(tok.transferFrom(owner.address, zeroaddress,1000)).to.be.revertedWith('ERC20: transfer to the zero address');
  });   
 
  it("Should transfer the funds correctly", async function() {
	const [owner, addr1] = await ethers.getSigners();  
	let treasurydao = await tok.treasuryDAO();
	expect(await tok.balanceOf(owner.address)).to.equal("10000000000000000000000000");
	expect(await tok.balanceOf(addr1.address)).to.equal("0");
	expect(await tok.balanceOf(treasurydao)).to.equal("0");
	
	// set allowance and send
	await tok.approve(owner.address,1000);
	await tok.transferFrom(owner.address, addr1.address,1000);
	
	expect(await tok.balanceOf(owner.address)).to.equal("9999999999999999999999004");
	expect(await tok.balanceOf(addr1.address)).to.equal("990");
	expect(await tok.balanceOf(treasurydao)).to.equal("5");	
  });  
 
});

// transferX
describe("Transfering of tokens X", function() {
	
  // variable to store the deployed smart contract	
  let tok;	
	
  // initial deployment of Tok.sol	
  before(async function() {
    const Tok = await ethers.getContractFactory("Tok");
    tok = await Tok.deploy("0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5");
	await tok.deployed();
	tok2 = await Tok.deploy("0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5");
	await tok2.deployed();
  })	
		
  it("Should not be allowed to send to zero address", async function() {
	const [owner, addr1] = await ethers.getSigners();  
	await expect(tok.transferx([zeroaddress], [1000],["test"])).to.be.revertedWith('ERC20: transfer to the zero address');
  }); 
    
  it("Should not be allowed to send with too many tokens", async function() {
	const [owner, addr1] = await ethers.getSigners();  
	await expect(tok.transferx([addr1.address], ["10000000000000000000000001"],["test"])).to.be.revertedWith('ERC20: transfer amount exceeds balance');
  }); 	
 
  it("Should transfer the funds correctly", async function() {
	const [owner, addr1, addr2] = await ethers.getSigners();  
	let treasurydao = await tok.treasuryDAO();
	expect(await tok.balanceOf(owner.address)).to.equal("10000000000000000000000000");
	expect(await tok.balanceOf(addr1.address)).to.equal("0");
	expect(await tok.balanceOf(addr2.address)).to.equal("0");
	expect(await tok.balanceOf(treasurydao)).to.equal("0");
	
	// set allowance and send
	await tok.transferx([addr1.address, addr2.address], [1000,1000],["test", "test2"]);
	
	expect(await tok.balanceOf(owner.address)).to.equal("9999999999999999999998009");
	expect(await tok.balanceOf(addr1.address)).to.equal("990");
	expect(await tok.balanceOf(addr2.address)).to.equal("989");
	expect(await tok.balanceOf(treasurydao)).to.equal("9");	
  });   
 
});
