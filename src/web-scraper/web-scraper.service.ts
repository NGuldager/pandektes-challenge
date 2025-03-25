import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { WebScraperProducer } from './web-scraper.producer';
import { ScrapedPublication } from './web-scraper.types';
import { PublicationService } from 'src/publication/publication.service';
import { Cluster } from 'puppeteer-cluster';
import { Publication } from 'src/publication/publication.model';
import { TaskFunction } from 'puppeteer-cluster/dist/Cluster';

@Injectable()
export class WebScraperService implements OnModuleDestroy {
  private readonly logger = new Logger(WebScraperService.name);
  private readonly baseUrl = 'https://mfkn.naevneneshus.dk';
  private readonly searchUrl = `${this.baseUrl}/soeg?sort=desc&types=ruling`;
  private _cluster: Cluster | null = null;

  private get cluster() {
    if (this._cluster) return this._cluster;
    return Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 10,
      puppeteerOptions: {
        headless: true,
        defaultViewport: null,
        args: ['--start-maximized'],
      },
    }).then((cluster) => {
      this._cluster = cluster;
      return cluster;
    });
  }
  private readonly searchEndpoint = this.baseUrl + '/api/search';

  constructor(
    private webScraperProducer: WebScraperProducer,
    private publicationService: PublicationService,
  ) {}

  async closeCluster() {
    this.logger.log('Closing cluster');
    if (this._cluster) {
      await this._cluster.idle();
      await this._cluster.close();
      this._cluster = null;
    }
  }

  async onModuleDestroy() {
    await this.closeCluster();
  }

  async navigateToUrl(
    url: string,
    callback: (page: puppeteer.Page) => Promise<any>,
  ) {
    const cluster = await this.cluster;

    const handler: TaskFunction<string, any> = async ({ page }) => {
      await page.goto(url, { waitUntil: 'networkidle0' });
      try {
        await page.waitForSelector(
          '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
        );
        await page.click(
          '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
        );
        await page.waitForSelector(
          '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
        );
        await page.click(
          '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
        );
        this.logger.log('Clicked on the cookie dialog');
      } catch {
        this.logger.log('No cookie dialog found');
      }

      // Wait for the cookie dialog to be hidden
      let dialogHidden = false;
      do {
        const dialog = await page.$('#CybotCookiebotDialog');
        dialogHidden = Boolean(dialog && (await dialog.isHidden()));
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!dialogHidden);

      await page.reload({ waitUntil: 'networkidle0' });
      await callback(page);
    };
    await cluster.execute(handler);
  }

  async scrape(
    skipLimit: number,
    query?: string,
  ): Promise<ScrapedPublication[]> {
    const queryLog = query ? ` with query: ${query}` : '';
    this.logger.log(
      `Web scraping publications${queryLog} with page limit: ${skipLimit}`,
    );

    return new Promise((resolve) => {
      const handlePage = async (page: puppeteer.Page) => {
        page.on('request', (request) => {
          this.logger.log(`Request made: ${request.url()}`, request.postData());
        });

        // Extract publications
        const publications = this.scrapePage(page, skipLimit);
        const result: ScrapedPublication[] = [];

        for await (const publication of publications) {
          await this.webScraperProducer.addScrapeJob({
            id: publication.id,
          });
          result.push(publication);
        }

        resolve(result);
      };

      let url = this.searchUrl;
      if (query) {
        url += `&s=${encodeURIComponent(query)}`;
      }

      this.logger.log(`Navigating to: ${url}`);
      void this.navigateToUrl(url, handlePage);
    });
  }

  private async *scrapePage(
    page: puppeteer.Page,
    skipLimit: number,
    skip = 0,
  ): AsyncGenerator<ScrapedPublication, void, unknown> {
    this.logger.log('');
    this.logger.log(`Scraping page with skip: ${skip}`);

    // Get page content for Cheerio
    const content = await page.content();
    this.logger.log(`Page content loaded. Length: ${content.length}`);

    const $ = cheerio.load(content);

    // Extract publications
    const publications = this.extractPublications($, skip);
    this.logger.log(`Found ${publications.length} publications`);

    yield* publications;

    const nextSkip = skip + publications.length;

    if (skipLimit && nextSkip > skipLimit) {
      this.logger.log('Skipping to avoid too many requests');
      return;
    }

    const viewMoreButton = await page.$('#view-more:not(.disabled)');

    if (!viewMoreButton) {
      this.logger.log('No more publications to scrape');
      return;
    }

    const boxModel = await viewMoreButton.boundingBox();
    if (!boxModel) {
      this.logger.log('No box model found for the view more button');
      return;
    }

    // Click the "View more" button to load more publications
    void page.click('#view-more', {
      offset: { x: boxModel.width / 2, y: boxModel.height / 2 },
    });

    await page.waitForResponse(this.searchEndpoint);
    this.logger.log('Clicked on the view more button');

    let updatedContentLength = content.length;

    let waitCounter = 0;
    const maxWaitCounter = 100;

    while (
      updatedContentLength <= content.length &&
      waitCounter < maxWaitCounter
    ) {
      updatedContentLength = (await page.content()).length;

      if (waitCounter % 10 === 0) {
        this.logger.log(
          `Waiting for content to load... Current length: ${updatedContentLength}, Previous length: ${content.length}, Wait counter: ${waitCounter}`,
        );
      }

      waitCounter++;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (waitCounter >= maxWaitCounter) {
      this.logger.error('Content did not load in time, stopping scraping');
      return;
    }

    yield* this.scrapePage(page, skipLimit, nextSkip);
  }

  private extractPublications(
    $: cheerio.CheerioAPI,
    skip = 0,
  ): ScrapedPublication[] {
    const publications = $('.ruling-box')
      .slice(skip)
      .map((_, element): ScrapedPublication | null => {
        const $element = $(element);
        const titleElement = $element.find('h2').first();
        const linkElement = $element.find('a').first();
        const url = linkElement.attr('href');

        if (!url) return null;

        // Extract ID from URL
        const sections = url.split('?')[0].split('/');
        const id = sections[sections.length - 1];

        if (!id) return null;

        const title = titleElement.text().trim();
        const abstract = $element.find('.meta-highlight').text().trim();

        // Date is usually in a specific format, may need adjustment
        const dateText = $element.find('.meta-datestamp').text().trim();

        return {
          id,
          url: this.baseUrl + url,
          title,
          abstract,
          date: dateText,
        };
      })
      .get()
      .filter((publication) => publication !== null);

    return publications;
  }

  async createPublication(id: string) {
    const url = `${this.baseUrl}/afgoerelse/${id}`;

    return new Promise<Publication>((resolve) => {
      const handlePage = async (page: puppeteer.Page) => {
        const publication = await this.createPublicationFromBrowserPage(
          id,
          page,
        );
        resolve(publication);
      };

      void this.navigateToUrl(url, handlePage);
    });
  }

  async createPublicationFromBrowserPage(id: string, page: puppeteer.Page) {
    const content = await page.content();
    this.logger.log(`Page content loaded. Length: ${content.length}`);

    const $ = cheerio.load(content);

    const mainBody = $('.ruling-body');
    const $mainBody = $(mainBody);
    const second = $('.second');
    const $second = $(second);

    // Extract all the details from the page
    const title = $mainBody.find('h1').text().trim();
    const body = $mainBody.find('.html-content').text().trim();

    // Extract dates
    const dateText = $second.find('.sidebar-date p').text().trim();
    const publishedDateMatch = dateText.match(/(\d{2}-\d{2}-\d{4})/);
    const publishedDate = publishedDateMatch
      ? publishedDateMatch[1]
      : new Date().toISOString();

    // Extract categories
    const categories = $second
      .find('.sidebar-category a')
      .map((_, element) => $(element).text().trim())
      .get();

    const journalNumbers = $mainBody
      .find('.meta-journalnummer')
      .text()
      .split('og')
      .flatMap((jnr) => jnr.split('&'))
      .flatMap((jnr) => jnr.split(','))
      .map((jnr) => jnr.trim());

    const publicationModel = {
      id,
      categories,
      jnr: journalNumbers,
      title,
      published_date: publishedDate,
      date: publishedDate,
      body,
      attachments: [],
      documents: [],
      links: [],
    };
    return this.publicationService.upsert(publicationModel);
  }
}
