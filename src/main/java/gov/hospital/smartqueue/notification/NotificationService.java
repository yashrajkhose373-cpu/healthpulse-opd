package gov.hospital.smartqueue.notification;

public interface NotificationService {
    void sendSms(String phoneNumber, String message);
    void sendQueueAlert(String phoneNumber, String patientName, String tokenNo, String doctorName, String roomNo, int positionAhead, int estimatedMinutes);
}
