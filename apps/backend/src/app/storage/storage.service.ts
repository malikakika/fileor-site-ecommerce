import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { extname } from 'path';
import { supabaseAdmin } from '../../supabase/supabase.client';

function randomName() {
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}
function sanitizeBase(name: string) {
  return (
    name
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .slice(0, 50) || 'file'
  );
}

@Injectable()
export class StorageService {
  private readonly bucket = process.env.SUPABASE_BUCKET || 'public';

  private normalizeKey(input: string): string {
    let key = (input || '').trim();

    key = key.replace(
      /^https?:\/\/[^/]+\/storage\/v1\/object\/(?:public|sign)\/[^/]+\//i,
      ''
    );

    key = key.replace(/^\/+/, '');

    if (key.startsWith(`${this.bucket}/`)) {
      key = key.slice(this.bucket.length + 1);
    }
    return key;
  }

  async uploadPublic(file: Express.Multer.File) {
    const ext = extname(file.originalname) || '.bin';
    const base = sanitizeBase(file.originalname);
    const key = `${randomName()}-${base}${ext}`;

    const { error } = await supabaseAdmin.storage
      .from(this.bucket)
      .upload(key, file.buffer, {
        contentType: file.mimetype || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Upload failed: ${error.message} (bucket=${this.bucket}, key=${key})`
      );
    }

    const { data } = supabaseAdmin.storage.from(this.bucket).getPublicUrl(key);
    if (!data?.publicUrl) {
      throw new InternalServerErrorException(
        'No public URL returned by Supabase'
      );
    }

    return { url: data.publicUrl, path: key };
  }

  async sign(input: string, expiresInSeconds = 3600) {
    const key = this.normalizeKey(input);
    const { data, error } = await supabaseAdmin.storage
      .from(this.bucket)
      .createSignedUrl(key, expiresInSeconds);

    if (error || !data?.signedUrl) {
      throw new InternalServerErrorException(
        `Sign failed: ${error?.message || 'unknown'} (bucket=${
          this.bucket
        }, key=${key})`
      );
    }
    return { url: data.signedUrl };
  }

  async remove(inputs: string[]) {
    const keys = inputs.map((p) => this.normalizeKey(p));
    const { error } = await supabaseAdmin.storage
      .from(this.bucket)
      .remove(keys);
    if (error) {
      throw new InternalServerErrorException(
        `Remove failed: ${error.message} (bucket=${
          this.bucket
        }, keys=${keys.join(',')})`
      );
    }
    return { ok: true, count: keys.length };
  }
}
