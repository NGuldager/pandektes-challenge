import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SearchResponse } from '../publication/publication.model';
import { tryCatchObservable } from 'src/utils/try-catch';
import { ApiScraperProducer } from './api-scraper.producer';
import { PublicationService } from 'src/publication/publication.service';

@Injectable()
export class ApiScraperService {
  private readonly logger = new Logger(ApiScraperService.name);

  constructor(
    private httpService: HttpService,
    private apiScraperProducer: ApiScraperProducer,
    private publicationService: PublicationService,
  ) {}

  async scrape(
    skip: number = 0,
    size: number = 10,
    query: string = '',
    skipLimit: number,
  ) {
    const queryLog = query ? ` with query: ${query} at` : '';
    this.logger.log(
      `Scraping publications${queryLog}, skip: ${skip}, skipLimit: ${skipLimit}`,
    );
    const searchResponse = await this.search(skip, size, query);

    this.logger.log(
      `Found ${searchResponse.publications.length} publications with a total count of ${searchResponse.totalCount}`,
    );

    if (skipLimit && skip >= skipLimit) {
      this.logger.log(`Reached maximum skip limit of ${skipLimit}`);
      return;
    }

    if (searchResponse.publications.length >= size) {
      await this.apiScraperProducer.addScrapeJob({
        skip: skip + size,
        size,
        query,
        skipLimit,
      });
    }

    this.logger.log(
      `Creating ${searchResponse.publications.length} publications`,
    );

    const createResult = await Promise.all(
      searchResponse.publications.map((publication) =>
        this.publicationService.upsert(publication),
      ),
    );

    this.logger.log(`Created ${createResult.length} publications`);

    return {
      publications: searchResponse.publications,
      createCount: createResult.length,
    };
  }

  async search(
    skip: number = 0,
    size: number = 10,
    query: string = '',
  ): Promise<SearchResponse> {
    const [response, error] = await tryCatchObservable(
      this.httpService.post<SearchResponse>(
        'https://mfkn.naevneneshus.dk/api/search',
        {
          categories: [],
          query,
          sort: 'Descending',
          types: ['ruling'],
          skip,
          size,
        },
      ),
    );

    if (error) {
      this.logger.error(`Failed to fetch search results: ${error.message}`);
      throw new Error(`Failed to fetch search results: ${error.message}`);
    }

    return response.data;
  }
}
