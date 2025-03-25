import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ScrapeStatus } from '../api-scraper/api-scraper.graphql';
import { WebScraperService } from './web-scraper.service';

@Resolver()
export class WebScraperResolver {
  constructor(private webScraperService: WebScraperService) {}

  @Mutation(() => ScrapeStatus)
  startWebScraping(
    @Args('skipLimit', {
      nullable: true,
      defaultValue: 100,
      description: 'Defaults to 100. Set to 0 for no limit',
    })
    skipLimit: number,
    @Args('query', { nullable: true }) query?: string,
  ) {
    void this.webScraperService.scrape(skipLimit, query);

    const skipLimitText = skipLimit
      ? `with a limit of ${skipLimit}`
      : 'with no limit';

    if (!query) {
      return {
        message: `Web scraping started without a query ${skipLimitText}`,
      };
    }

    return {
      message: `Web scraping started for query: ${query} ${skipLimitText}`,
    };
  }
}
