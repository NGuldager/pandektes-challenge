import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApiScraperService } from './api-scraper.service';
import { ApiScraperResolver } from './api-scraper.resolver';
import { ApiScraperProducer } from './api-scraper.producer';
import { ApiScraperConsumer } from './api-scraper.consumer';
import { BullModule } from '@nestjs/bull';
import { API_SCRAPER_QUEUE_NAME } from './api-scraper.types';
import { PublicationModule } from 'src/publication/publication.module';

@Module({
  imports: [
    PublicationModule,
    HttpModule,
    BullModule.registerQueue({
      name: API_SCRAPER_QUEUE_NAME,
    }),
  ],
  providers: [
    ApiScraperService,
    ApiScraperResolver,
    ApiScraperProducer,
    ApiScraperConsumer,
  ],
  exports: [ApiScraperService],
})
export class ApiScraperModule {}
