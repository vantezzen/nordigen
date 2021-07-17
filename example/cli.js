/**
 * Nordigen-API library example
 * 
 * This is a simple CLI application that guides you through using this library
 * 
 * @author vantezzen
 * @license MIT License
 */
const inquirer = require('inquirer');
const util = require('util')
const Nordigen = require('../build/main').default;

// Let us work in an async Environment so we can use "await"
(async () => {
  console.log(`NORDIGEN JS API DEMO
This Demo will guide you through the steps on how you can get account details.
Please make sure to create a Nordigen Token at https://ob.nordigen.com/tokens/`);

  const { token } = await inquirer.prompt([{
    name: 'token',
    message: "What is your Nordigen API Token?"
  }]);

  const { createNewRequisition } = await inquirer.prompt([{
    type: 'list',
    name: 'createNewRequisition',
    message: "Do you want to create a new requsition or use an existing one?",
    choices: ["Create new", "I already have a requsition ID"]
  }]);

  // Setup the library
  const nordigen = new Nordigen(token);

  let requsitionId = false;
  if (createNewRequisition === "Create new") {
    // Choose a bank from the list of ASPSPs
    console.log('Next, let\'s find a bank to connect to');
  
    const { country } = await inquirer.prompt([{
      name: 'country',
      message: "Which country's banks should be queried? (Country shortcode, e.g. gb or us)",
      default: 'us'
    }]);
  
    // Query Nordigen for banks they support in that country
    const aspsps = await nordigen.getASPSPsForCountry(country);
  
    console.log(`Found ${aspsps.length} banks in that country. That's a lot of banks so let us filter out your bank`);
  
    let queriedBanks = [];
  
    do {
      // Search and pick a bank. Your application might present a webpage to the user to pick their bank instead
      const { query } = await inquirer.prompt([{
        name: 'query',
        message: "Define a search query to search through the list of banks (case insensitive):"
      }]);
    
      queriedBanks = aspsps.filter((bank) => bank.name.toLowerCase().includes(query.toLowerCase()));
  
      if (queriedBanks.length > 0) {
        console.log(`Found ${queriedBanks.length} banks that match your descrition, let us pick one`);
      } else {
        console.log('Could not find a bank matching your query. Please try another query.');
      }
    } while(queriedBanks.length === 0);
  
    const { bank } = await inquirer.prompt([{
      type: 'list',
      name: 'bank',
      message: "Choose your bank from the list:",
      choices: queriedBanks.map(bank => `${bank.name} (BIC: ${bank.bic})`)
    }]);
    const aspsp = queriedBanks.find(item => `${item.name} (BIC: ${item.bic})` === bank);
    
    const enduser_id = "nordigen-api-libdemo::" + Math.random();
    console.log(`Using bank with ID "${aspsp.id}" with random user id "${enduser_id}" to authenticate you`);
  
    // Create our nordigen requisition
    const requisition = await nordigen.createRequisition(
      enduser_id,
      `https://github.com/vantezzen/nordigen`,
      enduser_id,
    );
    const requisitionLink = await nordigen.getRequisitionLink(requisition, aspsp.id);
  
    console.log(`Generated a requsition. Please open ${requisitionLink} in your browser to authenticate.`);
  
    let hasConfirmed = false;
    while(!hasConfirmed) {
      hasConfirmed = (await inquirer.prompt([{
        name: 'hasConfirmed',
        type: 'confirm',
        message: 'Have you authenticated with your bank?',
        default: true
      }])).hasConfirmed;
    }
    requsitionId = requisition.id;

    console.log('Great! For future reference, here is your requsition ID for this action:', requsitionId);
  } else {
    console.log('Using an existing requsition.');

    requsitionId = (await inquirer.prompt([{
      name: 'requsitionId',
      message: "What is your existing Requisition ID?"
    }])).requsitionId;
  }

  if (!requsitionId) {
    console.log('ERROR: Couldn\'t get a requisition ID. Please try again');
    return;
  }

  const requsitionInfo = await nordigen.getRequisitionInfo(requsitionId);
  console.log('Accounts:', util.inspect(requsitionInfo.accounts, false, null, true));

  const details = await nordigen.getAccountDetails(requsitionInfo.accounts[0]);
  console.log('First account details: ', util.inspect(details, false, null, true));

  const balances = await nordigen.getAccountBalances(requsitionInfo.accounts[0]);
  console.log('First account balances: ', util.inspect(balances, false, null, true));

  const transactions = await nordigen.getAccountTransactions(requsitionInfo.accounts[0]);
  console.log('First account transactions: ', util.inspect(transactions, false, null, true));
})();