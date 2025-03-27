import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { PaginationMeta } from '../common/pagination.types';

@ObjectType()
export class DocumentType {
  @Field(() => String)
  file: string;

  @Field(() => String)
  title: string;
}

@ObjectType()
export class LinkType {
  @Field(() => String)
  url: string;

  @Field(() => String)
  title: string;
}

@ObjectType()
export class PublicationType {
  @Field(() => ID)
  id: string;

  @Field(() => [String])
  categories: string[];

  @Field(() => [String])
  jnr: string[];

  @Field(() => String)
  title: string;

  @Field(() => String)
  published_date: string;

  @Field(() => String)
  date: string;

  @Field(() => String)
  body: string;

  @Field(() => [DocumentType], { nullable: true })
  attachments: DocumentType[] | null;

  @Field(() => [DocumentType], { nullable: true })
  documents: DocumentType[] | null;

  @Field(() => [LinkType], { nullable: true })
  links: LinkType[] | null;
}

@InputType()
export class StringArrayFilterInput {
  @Field(() => [String], { nullable: true })
  contains?: string[];
}

@InputType()
export class StringFilterInput {
  @Field(() => String, { nullable: true })
  contains?: string;
}

@InputType()
export class DateFilterInput {
  @Field(() => String, { nullable: true })
  equals?: string;

  @Field(() => String, { nullable: true })
  gt?: string;

  @Field(() => String, { nullable: true })
  gte?: string;

  @Field(() => String, { nullable: true })
  lt?: string;

  @Field(() => String, { nullable: true })
  lte?: string;
}

@InputType()
export class PublicationFilterInput {
  @Field(() => StringArrayFilterInput, { nullable: true })
  categories?: StringArrayFilterInput;

  @Field(() => StringArrayFilterInput, { nullable: true })
  jnr?: StringArrayFilterInput;

  @Field(() => StringFilterInput, { nullable: true })
  title?: StringFilterInput;

  @Field(() => DateFilterInput, { nullable: true })
  published_date?: DateFilterInput;

  @Field(() => StringFilterInput, { nullable: true })
  body?: StringFilterInput;
}

@ObjectType()
export class PublicationPaginatedResponse {
  @Field(() => [PublicationType])
  items: PublicationType[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
