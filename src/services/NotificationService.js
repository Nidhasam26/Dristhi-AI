/**
 * Notification Service Architecture
 *
 * Provides extensible adapter interfaces for SMS and WhatsApp Business reminders.
 * If external provider credentials or backend endpoints are not configured,
 * it safely registers notifications in IndexedDB with status 'NOT_CONFIGURED'
 * and avoids fabricating delivery receipts.
 */

import { getDB, generateClientId } from '../data/db.js';

export const NotificationStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  NOT_CONFIGURED: 'NOT_CONFIGURED',
};

class NotificationService {
  constructor() {
    this.smsProvider = import.meta.env.VITE_SMS_PROVIDER || '';
    this.whatsappProvider = import.meta.env.VITE_WHATSAPP_PROVIDER || '';
    this.apiUrl = import.meta.env.VITE_API_URL || '';
  }

  isConfigured() {
    return !!(this.apiUrl && (this.smsProvider || this.whatsappProvider));
  }

  getProviderInfo() {
    return {
      smsProvider: this.smsProvider || 'Not Configured',
      whatsappProvider: this.whatsappProvider || 'Not Configured',
      isConfigured: this.isConfigured(),
    };
  }

  /**
   * Schedule SMS / WhatsApp appointment reminders.
   * @param {Object} appointment
   * @param {'24h'|'2h'|'both'} timing
   */
  async scheduleAppointmentReminders(appointment, timing = 'both') {
    const db = await getDB();
    const reminders = [];

    if (timing === '24h' || timing === 'both') {
      reminders.push({
        id: generateClientId('notif'),
        appointment_id: appointment.id,
        patient_name: appointment.patientName,
        patient_phone: appointment.patientPhone,
        appointment_date: appointment.date,
        appointment_time: appointment.time,
        doctor_name: appointment.doctorName,
        reminder_type: '24h',
        channel: 'SMS_AND_WHATSAPP',
        status: this.isConfigured() ? NotificationStatus.PENDING : NotificationStatus.NOT_CONFIGURED,
        created_at: new Date().toISOString(),
        provider_message_id: null,
        error: this.isConfigured() ? null : 'Notification provider not configured in environment.',
      });
    }

    if (timing === '2h' || timing === 'both') {
      reminders.push({
        id: generateClientId('notif'),
        appointment_id: appointment.id,
        patient_name: appointment.patientName,
        patient_phone: appointment.patientPhone,
        appointment_date: appointment.date,
        appointment_time: appointment.time,
        doctor_name: appointment.doctorName,
        reminder_type: '2h',
        channel: 'SMS_AND_WHATSAPP',
        status: this.isConfigured() ? NotificationStatus.PENDING : NotificationStatus.NOT_CONFIGURED,
        created_at: new Date().toISOString(),
        provider_message_id: null,
        error: this.isConfigured() ? null : 'Notification provider not configured in environment.',
      });
    }

    for (const rem of reminders) {
      await db.put('notifications', rem);
    }

    return {
      scheduled: reminders.length,
      configured: this.isConfigured(),
      status: this.isConfigured() ? 'Queued for dispatch' : 'Notification provider not configured',
      records: reminders,
    };
  }

  /**
   * Get all logged notification records for an appointment or clinic.
   */
  async getNotificationsForAppointment(appointmentId) {
    const db = await getDB();
    return db.getAllByIndex('notifications', 'appointment_id', appointmentId);
  }

  async getAllNotifications() {
    const db = await getDB();
    return db.getAll('notifications');
  }
}

export const notificationService = new NotificationService();
