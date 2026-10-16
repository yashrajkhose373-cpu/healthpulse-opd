# Smart Appointment and Queue Management System for Government Hospitals

A full-stack, enterprise-grade Hospital OPD Queue Management System engineered with **Spring Boot 3**, **Spring Security (RBAC)**, **Spring Data JPA**, **WebSocket (STOMP)**, and **Thymeleaf + Bootstrap 5**.

---

## 🚀 Key Features

1. **Role-Based Portals**:
   - **Admin**: Overall hospital metrics, footfall charts, doctor load breakdown.
   - **Doctor**: Real-time queue view, "Call Next", "Complete Visit", "Mark No-Show", and diagnosis/prescription recorder.
   - **Reception**: Walk-in token generator with automated priority detection, fast patient registration, and no-show recovery.
   - **Patient**: Visit history, digital prescriptions, and live token status tracking.

2. **Smart Queue Engine**:
   - **Priority Order**: `EMERGENCY` > `SENIOR_OR_PREGNANT` > `NORMAL` (FIFO within same rank).
   - **Dynamic Waiting Time Calculation**: `(patients ahead) × (doctor's average consultation time)`.
   - **Absenteeism Handling**: One-click "No-Show" marking and re-insertion to the end of queue.

3. **Public Live Waiting Screen (`/display`)**:
   - Designed for high-definition OPD TV monitors.
   - Auto-updates via **Spring WebSocket (STOMP)** with zero screen refresh.
   - Text-to-Speech audio announcement when a token is called.

4. **Multi-Language Support (i18n)**:
   - English, Hindi (हिंदी), and Marathi (मराठी) switchable dynamically (`?lang=hi`, `?lang=mr`, `?lang=en`).

5. **SMS Notification Simulation**:
   - Pluggable `NotificationService` interface pre-configured to send alerts when turns are approaching.

---

## 🛠️ Tech Stack

- **Java Version**: Java 17+
- **Framework**: Spring Boot 3.2.5
- **Security**: Spring Security 6 (Role-Based Access Control)
- **Database**:
  - **H2 (Embedded)**: Pre-configured by default for zero-setup instant execution.
  - **MySQL 8.0+**: Supported via `--spring.profiles.active=mysql`.
- **Real-Time**: Spring WebSocket + SockJS + STOMP.
- **Frontend**: Thymeleaf templates + Bootstrap 5 + Bootstrap Icons.

---

## 🏃 Quick Start Guide

### 1. Prerequisites
- Java Development Kit (JDK 17 or higher)
- Apache Maven 3.8+ (or your favorite IDE: IntelliJ IDEA / Eclipse / VS Code)

### 2. Run the Application
Open your terminal in the project directory (`c:\Users\HP\yashraj4`) and execute:

```bash
mvn clean spring-boot:run
```

The system will start on `http://localhost:8080`.

---

## 🔑 Pre-Seeded Test Credentials

| Role | Email | Password | Direct URL |
|---|---|---|---|
| **Admin** | `admin@hospital.gov.in` | `admin123` | `http://localhost:8080/admin/dashboard` |
| **Reception** | `reception@hospital.gov.in` | `reception123` | `http://localhost:8080/reception/dashboard` |
| **Doctor 1 (Medicine)** | `dr.sharma@hospital.gov.in` | `doctor123` | `http://localhost:8080/doctor/dashboard` |
| **Doctor 2 (Gynecology)**| `dr.patil@hospital.gov.in` | `doctor123` | `http://localhost:8080/doctor/dashboard` |
| **Patient** | `ramesh@gmail.com` | `patient123` | `http://localhost:8080/patient/dashboard` |
| **Public Live TV Display**| *(No login required)* | *(Public)* | `http://localhost:8080/display` |

---

## 🌐 REST API Endpoints

- `POST /api/tokens` — Generate token (Walk-in or Online)
- `GET /api/queue/{doctorId}` — Retrieve live queue state for a doctor
- `PUT /api/tokens/doctor/{doctorId}/call-next` — Call the next priority patient
- `PUT /api/tokens/{id}/complete` — Complete consultation & record notes
- `PUT /api/tokens/{id}/no-show` — Mark patient as absent
- `PUT /api/tokens/{id}/retry` — Re-queue missed token to end of queue
- `GET /api/tokens/no-shows` — List all missed tokens for today
- `GET /api/patients/search?phone=` — Search patient by phone number
- `GET /api/dashboard/stats` — Hospital dashboard footfall statistics
