import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { TestUser } from '../data/testData';

export interface ApiResult<T = Record<string, unknown>> {
  httpStatus: number;
  responseCode: number;
  body: T & { responseCode: number; message?: string };
}

export interface ApiProduct {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: { usertype: { usertype: string }; category: string };
}

/**
 * Thin client for the public API (https://automationexercise.com/api_list).
 * The API returns HTTP 200 for almost everything and puts the real status in
 * body.responseCode, so both are returned and specs assert on the body code.
 */
export class AutomationExerciseApi {
  constructor(private readonly request: APIRequestContext) {}

  private async parse<T>(res: APIResponse): Promise<ApiResult<T>> {
    const text = await res.text();
    let body: ApiResult<T>['body'];
    try {
      body = JSON.parse(text);
    } catch {
      throw new Error(`API ${res.url()} returned non JSON (${res.status()}): ${text.slice(0, 200)}`);
    }
    return { httpStatus: res.status(), responseCode: body.responseCode, body };
  }

  async createAccount(u: TestUser) {
    return this.parse(
      await this.request.post('/api/createAccount', {
        form: {
          name: u.name,
          email: u.email,
          password: u.password,
          title: u.title,
          birth_date: u.birthDay,
          birth_month: u.birthMonthName,
          birth_year: u.birthYear,
          firstname: u.firstName,
          lastname: u.lastName,
          company: u.company,
          address1: u.address1,
          address2: u.address2,
          country: u.country,
          zipcode: u.zipcode,
          state: u.state,
          city: u.city,
          mobile_number: u.mobile,
        },
      }),
    );
  }

  async deleteAccount(email: string, password: string) {
    return this.parse(await this.request.delete('/api/deleteAccount', { form: { email, password } }));
  }

  async verifyLogin(email: string, password: string) {
    return this.parse(await this.request.post('/api/verifyLogin', { form: { email, password } }));
  }

  async verifyLoginWithoutEmail(password: string) {
    return this.parse(await this.request.post('/api/verifyLogin', { form: { password } }));
  }

  async productsList() {
    return this.parse<{ products: ApiProduct[] }>(await this.request.get('/api/productsList'));
  }

  async postToProductsList() {
    return this.parse(await this.request.post('/api/productsList'));
  }

  async brandsList() {
    return this.parse<{ brands: { id: number; brand: string }[] }>(await this.request.get('/api/brandsList'));
  }

  async searchProduct(term?: string) {
    return this.parse<{ products: ApiProduct[] }>(
      await this.request.post('/api/searchProduct', term === undefined ? {} : { form: { search_product: term } }),
    );
  }
}
