import { IsString, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class CreateTestimonialDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    role?: string;

    @IsString()
    content: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating?: number = 5;

    @IsOptional()
    @IsString()
    avatarUrl?: string;
}

export class UpdateTestimonialDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    role?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating?: number;

    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
