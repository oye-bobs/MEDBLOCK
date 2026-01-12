import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  Sse,
  MessageEvent,
  UnauthorizedException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { DidAuthGuard } from '../identity/guards/did-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationStatus } from '../database/entities';
import { Observable, fromEvent, map, filter } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(DidAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly jwtService: JwtService,
  ) {}

  @Sse('stream')
  @ApiOperation({ summary: 'Subscribe to real-time events (SSE)' })
  stream(@Query('token') token: string): Observable<MessageEvent> {
    if (!token) {
      throw new UnauthorizedException('Token required for real-time stream');
    }

    try {
      const payload = this.jwtService.verify(token);
      const userDid = payload.did;

      return fromEvent(this.eventEmitter, 'user.status.changed').pipe(
        filter((payload: any) => payload.did === userDid),
        map((payload: any) => ({
          data: {
            type: 'USER_STATUS_CHANGED',
            active: payload.active,
            timestamp: payload.timestamp,
          },
        } as MessageEvent)),
      );
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Sse('global-stream')
  @ApiOperation({ summary: 'Subscribe to global real-time notifications (SSE)' })
  globalStream(@Query('token') token: string): Observable<MessageEvent> {
    if (!token) {
      throw new UnauthorizedException('Token required for real-time stream');
    }

    try {
      const payload = this.jwtService.verify(token);
      const userDid = payload.did;

      return fromEvent(this.eventEmitter, 'notification.created').pipe(
        filter((payload: any) => payload.recipientDid === userDid),
        map((payload: any) => ({
          data: {
            type: 'NOTIFICATION',
            notification: payload.notification,
          },
        } as MessageEvent)),
      );
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for the current user' })
  async getNotifications(
    @Request() req,
    @Query('status') status?: NotificationStatus,
  ) {
    return this.notificationsService.getNotifications(req.user.did, status);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.did);
    return { count };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.did);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.did);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  async deleteNotification(@Param('id') id: string, @Request() req) {
    await this.notificationsService.deleteNotification(id, req.user.did);
    return { message: 'Notification deleted' };
  }
}
