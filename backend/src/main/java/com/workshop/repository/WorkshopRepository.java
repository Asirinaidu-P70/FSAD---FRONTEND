package com.workshop.repository;

import com.workshop.model.Workshop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkshopRepository extends JpaRepository<Workshop, Long> {
    List<Workshop> findByStatus(Workshop.WorkshopStatus status);
    List<Workshop> findByTrainerId(Long trainerId);
    List<Workshop> findByCategory(String category);
    Optional<Workshop> findByTitle(String title);
}
