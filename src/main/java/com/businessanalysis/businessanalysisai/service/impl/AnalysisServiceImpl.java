package com.businessanalysis.businessanalysisai.service.impl;

import com.businessanalysis.businessanalysisai.dto.AnalysisResponse;
import com.businessanalysis.businessanalysisai.dto.CreateAnalysisRequest;
import com.businessanalysis.businessanalysisai.entity.Analysis;
import com.businessanalysis.businessanalysisai.entity.AnalysisStatus;
import com.businessanalysis.businessanalysisai.entity.Project;
import com.businessanalysis.businessanalysisai.entity.User;
import com.businessanalysis.businessanalysisai.mapper.AnalysisMapper;
import com.businessanalysis.businessanalysisai.repository.AnalysisRepository;
import com.businessanalysis.businessanalysisai.repository.ProjectRepository;
import com.businessanalysis.businessanalysisai.repository.UserRepository;
import com.businessanalysis.businessanalysisai.service.AnalysisService;
import com.businessanalysis.businessanalysisai.service.ProjectActivityService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalysisServiceImpl implements AnalysisService {

    private final AnalysisRepository analysisRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AnalysisMapper analysisMapper;
    private final ProjectActivityService activityService;

    @Override
    @Transactional
    public AnalysisResponse createAnalysis(CreateAnalysisRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        Project project = getProjectIfOwned(request.projectId(), user.getId());

        Analysis analysis = analysisMapper.toEntity(request);
        analysis.setProject(project);
        
        activityService.logActivity(project, user, com.businessanalysis.businessanalysisai.entity.ActivityAction.ANALYSIS_STARTED, com.businessanalysis.businessanalysisai.entity.ActivityStatus.IN_PROGRESS, "Analysis started for project: " + project.getName());

        // Simulate AI generation process
        simulateAiGeneration(analysis, project);

        // Save the generated analysis
        Analysis savedAnalysis = analysisRepository.save(analysis);
        
        // Update project status
        project.setStatus(com.businessanalysis.businessanalysisai.entity.ProjectStatus.COMPLETED);
        projectRepository.save(project);
        
        activityService.logActivity(project, user, com.businessanalysis.businessanalysisai.entity.ActivityAction.ANALYSIS_COMPLETED, com.businessanalysis.businessanalysisai.entity.ActivityStatus.SUCCESS, "Analysis completed successfully");

        return analysisMapper.toResponse(savedAnalysis);
    }

    private void simulateAiGeneration(Analysis analysis, Project project) {
        try {
            Thread.sleep(2000); // Simulate processing delay
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String idea = project.getBusinessIdea() != null ? project.getBusinessIdea() : "Generic Project";
        
        analysis.setBusinessRequirements("1. [High] The system shall align with the core business idea: " + idea + "\n"
                + "2. [Medium] Ensure market competitiveness and user satisfaction.\n"
                + "3. [High] Provide a scalable and reliable service.");
        
        String fr1 = "1. [High] The system must allow users to register and log in.";
        String fr2 = "2. [High] The system must provide core functionality for: " + idea;
        String fr3 = "3. [Medium] Users must be able to view their history and settings.";
        String fr4 = "4. [Low] The system should support exporting data.";

        analysis.setFunctionalRequirements(fr1 + "\n" + fr2 + "\n" + fr3 + "\n" + fr4);
        
        analysis.setNonFunctionalRequirements("1. [High] The system must load pages within 2 seconds.\n"
                + "2. [High] Data must be encrypted at rest and in transit (Security).\n"
                + "3. [Medium] The system should support 99.9% uptime (Reliability).");
        
        // Derive user stories directly from the functional requirements
        String us1 = "1. As a user, I want to register and log in, so that I can access the system securely. (Derived from FR1)";
        String us2 = "2. As a user, I want to use core functionality for " + idea + ", so that I can achieve my goals. (Derived from FR2)";
        String us3 = "3. As a user, I want to view my history and settings, so that I can manage my account. (Derived from FR3)";
        String us4 = "4. As a user, I want to export data, so that I can keep local backups. (Derived from FR4)";

        analysis.setUserStories(us1 + "\n" + us2 + "\n" + us3 + "\n" + us4);
        
        // Derive acceptance criteria directly from the user stories
        analysis.setAcceptanceCriteria("1. Registration works with valid email and password. (Applies to US1)\n"
                + "2. Core functionality executes without errors. (Applies to US2)\n"
                + "3. User settings page loads and saves correctly. (Applies to US3)\n"
                + "4. Data export generates a valid CSV file. (Applies to US4)");
        
        analysis.setRisks("1. [High] Potential data breach if security is not properly implemented.\n"
                + "2. [Medium] Performance degradation under heavy load.\n"
                + "3. [Low] Third-party API rate limits.");
        
        analysis.setAssumptions("1. Users have access to modern web browsers.\n"
                + "2. The backend infrastructure can scale automatically.\n"
                + "3. Funding is available for ongoing operations.");
        
        analysis.setRecommendations("1. Implement multi-factor authentication for added security.\n"
                + "2. Setup automated performance testing.\n"
                + "3. Start with an MVP focusing on the core business idea.");

        analysis.setGenerationStatus(AnalysisStatus.COMPLETED);
        analysis.setGeneratedAt(java.time.LocalDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public AnalysisResponse getAnalysis(Long analysisId, String userEmail) {
        User user = getUserByEmail(userEmail);
        
        Analysis analysis = analysisRepository.findById(analysisId)
                .orElseThrow(() -> new EntityNotFoundException("Analysis not found."));

        if (!analysis.getProject().getUser().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Analysis not found or you do not have permission to access it.");
        }

        return analysisMapper.toResponse(analysis);
    }

    @Override
    @Transactional(readOnly = true)
    public AnalysisResponse getLatestAnalysis(Long projectId, String userEmail) {
        User user = getUserByEmail(userEmail);
        getProjectIfOwned(projectId, user.getId()); // Verifies ownership

        Analysis latestAnalysis = analysisRepository.findFirstByProjectIdOrderByGeneratedAtDesc(projectId)
                .orElseThrow(() -> new EntityNotFoundException("No analyses found for this project."));

        return analysisMapper.toResponse(latestAnalysis);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnalysisResponse> getProjectAnalyses(Long projectId, String userEmail) {
        User user = getUserByEmail(userEmail);
        getProjectIfOwned(projectId, user.getId()); // Verifies ownership

        List<Analysis> analyses = analysisRepository.findAllByProjectIdOrderByGeneratedAtDesc(projectId);

        return analyses.stream()
                .map(analysisMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long countCompletedAnalyses(String userEmail) {
        User user = getUserByEmail(userEmail);
        return analysisRepository.countByProjectUserIdAndGenerationStatus(user.getId(), AnalysisStatus.COMPLETED);
    }

    /**
     * Helper method to fetch the User by email.
     */
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
    }

    /**
     * Helper method to securely fetch a Project enforcing ownership.
     */
    private Project getProjectIfOwned(Long projectId, Long userId) {
        return projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found or you do not have permission to access it."));
    }
}
