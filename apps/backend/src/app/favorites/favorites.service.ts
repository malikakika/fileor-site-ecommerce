import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly repo: Repository<Favorite>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  async findAllByUser(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });
  }

async addFavorite(user: User, productId: string) {
  const product = await this.products.findOne({ where: { id: productId } });
  if (!product) throw new NotFoundException('Produit introuvable');

  const exists = await this.repo.exist({
    where: { user: { id: user.id }, product: { id: productId } },
  });
  if (exists) return { ok: true };

  try {

    const favorite = this.repo.create({
      user: { id: user.id } as User,     
      product: { id: product.id } as Product, 
    });

    console.log('📦 Objet favori prêt à sauvegarder:', favorite);

    await this.repo.save(favorite);

    console.log(' Favori enregistré avec succès');
    return { ok: true };
  } catch (error) {
    throw new InternalServerErrorException('Erreur enregistrement favori');
  }
}



  async removeFavorite(userId: string, productId: string) {
    const favorite = await this.repo.findOne({
      where: { user: { id: userId }, product: { id: productId } },
      relations: ['user', 'product'],
    });
    if (!favorite) return { ok: true };
    await this.repo.remove(favorite);
    return { ok: true };
  }
}
