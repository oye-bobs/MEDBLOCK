import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
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

  @ApiProperty({ example: 'General Hospital Lagos' })
  @IsString()
  @IsNotEmpty()
  hospitalName: string;

  @ApiProperty({ example: 'General Hospital' })
  @IsString()
  @IsNotEmpty()
  hospitalType: string;

  @ApiProperty({ example: 'Cardiology' })
  @IsString()
  @IsNotEmpty()
  specialty: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'MD-12345678', required: false })
  @IsString()
  @IsOptional()
  licenseNumber?: string;
}
