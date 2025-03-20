import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class CategoryCount {
  @Field(() => String)
  category: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class Document {
  @Field(() => String)
  file: string;

  @Field(() => String)
  title: string;
}

@ObjectType()
export class Publication {
  @Field(() => String)
  id: string;

  @Field(() => [String], { nullable: true })
  highlights?: string[];

  @Field(() => String, { nullable: true })
  type?: string;

  @Field(() => [String], { nullable: true })
  categories?: string[];

  @Field(() => [String], { nullable: true })
  jnr?: string[];

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  abstract?: string;

  @Field(() => String, { nullable: true })
  published_date?: string;

  @Field(() => String, { nullable: true })
  date?: string;

  @Field(() => Boolean, { nullable: true })
  is_board_ruling?: boolean;

  @Field(() => Boolean, { nullable: true })
  is_brought_to_court?: boolean;

  @Field(() => String, { nullable: true })
  authority?: string;

  @Field(() => String, { nullable: true })
  body?: string;

  @Field(() => [Document], { nullable: true })
  attachments?: Document[];

  @Field(() => [Document], { nullable: true })
  documents?: Document[];
}

@ObjectType()
export class SearchResponse {
  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  elapsedMilliseconds: number;

  @Field(() => [CategoryCount])
  categoryCounts: CategoryCount[];

  @Field(() => [Publication])
  publications: Publication[];
}

@ObjectType()
export class ScrapeStatus {
  @Field(() => String)
  message: string;
}
