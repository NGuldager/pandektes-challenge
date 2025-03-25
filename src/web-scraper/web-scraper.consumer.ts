import { InjectQueue, OnQueueDrained, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { WebScraperService } from './web-scraper.service';
import { WEB_SCRAPER_QUEUE_NAME, WebScrapeJob } from './web-scraper.types';
import { tryCatch } from 'src/utils/try-catch';

@Processor(WEB_SCRAPER_QUEUE_NAME)
export class WebScraperConsumer {
  private readonly logger = new Logger(WebScraperConsumer.name);

  constructor(
    private webScraperService: WebScraperService,
    @InjectQueue(WEB_SCRAPER_QUEUE_NAME) private webScraperQueue: Queue,
  ) {}

  @Process({
    concurrency: 10,
  })
  async processScrapeJob(job: Job<WebScrapeJob>) {
    this.logger.log(`Processing web scrape job with ID: ${job.id}`);
    const { id } = job.data;

    const [result, error] = await tryCatch(
      this.webScraperService.createPublication(id),
    );

    if (error) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`);
      return;
    }
    this.logger.log(`Finished processing web scrape job with ID: ${job.id}`);
    return result;
  }

  @OnQueueDrained()
  async handleQueueDrained() {
    this.logger.log(`Queue ${WEB_SCRAPER_QUEUE_NAME} has drained`);
    await this.webScraperService.closeCluster();
  }
}
