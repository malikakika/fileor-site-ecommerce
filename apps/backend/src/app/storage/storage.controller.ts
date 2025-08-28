import {
  BadRequestException,
  Controller,
  Delete,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StorageService } from './storage.service';

@Controller('files')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    })
  )
  async upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file');
    return this.storage.uploadPublic(file);
  }

  @Post('sign')
  async sign(@Body() body: { path?: string; url?: string }) {
    const input = body?.path || body?.url;
    if (!input) throw new BadRequestException('Missing path or url');
    return this.storage.sign(input, 3600);
  }

  @Delete()
  async remove(@Body('paths') paths?: string[]) {
    if (!Array.isArray(paths) || paths.length === 0) {
      throw new BadRequestException('Missing paths');
    }
    return this.storage.remove(paths);
  }
}
