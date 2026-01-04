import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { ProductModule } from './product/product.module';
import { BranchModule } from './branch/branch.module';
import { CategoryModule } from './category/category.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { PartnerModule } from './partner/partner.module';
import { AdminStatsModule } from './admin/admin-stats.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    CartModule,
    ProductModule,
    BranchModule,
    CategoryModule,
    TestimonialModule,
    PartnerModule,
    AdminStatsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: any, res: any, next: any) => {
        console.log(`[REQ] ${req.method} ${req.url}`);
        res.on('finish', () => {
          console.log(`[RES] ${req.method} ${req.url} - ${res.statusCode}`);
        });
        next();
      })
      .forRoutes('*');
  }
}
