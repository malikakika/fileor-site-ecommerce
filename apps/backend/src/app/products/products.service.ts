import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, Not } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../categories/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { StorageService } from '../storage/storage.service'; 

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    @InjectRepository(Category)
    private readonly cats: Repository<Category>,
    private readonly storage: StorageService, 
  ) {}

async findAll(filter?: { isBestSeller?: boolean }) {
  const where = filter?.isBestSeller ? { isBestSeller: true } : {};

  const products = await this.repo.find({
    where,
    relations: { category: true },
  });

  return Promise.all(
    products.map(async (p) => {
      p.images = await this.signImages(p.images);
      return p;
    }),
  );
}

  async create(dto: CreateProductDto) {
    const exists = await this.repo.exist({ where: { slug: dto.slug } });
    if (exists) throw new BadRequestException('Slug already exists');

    let category: Category | undefined;
    if (dto.categoryId) {
      const found = await this.cats.findOne({ where: { id: dto.categoryId } });
      if (!found) throw new NotFoundException('Category not found');
      category = found;
    }

    const images = Array.isArray(dto.images) ? dto.images.filter(Boolean) : [];

    const partial: DeepPartial<Product> = {
      title: dto.title,
      slug: dto.slug,
      priceCents: dto.priceCents,
      currency: dto.currency ?? 'EUR',
      description: dto.description ?? undefined,
      images,
      category,
        isBestSeller: dto.isBestSeller ?? false,
    };

    const product = this.repo.create(partial);
    const saved = await this.repo.save(product);

    saved.images = await this.signImages(saved.images);
    return saved;
  }

  async findOneBySlug(slug: string) {
    const product = await this.repo.findOne({
      where: { slug },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException('Product not found');

    product.images = await this.signImages(product.images);
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    if (dto.slug) {
      const exists = await this.repo.exist({
        where: { slug: dto.slug, id: Not(id) },
      });
      if (exists) throw new BadRequestException('Slug already exists');
    }

    let category: Category | null | undefined = product.category;
    if (dto.categoryId !== undefined) {
      if (dto.categoryId === null) {
        category = null;
      } else {
        const found = await this.cats.findOne({ where: { id: dto.categoryId } });
        if (!found) throw new NotFoundException('Category not found');
        category = found;
      }
    }

    const images = Array.isArray(dto.images)
      ? dto.images.filter(Boolean)
      : undefined;

    const patch: DeepPartial<Product> = {
      title: dto.title ?? product.title,
      slug: dto.slug ?? product.slug,
      priceCents: dto.priceCents ?? product.priceCents,
      currency: dto.currency ?? product.currency,
      description:
        dto.description === undefined
          ? product.description
          : dto.description ?? undefined,
      images: images ?? product.images,
      category:
        category === undefined ? product.category : category || undefined,
         isBestSeller:
    dto.isBestSeller === undefined
      ? product.isBestSeller
      : dto.isBestSeller,
    };

    const merged = this.repo.merge(product, patch);
    const updated = await this.repo.save(merged);

    updated.images = await this.signImages(updated.images);
    return updated;
  }

  async remove(id: string) {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.repo.remove(product);
  }

  private async signImages(images?: string[] | null): Promise<string[]> {
    if (!images?.length) return [];
    const signed = await Promise.all(
      images.map(async (path) => {
        try {
          const { url } = await this.storage.sign(path);
          return url;
        } catch {
          return path; 
        }
      }),
    );
    return signed;
  }
}
