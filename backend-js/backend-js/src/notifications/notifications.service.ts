import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationType,
  NotificationStatus,
  Patient,
  Practitioner,
} from '../database/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
    @InjectRepository(Practitioner)
    private practitionerRepo: Repository<Practitioner>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new notification
   */
  async createNotification(data: {
    type: NotificationType;
    title: string;
    message: string;
    recipientDid: string;
    metadata?: Record<string, any>;
    relatedEntityId?: string;
    relatedEntityType?: string;
  }): Promise<Notification> {
    // Find recipient (patient or practitioner)
    const patient = await this.patientRepo.findOne({
      where: { did: data.recipientDid },
    });
    const practitioner = await this.practitionerRepo.findOne({
      where: { did: data.recipientDid },
    });

    const notification = this.notificationRepo.create({
      type: data.type,
      title: data.title,
      message: data.message,
      recipientDid: data.recipientDid,
      patient: patient || undefined,
      practitioner: practitioner || undefined,
      metadata: data.metadata,
      relatedEntityId: data.relatedEntityId,
      relatedEntityType: data.relatedEntityType,
      status: NotificationStatus.UNREAD,
    });

    const saved = await this.notificationRepo.save(notification);
    this.logger.log(
      `Notification created: ${saved.type} for ${data.recipientDid}`,
    );

    // Emit event for real-time notification
    this.eventEmitter.emit('notification.created', {
      recipientDid: data.recipientDid,
      notification: saved,
    });

    return saved;
  }

  /**
   * Get all notifications for a user
   */
  async getNotifications(
    userDid: string,
    status?: NotificationStatus,
  ): Promise<Notification[]> {
    const where: any = { recipientDid: userDid };
    if (status) {
      where.status = status;
    }

    return this.notificationRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userDid: string): Promise<number> {
    return this.notificationRepo.count({
      where: {
        recipientDid: userDid,
        status: NotificationStatus.UNREAD,
      },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string,
    userDid: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId, recipientDid: userDid },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();

    return this.notificationRepo.save(notification);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userDid: string): Promise<void> {
    await this.notificationRepo.update(
      { recipientDid: userDid, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ, readAt: new Date() },
    );
  }

  /**
   * Delete notification
   */
  async deleteNotification(
    notificationId: string,
    userDid: string,
  ): Promise<void> {
    await this.notificationRepo.delete({
      id: notificationId,
      recipientDid: userDid,
    });
  }

  /**
   * Helper: Notify consent request
   */
  async notifyConsentRequest(
    patientDid: string,
    providerDid: string,
    consentId: string,
    providerName?: string,
  ): Promise<void> {
    await this.createNotification({
      type: NotificationType.CONSENT_REQUEST,
      title: 'New Access Request',
      message: `${providerName || 'A healthcare provider'} is requesting access to your medical records.`,
      recipientDid: patientDid,
      relatedEntityId: consentId,
      relatedEntityType: 'consent',
      metadata: { providerDid, providerName },
    });
  }

  /**
   * Helper: Notify consent approved
   */
  async notifyConsentApproved(
    providerDid: string,
    patientDid: string,
    consentId: string,
    patientName?: string,
  ): Promise<void> {
    await this.createNotification({
      type: NotificationType.CONSENT_APPROVED,
      title: 'Access Request Approved',
      message: `${patientName || 'A patient'} has approved your access request.`,
      recipientDid: providerDid,
      relatedEntityId: consentId,
      relatedEntityType: 'consent',
      metadata: { patientDid, patientName },
    });
  }

  /**
   * Helper: Notify consent rejected
   */
  async notifyConsentRejected(
    recipientDid: string,
    rejectorDid: string,
    consentId: string,
    rejectorName?: string,
  ): Promise<void> {
    await this.createNotification({
      type: NotificationType.CONSENT_REJECTED,
      title: 'Access Request Rejected',
      message: `${rejectorName || 'The user'} has rejected your access request.`,
      recipientDid: recipientDid,
      relatedEntityId: consentId,
      relatedEntityType: 'consent',
      metadata: { rejectorDid, rejectorName },
    });
  }

  /**
   * Helper: Notify consent revoked
   */
  async notifyConsentRevoked(
    providerDid: string,
    patientDid: string,
    consentId: string,
    patientName?: string,
  ): Promise<void> {
    await this.createNotification({
      type: NotificationType.CONSENT_REVOKED,
      title: 'Access Revoked',
      message: `${patientName || 'A patient'} has revoked your access to their medical records.`,
      recipientDid: providerDid,
      relatedEntityId: consentId,
      relatedEntityType: 'consent',
      metadata: { patientDid, patientName },
    });
  }

  /**
   * Helper: Notify provider of patient's interoperability request
   */
  async notifyPatientInteroperabilityRequest(
    providerDid: string,
    patientDid: string,
    consentId: string,
    patientName?: string,
  ): Promise<void> {
    await this.createNotification({
      type: NotificationType.CONSENT_REQUEST, // Reuse type or add new one? CONSTENT_REQUEST seems fine
      title: 'Incoming Patient Connection',
      message: `${patientName || 'A patient'} is requesting to connect with your facility.`,
      recipientDid: providerDid,
      relatedEntityId: consentId,
      relatedEntityType: 'consent',
      metadata: { patientDid, patientName, initiatedBy: 'patient' },
    });
  }

  /**
   * Helper: Notify patient of provider's approval
   */
  async notifyProviderInteroperabilityApproval(
    patientDid: string,
    providerDid: string,
    consentId: string,
    providerName?: string,
  ): Promise<void> {
    await this.createNotification({
      type: NotificationType.CONSENT_APPROVED,
      title: 'Connection Accepted',
      message: `${providerName || 'A healthcare provider'} has accepted your connection request.`,
      recipientDid: patientDid,
      relatedEntityId: consentId,
      relatedEntityType: 'consent',
      metadata: { providerDid, providerName, initiatedBy: 'patient' },
    });
  }
}
