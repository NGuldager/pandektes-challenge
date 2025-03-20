import { Resolver, Args, Mutation } from '@nestjs/graphql';
import { Publication, ScrapeStatus } from './api-scraper.graphql';
import { ApiScraperProducer } from './api-scraper.producer';

@Resolver(() => Publication)
export class ApiScraperResolver {
  constructor(private apiScraperProducer: ApiScraperProducer) {}

  @Mutation(() => ScrapeStatus)
  async startApiScraping(
    @Args('query', { nullable: true }) query: string,
    @Args('skipLimit', {
      nullable: true,
      defaultValue: 100,
      description: 'Defaults to 100. Set to 0 for no limit',
    })
    skipLimit: number,
  ) {
    await this.apiScraperProducer.addScrapeJob({
      skip: 0,
      size: 100,
      query,
      skipLimit,
    });

    if (!query) {
      return {
        message: 'Scraping started without a query',
      };
    }

    return {
      message: `Scraping started for query: ${query}`,
    };
  }
}
