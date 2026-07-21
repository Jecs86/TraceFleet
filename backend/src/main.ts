import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configurar CORS (Crucial para que React en localhost:5173 se comunique con NestJS)
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. Configurar Swagger UI
  const config = new DocumentBuilder()
    .setTitle('TraceFleet API')
    .setDescription(
      'Documentación de la API y endpoints para el SAAS de auditoría de flotas TraceFleet.',
    )
    .setVersion('1.0')
    // Esto agregará el botón "Authorize" en Swagger para probar endpoints con JWT
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 3. Levantar la interfaz de Swagger en la ruta /api
  SwaggerModule.setup('api', app, document);

  // El backend escuchará en el puerto 3000
  await app.listen(3000);

  console.log(`🚀 Servidor backend corriendo en: http://localhost:3000`);
  console.log(
    `📚 Documentación Swagger disponible en: http://localhost:3000/api`,
  );
}
bootstrap();
