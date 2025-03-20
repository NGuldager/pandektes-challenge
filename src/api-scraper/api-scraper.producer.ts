import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { API_SCRAPER_QUEUE_NAME, ScrapeJob } from './api-scraper.types';

@Injectable()
export class ApiScraperProducer {
  constructor(
    @InjectQueue(API_SCRAPER_QUEUE_NAME) private apiScraperQueue: Queue,
  ) {}

  async addScrapeJob(data: ScrapeJob) {
    await this.apiScraperQueue.add(data);
  }
}
