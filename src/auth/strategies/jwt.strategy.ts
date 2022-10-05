import { JwtFromRequestFunction } from './../../../node_modules/@types/passport-jwt/index.d';
import { ConfigService } from '@nestjs/config';

import  {PassportStrategy } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm';
import {Strategy,  ExtractJwt } from 'passport-jwt'
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity'
import { JwtPayload } from '../interfaces/jwt-payload.interface'
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(
    @InjectRepository(User)
    private readonly useRepository : Repository<User>,

    configService: ConfigService
  ){
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    })
  }

  async validate(payload : JwtPayload) : Promise<User>{

    const {id} = payload;

    const user = await this.useRepository.findOneBy({id})

    if(!user) throw new UnauthorizedException('Token not valid')

    if(!user.isActive) throw new UnauthorizedException('User is inactive , talk with an admin')


    return  user;
  }

}