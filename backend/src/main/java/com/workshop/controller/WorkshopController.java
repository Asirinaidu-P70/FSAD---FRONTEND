package com.workshop.controller;

import com.workshop.model.Workshop;
import com.workshop.service.WorkshopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/workshops")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "https://workshop-platform.onrender.com"})
public class WorkshopController {
    private final WorkshopService workshopService;

    @PostMapping
    public ResponseEntity<?> createWorkshop(@RequestBody Workshop workshop) {
        try {
            return ResponseEntity.ok(workshopService.createWorkshop(workshop));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Workshop>> getAllWorkshops() {
        return ResponseEntity.ok(workshopService.getAllWorkshops());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getWorkshopById(@PathVariable Long id) {
        return workshopService.getWorkshopById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Workshop>> getWorkshopsByStatus(@PathVariable String status) {
        try {
            Workshop.WorkshopStatus workshopStatus = Workshop.WorkshopStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(workshopService.getWorkshopsByStatus(workshopStatus));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Workshop>> getWorkshopsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(workshopService.getWorkshopsByCategory(category));
    }

    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<Workshop>> getWorkshopsByTrainer(@PathVariable Long trainerId) {
        return ResponseEntity.ok(workshopService.getWorkshopsByTrainer(trainerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateWorkshop(@PathVariable Long id, @RequestBody Workshop workshop) {
        try {
            return ResponseEntity.ok(workshopService.updateWorkshop(id, workshop));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorkshop(@PathVariable Long id) {
        workshopService.deleteWorkshop(id);
        return ResponseEntity.ok("Workshop deleted successfully");
    }
}
