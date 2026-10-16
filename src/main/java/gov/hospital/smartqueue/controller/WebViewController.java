package gov.hospital.smartqueue.controller;

import gov.hospital.smartqueue.dto.TokenRequestDTO;
import gov.hospital.smartqueue.model.*;
import gov.hospital.smartqueue.repository.AppointmentRepository;
import gov.hospital.smartqueue.repository.VisitRepository;
import gov.hospital.smartqueue.service.DoctorService;
import gov.hospital.smartqueue.service.PatientService;
import gov.hospital.smartqueue.service.QueueService;
import gov.hospital.smartqueue.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.security.Principal;
import java.util.List;

@Controller
public class WebViewController {

    @Autowired
    private QueueService queueService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private UserService userService;

    @Autowired
    private VisitRepository visitRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    // Home / Landing Page
    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("doctors", doctorService.getAllDoctors());
        return "index";
    }

    // Role-based redirect after login
    @GetMapping("/default")
    public String defaultAfterLogin(Authentication auth) {
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return "redirect:/admin/dashboard";
        } else if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))) {
            return "redirect:/doctor/dashboard";
        } else if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_RECEPTION"))) {
            return "redirect:/reception/dashboard";
        } else if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))) {
            return "redirect:/patient/dashboard";
        }
        return "redirect:/";
    }

    // Login Page
    @GetMapping("/login")
    public String loginPage(@RequestParam(value = "error", required = false) String error,
                            @RequestParam(value = "logout", required = false) String logout,
                            Model model) {
        if (error != null) {
            model.addAttribute("errorMessage", "Invalid email or password!");
        }
        if (logout != null) {
            model.addAttribute("logoutMessage", "You have been logged out successfully.");
        }
        return "login";
    }

    // Register Page
    @GetMapping("/register")
    public String registerPage(Model model) {
        return "register";
    }

    @PostMapping("/register")
    public String registerUser(@RequestParam String name,
                               @RequestParam String email,
                               @RequestParam String password,
                               @RequestParam String phone,
                               @RequestParam(required = false, defaultValue = "ROLE_PATIENT") String role,
                               RedirectAttributes redirectAttributes) {
        try {
            Role userRole = Role.valueOf(role);
            User user = userService.registerUser(name, email, password, userRole, phone);

            if (userRole == Role.ROLE_PATIENT) {
                Patient p = Patient.builder()
                        .name(name)
                        .phone(phone)
                        .age(30)
                        .gender("Other")
                        .user(user)
                        .build();
                patientService.registerPatient(p);
            }

            redirectAttributes.addFlashAttribute("successMessage", "Account created successfully! Please login.");
            return "redirect:/login";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/register";
        }
    }

    // Public Live Display Board for Waiting Rooms (Big Screen TV) -> Redirects to React Frontend
    @GetMapping("/display")
    public String liveDisplay() {
        return "redirect:http://localhost:5173/";
    }

    // Doctor Dashboard
    @GetMapping("/doctor/dashboard")
    public String doctorDashboard(Principal principal, Model model) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        Doctor doctor = doctorService.getDoctorByUserId(user.getId())
                .orElse(doctorService.getAllDoctors().stream().findFirst().orElse(null));

        if (doctor == null) {
            model.addAttribute("errorMessage", "No doctor profile associated with this account.");
            return "error";
        }

        model.addAttribute("doctor", doctor);
        model.addAttribute("queueState", queueService.getLiveQueueForDoctor(doctor.getId()));
        model.addAttribute("recentVisits", visitRepository.findByDoctorIdOrderByVisitDateDesc(doctor.getId()));
        return "doctor_dashboard";
    }

    // Reception Dashboard
    @GetMapping("/reception/dashboard")
    public String receptionDashboard(Model model) {
        model.addAttribute("doctors", doctorService.getAllDoctors());
        model.addAttribute("patients", patientService.findAll());
        model.addAttribute("noShows", queueService.getTodayNoShows());
        model.addAttribute("stats", queueService.getDashboardStats());
        return "reception_dashboard";
    }

    // Patient Dashboard
    @GetMapping("/patient/dashboard")
    public String patientDashboard(Principal principal, Model model) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        Patient patient = patientService.findByPhone(user.getPhone())
                .orElseGet(() -> patientService.findAll().stream().findFirst().orElse(null));

        model.addAttribute("patient", patient);
        model.addAttribute("doctors", doctorService.getAllDoctors());
        if (patient != null) {
            model.addAttribute("visits", visitRepository.findByPatientIdOrderByVisitDateDesc(patient.getId()));
            model.addAttribute("appointments", appointmentRepository.findByPatientId(patient.getId()));
        }
        return "patient_dashboard";
    }

    // Admin Dashboard
    @GetMapping("/admin/dashboard")
    public String adminDashboard(Model model) {
        model.addAttribute("stats", queueService.getDashboardStats());
        model.addAttribute("doctors", doctorService.getAllDoctors());
        model.addAttribute("patients", patientService.findAll());
        model.addAttribute("noShows", queueService.getTodayNoShows());
        return "admin_dashboard";
    }
}
