import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configurar CORS
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://trace-fleet.vercel.app',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (ej: curl, Swagger, Postman)
      if (!origin) return callback(null, true);
      // Permitir el dominio de producción y los previews automáticos de Vercel
      if (
        allowedOrigins.includes(origin) ||
        /^https:\/\/trace-fleet-.*\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS bloqueado para origen: ${origin}`), false);
    },
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

  // El backend escuchará en el puerto que Render asigne, o 3000 en local
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Servidor backend corriendo en el puerto: ${port}`);
  console.log(
    `📚 Documentación Swagger disponible en: http://localhost:3000/api`,
  );
}
bootstrap();
