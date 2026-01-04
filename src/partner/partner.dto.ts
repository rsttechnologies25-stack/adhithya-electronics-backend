import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreatePartnerDto {
    @IsString()
    name: string;

    @IsString()
    logoUrl: string;

    @IsOptional()
    @IsString()
    websiteUrl?: string;
}

export class UpdatePartnerDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    logoUrl?: string;

    @IsOptional()
    @IsString()
    websiteUrl?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
