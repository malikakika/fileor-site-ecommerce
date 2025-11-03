import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Favorite } from '../favorites/favorite.entity';

export type Role = 'ADMIN' | 'CUSTOMER';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Exclude()
  @Column()
  password!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ type: 'varchar', default: 'CUSTOMER' })
  role!: Role;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;

  @Column({
    type: 'timestamptz',
    default: () => 'now()',
    onUpdate: 'now()',
  })
  updatedAt!: Date;

  @OneToMany(() => Favorite, (favorite) => favorite.user, {
    cascade: true,
  })
  favorites!: Favorite[];
}
