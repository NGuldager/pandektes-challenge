import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { WebScraperService } from './web-scraper.service';
import { WebScraperProducer } from './web-scraper.producer';
import { WebScraperConsumer } from './web-scraper.consumer';
import { WebScraperResolver } from './web-scraper.resolver';
import { WEB_SCRAPER_QUEUE_NAME } from './web-scraper.types';
import { PublicationModule } from 'src/publication/publication.module';

@Module({
  imports: [
    PublicationModule,
    BullModule.registerQueue({
      name: WEB_SCRAPER_QUEUE_NAME,
    }),
  ],
  providers: [
    WebScraperService,
    WebScraperProducer,
    WebScraperConsumer,
    WebScraperResolver,
  ],
  exports: [WebScraperService],
})
export class WebScraperModule {}
