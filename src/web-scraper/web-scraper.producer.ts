import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { WEB_SCRAPER_QUEUE_NAME, WebScrapeJob } from './web-scraper.types';

@Injectable()
export class WebScraperProducer {
  constructor(
    @InjectQueue(WEB_SCRAPER_QUEUE_NAME) private webScraperQueue: Queue,
  ) {}

  async addScrapeJob(data: WebScrapeJob) {
    await this.webScraperQueue.add(data);
  }
}
