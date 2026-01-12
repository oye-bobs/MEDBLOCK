import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { AdminRole } from '../database/entities/admin-user.entity';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() body: any) {
    try {
      return await this.adminService.login(body.email, body.password);
    } catch (error) {
      console.error('Admin Login Error:', error);
      throw error;
    }
  }

  @Get('stats')
  @UseGuards(AdminAuthGuard)
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @UseGuards(AdminAuthGuard)
  async getUsers(@Query('role') role: string, @Query('query') query: string) {
    return this.adminService.getUsers(role, query);
  }

  @Patch('users/:type/:id/status')
  @UseGuards(AdminAuthGuard)
  async toggleUserStatus(
    @Param('type') type: 'patient' | 'provider',
    @Param('id') id: string,
    @Body('active') active: boolean,
    @Request() req
  ) {
    return this.adminService.toggleUserStatus(type, id, active, req.user.sub);
  }

  @Get('logs')
  @UseGuards(AdminAuthGuard)
  async getLogs() {
    return this.adminService.getAdminLogs();
  }
  
  @Get('health')
  @UseGuards(AdminAuthGuard)
  async getHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('provider-stats')
  @UseGuards(AdminAuthGuard)
  async getProviderStats() {
    return this.adminService.getProviderStats();
  }
}
