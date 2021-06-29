/**
 * A Nordigen ASPSP (Bank)
 */
export type ASPSP = {
  id : string,
  name : string,
  bic : string,
  countries : string[],
};

/**
 * A bank account in any bank
 * Please note that you might only get the account IBAN without any further information
 */
export type BankAccount = {
  iban: string,

  resourceId?: string,
  currency?: string,
  ownerName?: string, // Name of the account owner, e.g. "John Doe"
  product?: string,
  cashAccountType?: string,
  name?: string, // Account name, e.g. "Main Account"
};

/**
 * An End User Agreement
 */
export type EndUserAgreement = {
  id: string,
  created: Date,
  accepted: Date | null,
  max_historical_days: number,
  access_valid_for_days: number,
  enduser_id: string,
  aspsp_id: string,
}

/**
 * Nordigen Requisition
 */
export type Requisition = {
  id: string,
  redirect : string,
  status: string,
  agreements: string[],
  accounts: string[],
  reference: string,
  enduser_id: string,
  user_language: string,
}

export type AmountValue = {
  currency: string,
  amount: number
}

/**
 * A single account balance
 */
export type Balance = {
  balanceAmount: AmountValue,
  balanceType: "closingBooked" | "expected",
  referenceDate: string, // Format YYYY-MM-DD
};

/**
 * Balance data from the Nordigen API
 */
export type BalanceData = {
  account?: BankAccount,
  balances: Balance[]
};

/**
 * A single transaction on the account
 */
export type Transaction = {
  transactionId: string,

  // Transaction eather contains a "creditor" or "deptor" based in the type
  creditorName?: string,
  creditorAccount?: BankAccount,
  debtorName?: string,
  debtorAccount?: BankAccount,

  transactionAmount: AmountValue,

  bookingDate: string, // Format YYYY-MM-DD
  valueDate: string, // Format YYYY-MM-DD

  remittanceInformationUnstructured: string,
}

/**
 * Data returned by the transaction endpoint
 */
export type TransactionData = {
  account?: BankAccount,
  balances: Balance[],
  transactions: {
    booked: Transaction[],
    pending: Transaction[],
  }
}

/**
 * Data returned by the account detail endpoint
 * You will most likely get all information available in the "BankAccount" type here
 */
export type AccountDetailData = {
  account: BankAccount
}