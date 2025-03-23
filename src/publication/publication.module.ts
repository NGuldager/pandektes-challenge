import { Module } from '@nestjs/common';
import { PublicationService } from './publication.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PublicationService],
  exports: [PublicationService],
})
export class PublicationModule {}
