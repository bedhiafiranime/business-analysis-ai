package com.businessanalysis.businessanalysisai.controller;

import com.businessanalysis.businessanalysisai.dto.CreateProjectRequest;
import com.businessanalysis.businessanalysisai.dto.UpdateProjectRequest;
import com.businessanalysis.businessanalysisai.dto.ProjectResponse;
import com.businessanalysis.businessanalysisai.entity.ProjectStatus;
import com.businessanalysis.businessanalysisai.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            Authentication authentication) {
        // authentication.getName() typically holds the user's email parsed from the JWT
        ProjectResponse response = projectService.createProject(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getUserProjects(Authentication authentication) {
        List<ProjectResponse> responses = projectService.getUserProjects(authentication.getName());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProject(
            @PathVariable Long id,
            Authentication authentication) {
        ProjectResponse response = projectService.getProject(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/details")
    public ResponseEntity<ProjectResponse> updateProjectDetails(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectRequest request,
            Authentication authentication) {
        ProjectResponse response = projectService.updateProject(id, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProjectStatus(
            @PathVariable Long id,
            @RequestParam ProjectStatus status,
            Authentication authentication) {
        // Currently maps to the updateProjectStatus method available in ProjectService
        ProjectResponse response = projectService.updateProjectStatus(id, status, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            Authentication authentication) {
        projectService.deleteProject(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<ProjectResponse> archiveProject(
            @PathVariable Long id,
            @RequestParam boolean archive,
            Authentication authentication) {
        ProjectResponse response = projectService.archiveProject(id, archive, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/favorite")
    public ResponseEntity<ProjectResponse> favoriteProject(
            @PathVariable Long id,
            @RequestParam boolean favorite,
            Authentication authentication) {
        ProjectResponse response = projectService.favoriteProject(id, favorite, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<ProjectResponse> duplicateProject(
            @PathVariable Long id,
            Authentication authentication) {
        ProjectResponse response = projectService.duplicateProject(id, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
