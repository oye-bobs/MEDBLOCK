import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePractitionerDto {
    @ApiProperty({ example: 'Dr. John Doe' })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({ example: 'doctor@hospital.com' })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'MD-12345678' })
    @IsString()
    @IsOptional()
    licenseNumber?: string;

    @ApiProperty({ example: 'Cardiology' })
    @IsString()
    @IsOptional()
    specialty?: string;

    @ApiProperty({ example: 'General Hospital' })
    @IsString()
    @IsOptional()
    hospitalName?: string;
}
