import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Prisma,
  Publication as PublicationEntity,
  Document as DocumentEntity,
  Link as LinkEntity,
} from '@prisma/client';
import { Publication as PublicationModel } from './publication.model';
import { tryCatch } from 'src/utils/try-catch';
import { PublicationFilterInput } from './publication.types';
import { formatPublicationFilter } from './publication.helpers';

@Injectable()
export class PublicationService {
  private readonly logger = new Logger(PublicationService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(
    filter?: PublicationFilterInput,
    skip?: number,
    take?: number,
  ): Promise<{ items: PublicationModel[]; total: number }> {
    const where = filter ? formatPublicationFilter(filter) : undefined;

    const [publications, total] = await Promise.all([
      this.prisma.publication.findMany({
        where,
        include: {
          attachments: true,
          documents: true,
          links: true,
        },
        skip,
        take,
      }),
      this.prisma.publication.count({ where }),
    ]);

    return {
      items: publications.map((pub) => this.mapDatabaseToModel(pub)),
      total,
    };
  }

  async findOne(id: string): Promise<PublicationModel | null> {
    const publication = await this.prisma.publication.findUnique({
      where: { id },
      include: {
        attachments: true,
        documents: true,
        links: true,
      },
    });

    if (!publication) return null;

    return this.mapDatabaseToModel(publication);
  }

  async upsert(data: PublicationModel): Promise<PublicationModel> {
    // Convert date strings to Date objects
    const createData = this.mapModelToCreateInput(data);

    const upsertResult = this.prisma.publication.upsert({
      where: { id: data.id },
      create: createData,
      update: createData,
      include: {
        attachments: true,
        documents: true,
        links: true,
      },
    });

    const [publication, upsertError] = await tryCatch(
      Promise.resolve(upsertResult),
    );

    if (upsertError) {
      this.logger.error(`Failed to upsert publication: ${upsertError.message}`);
      throw new Error(`Failed to upsert publication: ${upsertError.message}`);
    }

    return this.mapDatabaseToModel(publication);
  }

  private mapModelToCreateInput(data: PublicationModel) {
    const publishedDate = new Date(data.published_date);
    const date = new Date(data.date);

    const createData: Prisma.PublicationCreateInput = {
      id: data.id,
      categories: data.categories || [],
      jnr: data.jnr || [],
      title: data.title,
      published_date: publishedDate,
      date: date,
      body: data.body,
      documents: data.documents
        ? {
            connectOrCreate: data.documents.map((doc) => ({
              where: { file: doc.file },
              create: {
                file: doc.file,
                title: doc.title || doc.file,
              },
            })),
          }
        : undefined,
      attachments: data.attachments
        ? {
            connectOrCreate: data.attachments.map((att) => ({
              where: { file: att.file },
              create: {
                file: att.file,
                title: att.title || att.file,
              },
            })),
          }
        : undefined,
      links: data.links
        ? {
            connectOrCreate: data.links.map((link) => ({
              where: { link_unique: { url: link.url, publicationId: data.id } },
              create: {
                url: link.url,
                title: link.title || link.url,
              },
            })),
          }
        : undefined,
    };

    return createData;
  }

  // Helper method to map database entities to the API model
  private mapDatabaseToModel(
    publication: PublicationEntity & {
      documents: DocumentEntity[];
      attachments: DocumentEntity[];
      links: LinkEntity[];
    },
  ): PublicationModel {
    return {
      ...publication,
      published_date: publication.published_date.toISOString(),
      date: publication.date.toISOString(),
      attachments: publication.attachments.map((att) => ({
        file: att.file,
        title: att.title,
      })),
      documents: publication.documents.map((doc) => ({
        file: doc.file,
        title: doc.title,
      })),
      links: publication.links.map((link) => ({
        title: link.title,
        url: link.url,
      })),
    };
  }
}
