package com.businessanalysis.businessanalysisai.service;

import com.businessanalysis.businessanalysisai.dto.CreateProjectRequest;
import com.businessanalysis.businessanalysisai.dto.ProjectResponse;
import com.businessanalysis.businessanalysisai.dto.UpdateProjectRequest;
import com.businessanalysis.businessanalysisai.entity.ProjectStatus;

import java.util.List;

public interface ProjectService {

    /**
     * Creates a new project for the authenticated user.
     */
    ProjectResponse createProject(CreateProjectRequest request, String userEmail);

    /**
     * Retrieves a specific project, ensuring it belongs to the authenticated user.
     */
    ProjectResponse getProject(Long projectId, String userEmail);

    /**
     * Lists all projects belonging to the authenticated user, ordered by creation date.
     */
    List<ProjectResponse> getUserProjects(String userEmail);

    /**
     * Updates the name and business idea of an existing project.
     */
    ProjectResponse updateProject(Long projectId, UpdateProjectRequest request, String userEmail);

    /**
     * Updates the status of an existing project (e.g., from DRAFT to ANALYZING).
     */
    ProjectResponse updateProjectStatus(Long projectId, ProjectStatus status, String userEmail);

    /**
     * Deletes a project and all its associated documents and analyses.
     */
    void deleteProject(Long projectId, String userEmail);

    /**
     * Archives or unarchives a project.
     */
    ProjectResponse archiveProject(Long projectId, boolean archive, String userEmail);

    /**
     * Favorites or unfavorites a project.
     */
    ProjectResponse favoriteProject(Long projectId, boolean favorite, String userEmail);

    /**
     * Duplicates a project.
     */
    ProjectResponse duplicateProject(Long projectId, String userEmail);
}
