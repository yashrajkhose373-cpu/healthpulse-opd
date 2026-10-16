package gov.hospital.smartqueue.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class DummyNotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(DummyNotificationServiceImpl.class);

    @Override
    public void sendSms(String phoneNumber, String message) {
        log.info("================== [SMS GATEWAY SIMULATION] ==================");
        log.info("TO      : {}", phoneNumber);
        log.info("MESSAGE : {}", message);
        log.info("STATUS  : SENT SUCCESSFUL (Twilio / Fast2SMS ready)");
        log.info("=============================================================");
    }

    @Override
    public void sendQueueAlert(String phoneNumber, String patientName, String tokenNo, String doctorName, String roomNo, int positionAhead, int estimatedMinutes) {
        String msg = String.format(
            "Namaskar %s, your Token [%s] for Dr. %s (Room %s) is nearing. %d patient(s) ahead. Est. wait: ~%d mins. Please be near the room.",
            patientName, tokenNo, doctorName, roomNo, positionAhead, estimatedMinutes
        );
        sendSms(phoneNumber, msg);
    }
}
