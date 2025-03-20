export const API_SCRAPER_QUEUE_NAME = 'api-scraper';

export type ScrapeJob = {
  query: string;
  skip: number;
  size: number;
  skipLimit: number;
};
