import { IsString, IsOptional, IsNumber, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum SortOrder {
    RELEVANCE = 'relevance',
    PRICE_LOW_HIGH = 'price_low_high',
    PRICE_HIGH_LOW = 'price_high_low',
    NEWEST = 'newest',
    RATING = 'rating',
}

export class ProductFilterDto {
    @IsOptional()
    @IsString()
    query?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (!value) return undefined;
        if (Array.isArray(value)) return value;
        return value.split(',').map((s: string) => s.trim());
    })
    @IsArray()
    @IsString({ each: true })
    categories?: string[];

    @IsOptional()
    @Transform(({ value }) => {
        if (!value) return undefined;
        if (Array.isArray(value)) return value;
        return value.split(',').map((s: string) => s.trim());
    })
    @IsArray()
    @IsString({ each: true })
    brands?: string[];

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    minPrice?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    maxPrice?: number;

    @IsOptional()
    @IsEnum(SortOrder)
    sort?: SortOrder = SortOrder.RELEVANCE;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number = 12;
}

export class ProductMediaDto {
    @IsString()
    url: string;

    @IsOptional()
    @IsString()
    altText?: string;

    @IsOptional()
    @IsNumber()
    position?: number = 0;

    @IsOptional()
    @IsString()
    mediaType?: string = 'image';
}

export class ProductSpecificationDto {
    @IsString()
    key: string;

    @IsString()
    value: string;

    @IsOptional()
    @IsString()
    group?: string;
}

export class CreateProductDto {
    @IsString()
    sku: string;

    @IsString()
    name: string;

    @IsString()
    slug: string;

    @IsOptional()
    @IsString()
    shortDescription?: string;

    @IsOptional()
    @IsString()
    longDescription?: string;

    @IsNumber()
    basePrice: number;

    @IsOptional()
    @IsNumber()
    compareAtPrice?: number;

    @IsOptional()
    @IsString()
    brand?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    status?: string = 'published';

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductMediaDto)
    media?: ProductMediaDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductSpecificationDto)
    specs?: ProductSpecificationDto[];
}
