import { Product } from './../../products/entities/product.entity';
import { IsString } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text',{
    unique: true, 
  })
  email: string;

  @Column('text', {
    select: false
  })
  password: string;

  @Column('text')
  fullName: string;

  @Column('bool',{
    default: true
  })
  isActive: boolean;

  @Column('text',{
    default: ['user'],
    array: true,

  })
  roles:string[];

  @OneToMany(
    ()=> Product,
    (product) => product.user,
  )
  products: Product[]

  @BeforeInsert()
  checkField(){
    this.email = this.email.toLocaleLowerCase().trim()
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate(){
    this.checkField()
  }

}
