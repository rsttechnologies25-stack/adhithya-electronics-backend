import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateBranchReviewDto {
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    body?: string;
}

export class AdminReplyDto {
    @IsString()
    @IsNotEmpty()
    reply: string;
}

export class CreateBranchDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    area: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    googleMapsEmbed?: string;

    @IsOptional()
    @IsString()
    openingTime?: string;

    @IsOptional()
    @IsString()
    closingTime?: string;

    @IsOptional()
    @IsString()
    workingDays?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    isActive?: boolean;
}

export class UpdateBranchDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    area?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    googleMapsEmbed?: string;

    @IsOptional()
    @IsString()
    openingTime?: string;

    @IsOptional()
    @IsString()
    closingTime?: string;

    @IsOptional()
    @IsString()
    workingDays?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    isActive?: boolean;
}
