import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import {
  PublicationType,
  PublicationFilterInput,
  PublicationPaginatedResponse,
} from './publication.types';
import { PublicationService } from './publication.service';
import { PaginationInput } from '../common/pagination.types';

@Resolver(() => PublicationType)
export class PublicationResolver {
  constructor(private readonly publicationService: PublicationService) {}

  @Query(() => PublicationType, { nullable: true })
  async publication(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<PublicationType | null> {
    return this.publicationService.findOne(id);
  }

  @Query(() => PublicationPaginatedResponse)
  async publications(
    @Args('filter', { nullable: true }) filter?: PublicationFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PublicationPaginatedResponse> {
    const { take, skip } = pagination || {};

    const { items, total } = await this.publicationService.findAll(
      filter,
      skip,
      take,
    );

    const hasMore = (skip || 0) + items.length < total;

    return {
      items,
      meta: {
        total,
        hasMore,
      },
    };
  }
}
