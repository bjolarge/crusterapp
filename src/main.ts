import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe, VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   const config = new DocumentBuilder()
    .setTitle('KoinSave Project')
    .setDescription('The endpoints in this app power: authentication and transfers')
    .setVersion('1.0')
    .addTag('koinsave')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

   //Here we have the cookie
   app.use(cookieParser());
   app.useGlobalPipes(
     new ValidationPipe({
       whitelist: true,
       transform: true,
       //added this to aid debugging
       exceptionFactory: (errors) => {
         console.log('Validation errors:', errors);
         const messages = errors
           .map(
             (err) =>
               `${err.property}: ${Object.values(err.constraints).join(', ')}`,
           )
           .join('; ');
         return new BadRequestException(`Validation failed: ${messages}`);
       },
       forbidNonWhitelisted: true,
       transformOptions: {
         enableImplicitConversion: true,
       },
     }),
   );

   app.useLogger(['error', 'warn', 'debug', 'verbose', 'log']);
   const configService = app.get(ConfigService);
   const PORT = +configService.get<number>('PORT');

   await app.listen(PORT ?? 3000);
}
bootstrap();   
