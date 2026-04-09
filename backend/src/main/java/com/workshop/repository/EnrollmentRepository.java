package com.workshop.repository;

import com.workshop.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByUserId(Long userId);
    List<Enrollment> findByWorkshopId(Long workshopId);
    Optional<Enrollment> findByUserIdAndWorkshopId(Long userId, Long workshopId);
    List<Enrollment> findByStatus(Enrollment.EnrollmentStatus status);
}
