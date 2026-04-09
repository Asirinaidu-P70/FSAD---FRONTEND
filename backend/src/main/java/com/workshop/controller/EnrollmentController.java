package com.workshop.controller;

import com.workshop.model.Enrollment;
import com.workshop.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/enrollments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "https://workshop-platform.onrender.com"})
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<?> enrollUserInWorkshop(@RequestBody Enrollment enrollment) {
        try {
            return ResponseEntity.ok(enrollmentService.enrollUserInWorkshop(enrollment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEnrollmentById(@PathVariable Long id) {
        return enrollmentService.getEnrollmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Enrollment>> getEnrollmentsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByUser(userId));
    }

    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<List<Enrollment>> getEnrollmentsByWorkshop(@PathVariable Long workshopId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByWorkshop(workshopId));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeEnrollment(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(enrollmentService.completeEnrollment(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelEnrollment(@PathVariable Long id) {
        try {
            enrollmentService.cancelEnrollment(id);
            return ResponseEntity.ok("Enrollment cancelled successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
