import { type Page } from '@playwright/test';
import { Header } from '../components/Header';

export abstract class BasePage {
  readonly header: Header;

  constructor(protected readonly page: Page) {
    this.header = new Header(page);
  }

  abstract readonly path: string;
  abstract waitUntilReady(): Promise<void>;

  async goto(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitUntilReady();
  }
}
