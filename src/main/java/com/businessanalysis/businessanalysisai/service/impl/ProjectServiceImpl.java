package com.businessanalysis.businessanalysisai.service.impl;

import com.businessanalysis.businessanalysisai.dto.CreateProjectRequest;
import com.businessanalysis.businessanalysisai.dto.UpdateProjectRequest;
import com.businessanalysis.businessanalysisai.dto.ProjectResponse;
import com.businessanalysis.businessanalysisai.entity.Project;
import com.businessanalysis.businessanalysisai.entity.ProjectStatus;
import com.businessanalysis.businessanalysisai.entity.User;
import com.businessanalysis.businessanalysisai.mapper.ProjectMapper;
import com.businessanalysis.businessanalysisai.repository.ProjectRepository;
import com.businessanalysis.businessanalysisai.repository.UserRepository;
import com.businessanalysis.businessanalysisai.service.ProjectService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.businessanalysis.businessanalysisai.service.ProjectActivityService;
import com.businessanalysis.businessanalysisai.entity.ActivityAction;
import com.businessanalysis.businessanalysisai.entity.ActivityStatus;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;
    private final ProjectActivityService activityService;

    @Override
    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);

        Project project = projectMapper.toEntity(request);
        project.setUser(user);
        project.setStatus(ProjectStatus.DRAFT);

        Project savedProject = projectRepository.save(project);
        
        activityService.logActivity(savedProject, user, ActivityAction.PROJECT_CREATED, ActivityStatus.SUCCESS, "Project created successfully");
        
        return projectMapper.toResponse(savedProject);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long projectId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Project project = getProjectIfOwned(projectId, user.getId());
        return projectMapper.toResponse(project);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getUserProjects(String userEmail) {
        User user = getUserByEmail(userEmail);
        
        List<Project> projects = projectRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId());
        
        return projects.stream()
            .map(projectMapper::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Long projectId, UpdateProjectRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        Project project = getProjectIfOwned(projectId, user.getId());

        project.setName(request.name());
        project.setBusinessIdea(request.businessIdea());

        Project updatedProject = projectRepository.save(project);
        
        activityService.logActivity(updatedProject, user, ActivityAction.PROJECT_UPDATED, ActivityStatus.SUCCESS, "Project details updated");
        
        return projectMapper.toResponse(updatedProject);
    }

    @Override
    @Transactional
    public ProjectResponse updateProjectStatus(Long projectId, ProjectStatus status, String userEmail) {
        User user = getUserByEmail(userEmail);
        Project project = getProjectIfOwned(projectId, user.getId());

        project.setStatus(status);

        Project updatedProject = projectRepository.save(project);
        
        activityService.logActivity(updatedProject, user, ActivityAction.PROJECT_UPDATED, ActivityStatus.SUCCESS, "Project status updated to " + status.name());
        
        return projectMapper.toResponse(updatedProject);
    }

    @Override
    @Transactional
    public void deleteProject(Long projectId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Project project = getProjectIfOwned(projectId, user.getId());
        
        projectRepository.delete(project);
        // Note: We cannot log PROJECT_DELETED via ProjectActivity because the project 
        // and all its activities are deleted by CascadeType.ALL.
    }

    @Override
    @Transactional
    public ProjectResponse archiveProject(Long projectId, boolean archive, String userEmail) {
        User user = getUserByEmail(userEmail);
        Project project = getProjectIfOwned(projectId, user.getId());

        project.setArchived(archive);
        Project updatedProject = projectRepository.save(project);
        
        String actionMsg = archive ? "Project archived" : "Project restored";
        activityService.logActivity(updatedProject, user, ActivityAction.PROJECT_UPDATED, ActivityStatus.SUCCESS, actionMsg);
        
        return projectMapper.toResponse(updatedProject);
    }

    @Override
    @Transactional
    public ProjectResponse favoriteProject(Long projectId, boolean favorite, String userEmail) {
        User user = getUserByEmail(userEmail);
        Project project = getProjectIfOwned(projectId, user.getId());

        project.setFavorite(favorite);
        Project updatedProject = projectRepository.save(project);
        
        String actionMsg = favorite ? "Project added to favorites" : "Project removed from favorites";
        activityService.logActivity(updatedProject, user, ActivityAction.PROJECT_UPDATED, ActivityStatus.SUCCESS, actionMsg);
        
        return projectMapper.toResponse(updatedProject);
    }

    @Override
    @Transactional
    public ProjectResponse duplicateProject(Long projectId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Project originalProject = getProjectIfOwned(projectId, user.getId());

        Project newProject = new Project();
        newProject.setUser(user);
        newProject.setName(originalProject.getName() + " (Copy)");
        newProject.setBusinessIdea(originalProject.getBusinessIdea());
        newProject.setStatus(ProjectStatus.DRAFT);
        newProject.setArchived(false);
        newProject.setFavorite(false);

        Project savedProject = projectRepository.save(newProject);
        
        activityService.logActivity(savedProject, user, ActivityAction.PROJECT_CREATED, ActivityStatus.SUCCESS, "Project duplicated from " + originalProject.getName());
        
        return projectMapper.toResponse(savedProject);
    }

    /**
     * Helper method to fetch the User by email or throw a standard JPA exception if not found.
     */
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
    }

    /**
     * Helper method to securely fetch a Project, enforcing that the requesting User actually owns it.
     */
    private Project getProjectIfOwned(Long projectId, Long userId) {
        return projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found or you do not have permission to access it."));
    }
}
