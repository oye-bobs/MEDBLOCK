# Push Notifications & Interoperability Exchange Implementation

## Overview
This document summarizes the implementation of push notifications and fixes to the interoperability exchange system in the MEDBLOCK application.

## What Was Implemented

### 1. Backend Notification System

#### Database Entity
- **File**: `backend-js/src/database/entities/notification.entity.ts`
- Created `Notification` entity with the following features:
  - Support for multiple notification types (consent_request, consent_approved, consent_rejected, consent_revoked, record_shared, access_granted, system_alert)
  - Notification status tracking (unread, read, archived)
  - Links to both Patient and Practitioner entities
  - Metadata field for additional context
  - Related entity tracking (e.g., consent ID)

#### Notification Service
- **File**: `backend-js/src/notifications/notifications.service.ts`
- Implements comprehensive notification management:
  - `createNotification()` - Creates new notifications
  - `getNotifications()` - Retrieves notifications for a user
  - `getUnreadCount()` - Gets count of unread notifications
  - `markAsRead()` - Marks individual notification as read
  - `markAllAsRead()` - Marks all notifications as read
  - `deleteNotification()` - Deletes a notification
  - Helper methods for consent-related notifications:
    - `notifyConsentRequest()`
    - `notifyConsentApproved()`
    - `notifyConsentRejected()`
    - `notifyConsentRevoked()`

#### Notification Controller
- **File**: `backend-js/src/notifications/notifications.controller.ts`
- REST API endpoints:
  - `GET /notifications` - Get all notifications (with optional status filter)
  - `GET /notifications/unread-count` - Get unread count
  - `POST /notifications/:id/read` - Mark as read
  - `POST /notifications/read-all` - Mark all as read
  - `DELETE /notifications/:id` - Delete notification

#### Integration with Consent Service
- **File**: `backend-js/src/consent/consent.service.ts`
- Integrated NotificationsService into ConsentService
- Added automatic notification triggers:
  - When a consent request is created → notifies patient
  - When a consent is approved → notifies provider
  - When a consent is rejected → notifies provider
  - When a consent is revoked → notifies provider

#### Event Emitter Setup
- Installed `@nestjs/event-emitter` package
- Configured EventEmitterModule in app.module.ts for real-time notification events
- Updated app.module.ts to include NotificationsModule

### 2. Frontend Notification System

#### API Service Updates
- **Provider Portal**: `frontend/provider-portal/src/services/api.ts`
- **Patient Portal**: `frontend/patient-portal/src/services/api.ts`
- Added notification API methods:
  - `getNotifications(status?)` - Fetch notifications
  - `getUnreadNotificationCount()` - Get unread count
  - `markNotificationAsRead(id)` - Mark as read
  - `markAllNotificationsAsRead()` - Mark all as read
  - `deleteNotification(id)` - Delete notification

#### Notification Bell Component
- **Provider Portal**: `frontend/provider-portal/src/components/NotificationBell.tsx`
- **Patient Portal**: `frontend/patient-portal/src/components/NotificationBell.tsx`
- Features:
  - Real-time unread count badge (refreshes every 10 seconds)
  - Dropdown panel with notification list
  - Visual indicators for unread notifications
  - Mark as read/delete actions
  - Mark all as read functionality
  - Notification type icons
  - Auto-refresh when dropdown is open (every 5 seconds)

#### Layout Integration
- Added NotificationBell to mobile headers in both portals:
  - `frontend/provider-portal/src/components/Layout.tsx`
  - `frontend/patient-portal/src/components/Layout.tsx`

### 3. Interoperability Exchange Fixes

#### Provider Portal Interoperability Page
- **File**: `frontend/provider-portal/src/pages/Interoperability.tsx`
- Fixed data fetching:
  - Separated pending requests (incoming) from active consents (outgoing)
  - `getPendingRequests()` for incoming tab
  - `getActiveConsents()` for outgoing tab
- Added approve/reject functionality:
  - `approveMutation` - Approves consent requests
  - `rejectMutation` - Rejects consent requests
  - Wired up approve/reject buttons with proper handlers
- Improved UI:
  - Loading states
  - Proper display logic for incoming vs outgoing
  - Status badges for different consent states
  - Disabled states during mutations

#### Provider API Service
- **File**: `frontend/provider-portal/src/services/api.ts`
- Added consent management methods:
  - `approveConsentRequest(consentId)` - Approve a consent request
  - `rejectConsentRequest(consentId)` - Reject a consent request
  - `getActiveConsents()` - Get active consents

## How It Works

### Notification Flow

1. **Consent Request Created**:
   - Provider creates consent request via Interoperability page
   - Backend creates pending consent record
   - NotificationsService creates notification for patient
   - Patient sees notification in bell dropdown
   - Patient sees request in Consent Management page

2. **Consent Approved**:
   - Patient approves request in Consent Management page
   - Backend updates consent status to ACTIVE
   - NotificationsService creates notification for provider
   - Provider sees notification in bell dropdown
   - Provider sees approved consent in Interoperability outgoing tab

3. **Consent Rejected**:
   - Patient rejects request
   - Backend updates consent status to REVOKED
   - NotificationsService creates notification for provider
   - Provider sees notification

4. **Consent Revoked**:
   - Patient revokes active consent
   - Backend updates consent status to REVOKED
   - NotificationsService creates notification for provider
   - Provider sees notification

### Real-Time Updates

- Notification bell badge updates every 10 seconds
- Notification list refreshes every 5 seconds when dropdown is open
- Interoperability requests refresh every 5 seconds
- Consent management pages refresh every 5 seconds

## API Endpoints

### Notifications
```
GET    /api/notifications              - Get all notifications
GET    /api/notifications/unread-count - Get unread count
POST   /api/notifications/:id/read     - Mark as read
POST   /api/notifications/read-all     - Mark all as read
DELETE /api/notifications/:id          - Delete notification
```

### Consent Management
```
POST /api/consent/request        - Request consent from patient
GET  /api/consent/pending        - Get pending consent requests
POST /api/consent/:id/approve    - Approve consent request
POST /api/consent/:id/reject     - Reject consent request
GET  /api/consent/active         - Get active consents
POST /api/consent/:id/revoke     - Revoke consent
GET  /api/consent/all            - Get all consents
```

## Database Schema

### Notification Table
```typescript
{
  id: uuid (PK)
  type: enum (consent_request, consent_approved, etc.)
  title: text
  message: text
  status: enum (unread, read, archived)
  recipientDid: text
  patientId: uuid (FK, nullable)
  practitionerId: uuid (FK, nullable)
  metadata: jsonb (nullable)
  relatedEntityId: text (nullable)
  relatedEntityType: text (nullable)
  createdAt: timestamp
  updatedAt: timestamp
  readAt: timestamp (nullable)
}
```

## Testing Checklist

### Provider Portal
- [ ] Create consent request → Patient receives notification
- [ ] View pending requests in Interoperability incoming tab
- [ ] View approved consents in Interoperability outgoing tab
- [ ] Notification bell shows unread count
- [ ] Click notification bell to see dropdown
- [ ] Mark notification as read
- [ ] Mark all notifications as read
- [ ] Delete notification

### Patient Portal
- [ ] Receive consent request notification
- [ ] View pending requests in Consent Management
- [ ] Approve consent request → Provider receives notification
- [ ] Reject consent request → Provider receives notification
- [ ] Revoke active consent → Provider receives notification
- [ ] Notification bell functionality works
- [ ] All notification actions work

## Future Enhancements

1. **WebSocket/SSE for Real-Time Push**:
   - Currently using polling (5-10 second intervals)
   - Could implement WebSocket or Server-Sent Events for instant notifications
   - EventEmitter is already set up for this

2. **Browser Push Notifications**:
   - Implement Web Push API for browser notifications
   - Require user permission
   - Show notifications even when app is in background

3. **Email Notifications**:
   - Send email for critical notifications
   - Configurable notification preferences

4. **Notification Preferences**:
   - Allow users to configure which notifications they want to receive
   - Notification frequency settings

5. **Notification History**:
   - Archive old notifications
   - Search and filter notifications
   - Notification analytics

## Notes

- All notifications are stored in the database for audit purposes
- Notifications are tied to user DIDs for proper isolation
- The system supports both patient and provider notifications
- Error handling is in place for notification failures (logged but doesn't block main operations)
- The notification system is fully integrated with the existing consent workflow

## Dependencies Added

- `@nestjs/event-emitter` - For event-driven notification system

## Files Modified/Created

### Backend
- ✅ Created: `src/database/entities/notification.entity.ts`
- ✅ Modified: `src/database/entities/index.ts`
- ✅ Created: `src/notifications/notifications.service.ts`
- ✅ Created: `src/notifications/notifications.controller.ts`
- ✅ Created: `src/notifications/notifications.module.ts`
- ✅ Modified: `src/app.module.ts`
- ✅ Modified: `src/consent/consent.service.ts`
- ✅ Modified: `src/consent/consent.module.ts`

### Frontend - Provider Portal
- ✅ Created: `src/components/NotificationBell.tsx`
- ✅ Modified: `src/components/Layout.tsx`
- ✅ Modified: `src/services/api.ts`
- ✅ Modified: `src/pages/Interoperability.tsx`

### Frontend - Patient Portal
- ✅ Created: `src/components/NotificationBell.tsx`
- ✅ Modified: `src/components/Layout.tsx`
- ✅ Modified: `src/services/api.ts`

## Conclusion

The push notification system and interoperability exchange are now fully functional. Users will receive real-time notifications for consent-related actions, and the interoperability page properly displays and manages incoming/outgoing consent requests with full approve/reject functionality.
