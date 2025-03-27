import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ConfigModule } from '@nestjs/config';
import { PublicationModule } from 'src/publication/publication.module';
import { ApiScraperModule } from 'src/api-scraper/api-scraper.module';
import { WebScraperModule } from 'src/web-scraper/web-scraper.module';
import { BullModule } from '@nestjs/bull';

const defaultDocument = `mutation startWebScrape{
  # set skip limit to 0 disable limit
  startWebScraping(skipLimit: 100) {
    message
  }
}`;

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6789,
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      introspection: true,
      playground: false,
      plugins: [
        ApolloServerPluginLandingPageLocalDefault({
          document: defaultDocument,
        }),
      ],
    }),
    PublicationModule,
    ApiScraperModule,
    WebScraperModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
