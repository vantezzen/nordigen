/**
 * Nordigen-API library example
 * 
 * This is a simple CLI application that guides you through using this library
 * 
 * @author vantezzen
 * @license MIT License
 */
const inquirer = require('inquirer');
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

  // Setup the library
  const nordigen = new Nordigen(token);

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

  // Search and pick a bank. Your application might present a webpage to the user to pick their bank instead
  const { query } = await inquirer.prompt([{
    name: 'query',
    message: "Define a search query to search through the list of banks (case insensitive):"
  }]);

  const queriedBanks = aspsps.filter((bank) => bank.name.toLowerCase().includes(query.toLowerCase()));
  console.log(`Found ${queriedBanks.length} banks that match your descrition, let us pick one`);

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
    `https://github.com/vantezzen/nordigen?user=${enduser_id}`,
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

  console.log('Great! Now we can query your accounts:');

  const requsitionInfo = await nordigen.getRequisitionInfo(requisition.id);
  console.log('Accounts:', requisitionInfo.accounts);

  const details = await nordigen.getAccountDetails(requsitionInfo.accounts[0]);
  console.log('First account details: ', details);

  const balances = await nordigen.getAccountBalances(requsitionInfo.accounts[0]);
  console.log('First account balances: ', balances);

  const transactions = await nordigen.getAccountTransactions(requsitionInfo.accounts[0]);
  console.log('First account transactions: ', transactions);
})();