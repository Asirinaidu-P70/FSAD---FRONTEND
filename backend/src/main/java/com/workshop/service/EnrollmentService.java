package com.workshop.service;

import com.workshop.model.Enrollment;
import com.workshop.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final WorkshopService workshopService;

    public Enrollment enrollUserInWorkshop(Enrollment enrollment) {
        // Check if user is already enrolled
        Optional<Enrollment> existing = enrollmentRepository.findByUserIdAndWorkshopId(
                enrollment.getUser().getId(),
                enrollment.getWorkshop().getId()
        );

        if (existing.isPresent()) {
            throw new RuntimeException("User is already enrolled in this workshop");
        }

        enrollment.setStatus(Enrollment.EnrollmentStatus.ENROLLED);
        enrollment.setEnrolledAt(LocalDateTime.now());
        
        workshopService.incrementEnrollment(enrollment.getWorkshop().getId());
        
        return enrollmentRepository.save(enrollment);
    }

    public Optional<Enrollment> getEnrollmentById(Long id) {
        return enrollmentRepository.findById(id);
    }

    public List<Enrollment> getEnrollmentsByUser(Long userId) {
        return enrollmentRepository.findByUserId(userId);
    }

    public List<Enrollment> getEnrollmentsByWorkshop(Long workshopId) {
        return enrollmentRepository.findByWorkshopId(workshopId);
    }

    public Enrollment completeEnrollment(Long id) {
        return enrollmentRepository.findById(id)
                .map(enrollment -> {
                    enrollment.setStatus(Enrollment.EnrollmentStatus.COMPLETED);
                    enrollment.setCompletedAt(LocalDateTime.now());
                    enrollment.setCertificateEarned(true);
                    return enrollmentRepository.save(enrollment);
                })
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
    }

    public void cancelEnrollment(Long id) {
        enrollmentRepository.findById(id)
                .ifPresent(enrollment -> {
                    workshopService.decrementEnrollment(enrollment.getWorkshop().getId());
                    enrollment.setStatus(Enrollment.EnrollmentStatus.CANCELLED);
                    enrollmentRepository.save(enrollment);
                });
    }
}
