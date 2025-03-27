# Pandektes Challenge: Build a Case Law Web Scraper with Nestjs

## Project setup

```bash
# Setup .env file
$ cp .env.example .env

# Install dependencies
$ npm install

# Start docker with postgres and redis
$ docker compose up -d

# Run migrations and generate prisma client
$ npm run prisma:migrate
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Start scraping

Steps:

1. Start the application
2. Go to http://localhost:3000/graphql
3. Run one of the following mutations:

```graphql
mutation startWebScrape {
  startWebScraping(skipLimit: 100) {
    # set skip limit to 0 disable limit
    message
  }
}

mutation startApiScrape {
  startApiScraping(skipLimit: 100) {
    # set skip limit to 0 disable limit
    message
  }
}
```

## Querying

To fetch publications use the following query:

```graphql
query publications($body: String, $pagination: PaginationInput) {
  publications(filter: { body: { contains: $body } }, pagination: $pagination) {
    meta {
      hasMore
      total
    }
    items {
      id
      categories
      jnr
      title
      published_date
      date
      body
      attachments {
        file
        title
      }
      documents {
        file
        title
      }
      links {
        title
        url
      }
    }
  }
}
```

Following fields can be used for filtering:

- title
- body
- categories
- jnr
- published_date

## Project structure

This project is a NestJS application designed to scrape case law data using both web scraping and API scraping techniques, with a GraphQL API for data access.

### Main Structure

- `src` - Main source code directory
  - `main.ts` - Application entry point that bootstraps the NestJS application
  - `app` - Main module that imports and configures all other modules

### Data Scraping Modules

- `web-scraper` - Module for web scraping functionality
  - Uses Puppeteer and Cheerio for web scraping
  - Implements queue-based processing with Bull
- `api-scraper` - Module for API-based scraping
  - Uses HttpModule for API requests
  - Implements queue-based processing with Bull

### Data Management

- `publication` - Module for managing publication data
  - `publication.model.ts` - Data models for publications
  - `publication.service.ts` - Service for CRUD operations
  - `publication.resolver.ts` - GraphQL resolver for publications
  - `publication.types.ts` - GraphQL type definitions

### Database

- `prisma` - Prisma ORM configuration

## Key Decisions and notes

- `API Scraping vs Web Scraping`: Ideally, API scraping would be the ideal approach if possible, as it generally allows for more complete data extraction with less complex setup. However, sometimes web scraping is the only option, and the decision was made to show how both techniques could be used for this challenge.
  - API Scraping was initially implemented to get an overview of the data, but web scraping was added due nature of the challenge.
- `Puppeteer and Cheerio for Web Scraping`: Puppeteer is used for browser automation, while Cheerio is used for DOM parsing.
  - Cheerio might not be needed due to the simplicity of the web scraping task, and could be replaced with the built-in DOM parsing of Puppeteer.
  - Puppeteer clustering was added to allow for concurrent scraping.
    - This allows to start the processing of each individual publication while the list is still being processed.
- `Bull for Queue-Based Processing`: Bull is used for queue-based processing, ensuring that scraping tasks are processed in a sequential manner.

## Next steps for production readiness

- Don't fetch relations when querying publications unless needed
  - This could be done with a library like `dataloader`
  - This would allow to fetch all relations in one query
  - This would also allow to fetch relations for multiple publications in one query
- Add authentication to the Publication GraphQL API
- Make sure high load on scraping does not have a severe negative impact on the Publication GraphQL API
  - Potential solutions:
    - Separate the scraping modules from the Publication GraphQL API into completely separate services
    - Have read replica support for the Publication GraphQL API
- Add tests to the project
- Add validation of input data from the API
  - Could be done with `zod` or similar
- Add document, attachment and link parsing to the web scraper
- Improve error handling
  - This could be done with a library like `neverthrow` or `effect`

### Potential improvements

- Extract metadata from a publication
  - Potential fields:
    - Legal citations in the body
    - urls not present in the links
- Improve search functionality
  - Potential solutions depending on the complexity needed:
    - Use `fuzzystrmatch` and `pg_trgm` extensions in PostgreSQL
    - Elasticsearch or similar
