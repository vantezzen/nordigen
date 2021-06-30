import fetch from 'node-fetch';

import {
  AccountDetailData,
  ASPSP,
  BalanceData,
  EndUserAgreement,
  Requisition,
  TransactionData,
} from './types';

/**
 * Unofficial Nordigen API for JavaScript
 *
 * @author vantezzen (https://github.com/vantezzen)
 * @license MIT License
 */
export default class Nordigen {
  /**
   * Access Token for the Nordigen API
   */
  private readonly accessToken: string;

  /**
   * Endpoint URL to use
   */
  readonly endpoint: string;

  /**
   * Create a new instance of the Nordigen API
   *
   * ### Example (es module)
   * ```js
   * import Nordigen from 'nordigen'
   * const nordigen = new Nordigen();
   * ```
   *
   * @param accessToken Access Token for the Nordigen API
   * @param endpoint Endpoint URL for the Nordigen API
   */
  constructor(accessToken: string, endpoint = 'https://ob.nordigen.com/api') {
    this.accessToken = accessToken;
    this.endpoint = endpoint;
  }

  /**
   * Make an authenticated request to the Nordigen API
   *
   * @param path Relative path to the requested endpoint
   * @param method Method to use
   * @param body Message Body
   * @returns JSON Response
   */
  async makeRequest(
    path: string,
    method = 'GET',
    body: Record<string, unknown> | false = false
  ) {
    const request = await fetch(`${this.endpoint}${path}`, {
      method,
      headers: {
        accept: 'application/json',
        Authorization: `Token ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const response = await request.json();
    return response;
  }

  /**
   * Get a list of ASPSPs (Banks) for a given country
   *
   * @param countryCode Country code to use, e.g. "gb" for Great Britain
   * @returns Array of ASPSPs
   */
  async getASPSPsForCountry(countryCode: string): Promise<readonly ASPSP[]> {
    return await this.makeRequest(`/aspsps/?country=${countryCode}`);
  }

  /**
   * Create a new end user agreement for a user.
   * Use this step only if you want to specify the length of transaction history you want to retrieve.
   * If you skip this step, by default 90 days of transaction history will be retrieved
   *
   * @param enduser_id A unique end-user ID of someone who's using your services, it has to be unique within your solution. Usually, it's UUID;
   * @param aspsp_id ASPSP ID (Bank ID) to use
   * @param max_historical_days The length of the transaction history to be retrieved
   * @returns End user agreement
   */
  async createEndUserAgreement(
    enduser_id: string,
    aspsp_id: string,
    max_historical_days = 90
  ): Promise<EndUserAgreement> {
    const response = await this.makeRequest('/agreements/enduser/', 'POST', {
      enduser_id,
      aspsp_id,
      max_historical_days,
    });

    if (response.created) {
      response.created = new Date(response.created);
    }
    if (response.accepted) {
      response.accepted = new Date(response.accepted);
    }

    return response;
  }

  /**
   * Create a requisition for a user
   *
   * @param enduser_id A unique end-user ID of someone who's using your services, it has to be unique within your solution. Usually, it's a UUID. If you have an end user agreement it has to be the ID of that user
   * @param redirect URI where the end user will be redirected after finishing authentication in ASPSP
   * @param reference Additional layer of unique ID defined by you
   * @param agreements As an array of end user agreement IDs or an empty array if you don't have one
   * @param user_language To enforce a language for all end user steps hosted by Nordigen passed as a two-letter country code (ISO 3166). If user_language is not defined a language set in browser will be used to determine language
   * @returns Requisition answer
   */
  async createRequisition(
    enduser_id: string,
    redirect: string,
    reference: string,
    agreements: readonly EndUserAgreement[] = [],
    user_language: string | undefined = undefined
  ): Promise<Requisition> {
    return await this.makeRequest('/requisitions/', 'POST', {
      enduser_id,
      redirect,
      reference,
      agreements,
      user_language,
    });
  }

  /**
   * Get the link for the user requisition
   *
   * @param requsition Requisition as returned by `createRequisition`
   * @param aspsp_id ID for the user's ASPSP (Bank)
   * @returns Link for "false" if Nordigen didn't return one
   */
  async getRequisitionLink(
    requsition: Requisition,
    aspsp_id: string
  ): Promise<string | false> {
    const response = await this.makeRequest(
      `/requisitions/${requsition.id}/links/`,
      'POST',
      {
        aspsp_id,
      }
    );
    if (response && response.initiate) {
      return response.initiate;
    }
    return false;
  }

  /**
   * Get information about a user requisition.
   * This can be used to get a list of all user accounts by getting requisition.accounts
   *
   * @param requisition_id Requisition ID of an existing requistion
   * @returns Requisition info
   */
  async getRequisitionInfo(requisition_id: string): Promise<Requisition> {
    return await this.makeRequest(`/requisitions/${requisition_id}/`);
  }

  /**
   * Get a list of all balances an account ID holds
   *
   * @param account_id Account ID to check
   * @returns Balances for the account
   */
  async getAccountBalances(account_id: string): Promise<BalanceData> {
    return await this.makeRequest(`/accounts/${account_id}/balances/`);
  }

  /**
   * Get a list of all transactions an account ID holds
   *
   * @param account_id Account ID to check
   * @returns Transactions for the account
   */
  async getAccountTransactions(account_id: string): Promise<TransactionData> {
    return await this.makeRequest(`/accounts/${account_id}/transactions/`);
  }

  /**
   * Get account details for an account
   *
   * @param account_id Account ID to check
   * @returns Details for the account
   */
  async getAccountDetails(account_id: string): Promise<AccountDetailData> {
    return await this.makeRequest(`/accounts/${account_id}/details/`);
  }
}
