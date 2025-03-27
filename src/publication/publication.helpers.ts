import { Prisma } from '@prisma/client';
import { PublicationFilterInput } from './publication.types';

export const formatPublicationFilter = (filter: PublicationFilterInput) => {
  const where: Prisma.PublicationWhereInput = {};

  // Filter by categories
  if (filter.categories?.contains) {
    where.categories = {
      hasSome: filter.categories.contains,
    };
  }

  // Filter by jnr
  if (filter.jnr?.contains) {
    where.jnr = {
      hasSome: filter.jnr.contains,
    };
  }

  // Filter by title
  if (filter.title?.contains) {
    where.title = {
      contains: filter.title.contains,
      mode: 'insensitive',
    };
  }

  // Filter by published_date
  if (filter.published_date) {
    where.published_date = {};

    if (filter.published_date.equals) {
      where.published_date.equals = new Date(filter.published_date.equals);
    }

    if (filter.published_date.gt) {
      where.published_date.gt = new Date(filter.published_date.gt);
    }

    if (filter.published_date.gte) {
      where.published_date.gte = new Date(filter.published_date.gte);
    }

    if (filter.published_date.lt) {
      where.published_date.lt = new Date(filter.published_date.lt);
    }

    if (filter.published_date.lte) {
      where.published_date.lte = new Date(filter.published_date.lte);
    }
  }

  // Filter by body
  if (filter.body?.contains) {
    where.body = {
      contains: filter.body.contains,
      mode: 'insensitive',
    };
  }

  return where;
};
