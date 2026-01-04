import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { InventoryController } from './inventory.controller';

@Module({
  controllers: [ProductController, InventoryController],
  providers: [ProductService]
})
export class ProductModule { }
