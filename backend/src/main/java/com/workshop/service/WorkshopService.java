package com.workshop.service;

import com.workshop.model.Workshop;
import com.workshop.repository.WorkshopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WorkshopService {
    private final WorkshopRepository workshopRepository;

    public Workshop createWorkshop(Workshop workshop) {
        workshop.setStatus(Workshop.WorkshopStatus.UPCOMING);
        workshop.setEnrolledCount(0);
        return workshopRepository.save(workshop);
    }

    public Optional<Workshop> getWorkshopById(Long id) {
        return workshopRepository.findById(id);
    }

    public List<Workshop> getAllWorkshops() {
        return workshopRepository.findAll();
    }

    public List<Workshop> getWorkshopsByStatus(Workshop.WorkshopStatus status) {
        return workshopRepository.findByStatus(status);
    }

    public List<Workshop> getWorkshopsByCategory(String category) {
        return workshopRepository.findByCategory(category);
    }

    public List<Workshop> getWorkshopsByTrainer(Long trainerId) {
        return workshopRepository.findByTrainerId(trainerId);
    }

    public Workshop updateWorkshop(Long id, Workshop updatedWorkshop) {
        return workshopRepository.findById(id)
                .map(workshop -> {
                    if (updatedWorkshop.getTitle() != null) {
                        workshop.setTitle(updatedWorkshop.getTitle());
                    }
                    if (updatedWorkshop.getDescription() != null) {
                        workshop.setDescription(updatedWorkshop.getDescription());
                    }
                    if (updatedWorkshop.getCapacity() != null) {
                        workshop.setCapacity(updatedWorkshop.getCapacity());
                    }
                    if (updatedWorkshop.getStatus() != null) {
                        workshop.setStatus(updatedWorkshop.getStatus());
                    }
                    if (updatedWorkshop.getStartDate() != null) {
                        workshop.setStartDate(updatedWorkshop.getStartDate());
                    }
                    if (updatedWorkshop.getEndDate() != null) {
                        workshop.setEndDate(updatedWorkshop.getEndDate());
                    }
                    return workshopRepository.save(workshop);
                })
                .orElseThrow(() -> new RuntimeException("Workshop not found"));
    }

    public void deleteWorkshop(Long id) {
        workshopRepository.deleteById(id);
    }

    public void incrementEnrollment(Long workshopId) {
        workshopRepository.findById(workshopId)
                .ifPresent(workshop -> {
                    workshop.setEnrolledCount(workshop.getEnrolledCount() + 1);
                    workshopRepository.save(workshop);
                });
    }

    public void decrementEnrollment(Long workshopId) {
        workshopRepository.findById(workshopId)
                .ifPresent(workshop -> {
                    workshop.setEnrolledCount(Math.max(0, workshop.getEnrolledCount() - 1));
                    workshopRepository.save(workshop);
                });
    }
}
