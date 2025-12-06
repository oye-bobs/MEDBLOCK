import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
    @ApiProperty({ example: [{ given: ['John'], family: 'Doe' }] })
    @IsArray()
    @IsNotEmpty()
    name: any[];

    @ApiProperty({ example: 'male', enum: ['male', 'female', 'other', 'unknown'] })
    @IsOptional()
    gender: any;

    @ApiProperty({ example: '1990-01-01', required: false })
    @IsString()
    @IsOptional()
    birth_date?: string;

    @ApiProperty({ example: [{ system: 'email', value: 'john@example.com' }], required: false })
    @IsArray()
    @IsOptional()
    telecom?: any[];

    @ApiProperty({ example: [], required: false })
    @IsArray()
    @IsOptional()
    address?: any[];
}
