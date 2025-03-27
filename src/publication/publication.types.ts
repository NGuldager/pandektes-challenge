import { ObjectType, Field, ID } from '@nestjs/graphql';

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
