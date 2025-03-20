import { Process, Processor } from '@nestjs/bull';
import { ApiScraperService } from './api-scraper.service';
import { API_SCRAPER_QUEUE_NAME, ScrapeJob } from './api-scraper.types';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';

@Processor(API_SCRAPER_QUEUE_NAME)
export class ApiScraperConsumer {
  private readonly logger = new Logger(ApiScraperConsumer.name);

  constructor(private apiScraperService: ApiScraperService) {}

  @Process()
  async processScrapeJob(job: Job<ScrapeJob>) {
    this.logger.log(`Processing job with ID: ${job.id}`);
    const { skip, size, query, skipLimit } = job.data;
    return this.apiScraperService.scrape(skip, size, query, skipLimit);
  }
}
