import { Module } from '@nestjs/common';
import { PublicationService } from './publication.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PublicationResolver } from './publication.resolver';

@Module({
  imports: [PrismaModule],
  providers: [PublicationService, PublicationResolver],
  exports: [PublicationService],
})
export class PublicationModule {}
