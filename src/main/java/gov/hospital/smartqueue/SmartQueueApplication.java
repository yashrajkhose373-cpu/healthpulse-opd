package gov.hospital.smartqueue;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartQueueApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartQueueApplication.class, args);
        System.out.println("=================================================================");
        System.out.println(" Smart Hospital Queue Management System Started Successfully! ");
        System.out.println(" Public Live Display Board: http://localhost:8080/display       ");
        System.out.println(" Main Portal:               http://localhost:8080/              ");
        System.out.println(" Login Page:                http://localhost:8080/login         ");
        System.out.println("=================================================================");
    }
}
