import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductFilterDto, CreateProductDto } from './product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                callback(null, `${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                return callback(new BadRequestException('Only image files are allowed!'), false);
            }
            callback(null, true);
        },
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        return {
            url: `http://localhost:5000/uploads/${file.filename}`,
            filename: file.filename,
        };
    }

    @Get()
    async findAll(@Query() filter: ProductFilterDto) {
        return this.productService.findAll(filter);
    }

    @Get('filters')
    async getFilters() {
        return this.productService.getFilters();
    }

    @Get(':slugOrId')
    async findOne(@Param('slugOrId') slugOrId: string) {
        return this.productService.findOne(slugOrId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateProductDto, @Req() req: any) {
        return this.productService.create(dto, req.user.id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>, @Req() req: any) {
        return this.productService.update(id, dto, req.user.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async delete(@Param('id') id: string, @Req() req: any) {
        return this.productService.delete(id, req.user.id);
    }
}
