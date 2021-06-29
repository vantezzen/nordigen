/**
 * A Nordigen ASPSP (Bank)
 */
export type ASPSP = {
  readonly id: string;
  readonly name: string;
  readonly bic: string;
  readonly countries: readonly string[];
};

/**
 * A bank account in any bank
 * Please note that you might only get the account IBAN without any further information
 */
export type BankAccount = {
  readonly iban: string;

  readonly resourceId?: string;
  readonly currency?: string;
  readonly ownerName?: string; // Name of the account owner, e.g. "John Doe"
  readonly product?: string;
  readonly cashAccountType?: string;
  readonly name?: string; // Account name, e.g. "Main Account"
};

/**
 * An End User Agreement
 */
export type EndUserAgreement = {
  readonly id: string;
  readonly created: Date;
  readonly accepted: Date | null;
  readonly max_historical_days: number;
  readonly access_valid_for_days: number;
  readonly enduser_id: string;
  readonly aspsp_id: string;
};

/**
 * Nordigen Requisition
 */
export type Requisition = {
  readonly id: string;
  readonly redirect: string;
  readonly status: string;
  readonly agreements: readonly string[];
  readonly accounts: readonly string[];
  readonly reference: string;
  readonly enduser_id: string;
  readonly user_language: string;
};

export type AmountValue = {
  readonly currency: string;
  readonly amount: number;
};

/**
 * A single account balance
 */
export type Balance = {
  readonly balanceAmount: AmountValue;
  readonly balanceType: 'closingBooked' | 'expected';
  readonly referenceDate: string; // Format YYYY-MM-DD
};

/**
 * Balance data from the Nordigen API
 */
export type BalanceData = {
  readonly account?: BankAccount;
  readonly balances: readonly Balance[];
};

/**
 * A single transaction on the account
 */
export type Transaction = {
  readonly transactionId: string;

  // Transaction eather contains a "creditor" or "deptor" based in the type
  readonly creditorName?: string;
  readonly creditorAccount?: BankAccount;
  readonly debtorName?: string;
  readonly debtorAccount?: BankAccount;

  readonly transactionAmount: AmountValue;

  readonly bookingDate: string; // Format YYYY-MM-DD
  readonly valueDate: string; // Format YYYY-MM-DD

  readonly remittanceInformationUnstructured: string;
};

/**
 * Data returned by the transaction endpoint
 */
export type TransactionData = {
  readonly account?: BankAccount;
  readonly balances: readonly Balance[];
  readonly transactions: {
    readonly booked: readonly Transaction[];
    readonly pending: readonly Transaction[];
  };
};

/**
 * Data returned by the account detail endpoint
 * You will most likely get all information available in the "BankAccount" type here
 */
export type AccountDetailData = {
  readonly account: BankAccount;
};
