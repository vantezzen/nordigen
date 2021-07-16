# nordigen-api

Unofficial JavaScript API Library for Nordigen.

This library allows you to easily access the Nordigen Account Information API.

Please note that the Categorisation & Insights API is not yet implemented into this library. If you have access to that API, feel free to contribute to this library.

API Documentation: https://vantezzen.github.io/nordigen/
NPM: https://www.npmjs.com/package/nordigen-api

## Installation

Simply install the Library via NPM:

```bash
npm install nordigen-api
```

nordigen-api is build with TypeScript so you shouldn't need to install additional packages for type-support.

## Usage

This library uses Promise-based methods for calling the API. It is rept very slim, so you want to handle error handling etc. yourself.

Here is an example flow on how you can access accounts using the library. This example follows the same steps as defined in Nordigen's API quickstart guide at https://nordigen.com/en/account_information_documenation/integration/quickstart_guide/.

```JS
import Nordigen from 'nordigen-api';

const nordigen = new Nordigen('YOUR_ACCESS_TOKEN');

// Please note that you might also define an endpoint URL if you do not use the default Nordigen API, e.g.
// const nordigen = new Nordigen('YOUR_ACCESS_TOKEN', 'https://ob.beta.nordigen.com/api');

// First, get a list of ASPSPs (Banks) for the user
const aspsps = await nordigen.getASPSPsForCountry('gb');

// Let the user pick their ASPSP now. We will use the first ASPSP in this example:
const userAspsp = aspsps[0];

// A user needs an end user ID later on. You can choose this ID freely but it should remain the same
const enduser_id = "demo";

// Optionally, you can create an end user agreement to define a custom history length. If you want to use the default length of 90 days, skip this step
const agreement = await nordigen.createEndUserAgreement(enduser_id, userAspsp.id, 30);

// Now we need to create a "requisition" which allows us to authenticate a user at their bank
const requisition = await nordigen.createRequisition(
  enduser_id,

  // The user needs to be redirected to their bank's website. After they are done they will be redirected back to your website.
  // This is why you will need to define a redirect URL here
  // PLEASE NOTE: Nordigen will automatically add "?ref={enduser_id}" to this callback URL so you won't need to add that yourself!
  `https://example.com/nordigen-callback`,

  // You can define another unique ID here. This is the "reference" to this requisition
  "demo_id",

  // The following arguments are completely *optional*. If you don't need them, don't define them

  // Array of User agreements that we want to use
  [
    agreement
  ],

  // A language code that should be used. Otherwise, the user language will be used automatically. Format should be ISO 3166
  "EN/us"
);

// We have now create a requisition but we will need to redirect the user to their bank's website now. For that, we need the requisition link for the user's bank
const requisitionLink = await nordigen.getRequisitionLink(requisition, userAspsp.id);

// You may now redirect the user to this link and wait while they authenticate at their bank.

// As soon as the user comes back (e.g. being on the callback URL) we can get user information from our requsition.
const requsitionInfo = await nordigen.getRequisitionInfo(requisition.id);

// This will give you a list of account IDs the user has access to under requsitionInfo.accounts
// You may now allow the user to choose one of those accounts or loop through each account.
// We will continue with using only the first account.

// Let us get some more details about the user account
const details = await nordigen.getAccountDetails(requsitionInfo.accounts[0]);
// This info now includes the Account IBAN, owner name etc.

// We can also fetch the account balances
const balances = await nordigen.getAccountBalances(requsitionInfo.accounts[0]);

// ...or a list of transactions in our history timeframe
const transactions = await nordigen.getAccountTransactions(requsitionInfo.accounts[0]);

// You can look at the API documentation or /src/lib/types for more information about the returned data

// These are the methods this library provides.
// If you want to call an API endpoint not defined in the library (e.g. deleting an agreement), you can call the "makeRequest" method directly instead:
const response = await nordigen.makeRequest(
  // Relative path to the endpoint. You don't need the "https://ob.nordigen.com/api"
  "/agreements/enduser/MY_ID",

  // Optional HTTP method. This will default to "GET"
  "DELETE",

  // Optional HTTP body object. This will automatically be JSON encoded
  {
    // (This route doesn't require any body data)
  }
);
```
