import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
  } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
  
  @Injectable()
  export class ApiKeyGuard implements CanActivate {
    constructor(private readonly configService:ConfigService){}
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
  
      //I gave the name I prefer api-key
      const apiKey = request.headers['api-key']; 
  
      if (!apiKey) {
        throw new UnauthorizedException('API key is missing.');
      }
  
      // call your env. var the name you want
      if (apiKey !== this.configService.get('API_KEY')) {
      // if (apiKey !== process.env.API_KEY) {
        throw new UnauthorizedException('Invalid API key.');
      }
  
      return true;
    }
  }