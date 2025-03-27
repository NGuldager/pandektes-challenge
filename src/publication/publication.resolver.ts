import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { PublicationType } from './publication.types';
import { PublicationService } from './publication.service';

@Resolver(() => PublicationType)
export class PublicationResolver {
  constructor(private readonly publicationService: PublicationService) {}

  @Query(() => PublicationType, { nullable: true })
  async publication(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<PublicationType | null> {
    return this.publicationService.findOne(id);
  }
}
