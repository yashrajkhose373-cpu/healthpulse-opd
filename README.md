# 🏥 HealthPulse OPD — Smart Appointment & Algorithmic Queue Management System

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/yashrajkhose373-cpu/healthpulse-opd)
[![Live Hub](https://img.shields.io/badge/Live_Hub-GitHub_Pages-2ea44f?style=for-the-badge&logo=github-pages)](https://yashrajkhose373-cpu.github.io/healthpulse-opd/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=for-the-badge&logo=spring-boot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Java](https://img.shields.io/badge/Java-17%2B%20%7C%2021-ED8B00?style=for-the-badge&logo=openjdk)](https://openjdk.org/)

> **Repository URL**: [https://github.com/yashrajkhose373-cpu/healthpulse-opd](https://github.com/yashrajkhose373-cpu/healthpulse-opd)  
> **Live Web Hub**: [https://yashrajkhose373-cpu.github.io/healthpulse-opd/](https://yashrajkhose373-cpu.github.io/healthpulse-opd/)

An enterprise-grade, full-stack Hospital OPD Queue & Priority Management System engineered to eliminate congestion in government and public hospitals using **algorithmic emergency triage**, **real-time WebSocket synchronization**, **Spring Boot 3**, and a **React 19 interactive client**.

---

## 🌐 Quick Links & Live Portals

### 🌟 1. Master Explorer Hub (All-in-One)
| Hub | URL | Description |
|---|---|---|
| **Online Web Hub (GitHub Pages)** | [https://yashrajkhose373-cpu.github.io/healthpulse-opd/](https://yashrajkhose373-cpu.github.io/healthpulse-opd/) | Public web-hosted portal with 5-server links, test credentials, and architecture |
| **Local Five Server Hub** | [http://localhost:5500](http://localhost:5500) | Local development explorer with live health checks & embedded live preview |
| **React 19 Client** | [http://localhost:5173](http://localhost:5173) | Interactive patient portal with multi-language triage (EN/HI/MR) |

---

### 🏥 2. The 5 Specialized Server Portals (Spring Boot `:8080`)

| # | Portal | Direct Localhost Link | Test Credentials | Role Highlights |
|---|---|---|---|---|
| **1** | **Admin Analytics** | [http://localhost:8080/admin/dashboard](http://localhost:8080/admin/dashboard) | `admin@hospital.gov.in` / `admin123` | Hospital footfall metrics, doctor load breakdown, audit logs |
| **2** | **Reception & Triage** | [http://localhost:8080/reception/dashboard](http://localhost:8080/reception/dashboard) | `reception@hospital.gov.in` / `reception123` | Walk-in registration, priority triage, no-show recovery |
| **3** | **Doctor Consultation** | [http://localhost:8080/doctor/dashboard](http://localhost:8080/doctor/dashboard) | `dr.sharma@hospital.gov.in` / `doctor123`<br>`dr.patil@hospital.gov.in` / `doctor123` | Priority queue view, "Call Next", digital prescription recorder |
| **4** | **Patient Queue Portal** | [http://localhost:8080/patient/dashboard](http://localhost:8080/patient/dashboard) | `ramesh@gmail.com` / `patient123` | Real-time token tracking, dynamic wait time, consultation history |
| **5** | **Live Hall TV Display** | [http://localhost:8080/display](http://localhost:8080/display) | *(No login required - Public)* | Full-screen TV waiting screen, zero-refresh STOMP sync, TTS audio |
| 🗄️ | **H2 Database Console** | [http://localhost:8080/h2-console](http://localhost:8080/h2-console) | JDBC: `jdbc:h2:mem:hospitaldb`<br>User: `sa`, Pass: *(empty)* | Inspect in-memory database tables, tokens & users |

---

## 🚀 Key Architectural Features

1. **Smart Algorithmic Queue Engine**:
   - **Triage Order**: `EMERGENCY` > `SENIOR_OR_PREGNANT` > `NORMAL` (FIFO strictly preserved within identical priority ranks).
   - **Dynamic Waiting Time**: Calculated mathematically using `(active patients ahead in queue) × (doctor's historical average consultation minutes)`.
   - **Absenteeism Recovery**: Single-click "No-Show" marking with automatic re-insertion to the end of the queue.

2. **Real-Time Zero-Refresh Synchronization**:
   - Powered by **Spring WebSocket (STOMP)** over SockJS.
   - Text-to-Speech audio buzzer triggered in real-time when a patient's token is called.

3. **Multi-Language Support (i18n)**:
   - Dynamic locale switching across English, Hindi (हिंदी), and Marathi (मराठी) via `?lang=en`, `?lang=hi`, `?lang=mr`.

---

## 🛠️ Technology Stack

- **Backend**: Java 17 / 21, Spring Boot 3.2.5, Spring Data JPA, Spring Security 6 (RBAC), WebSocket (STOMP)
- **Frontend**: React 19, Vite 8, Lucide Icons, Thymeleaf, Bootstrap 5, Bootstrap Icons
- **Databases**: Embedded H2 (Zero-setup instant run) & MySQL 8.0+ supported via profile
- **Tooling**: Apache Maven 3.8+, Node.js 20+

---

## 🏃 Running the Project Locally

### 1. Start the Spring Boot Backend (Port 8080)
Open a terminal in the project root:
```bash
mvn clean spring-boot:run
```
Backend will start on `http://localhost:8080`.

### 2. Start the React Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
Frontend will be live on `http://localhost:5173`.

### 3. Open the Five Server Master Hub (Port 5500)
Right-click `index.html` or `OPEN_FIVE_SERVER.html` in VS Code / Antigravity IDE and choose **"Open with Five Server"**, or visit:
`http://localhost:5500`

---

## 🌐 REST API Endpoints

- `POST /api/tokens` — Generate walk-in or online appointment token
- `GET /api/queue/{doctorId}` — Retrieve live priority queue state for a doctor
- `PUT /api/tokens/doctor/{doctorId}/call-next` — Dispatch and call next priority patient
- `PUT /api/tokens/{id}/complete` — Complete visit & persist diagnosis notes
- `PUT /api/tokens/{id}/no-show` — Flag patient as absent
- `PUT /api/tokens/{id}/retry` — Re-queue missed token to back of line
- `GET /api/tokens/no-shows` — Fetch all missed tokens for today
- `GET /api/patients/search?phone={phone}` — Patient lookup by mobile number
- `GET /api/dashboard/stats` — Overall OPD footfall metrics & doctor distribution

---

## 📄 License & Credits

- **Repository**: [https://github.com/yashrajkhose373-cpu/healthpulse-opd](https://github.com/yashrajkhose373-cpu/healthpulse-opd)
- **Author**: Yashraj Khose ([@yashrajkhose373-cpu](https://github.com/yashrajkhose373-cpu))
- Developed for Smart Hospital OPD Queue Management.
