package com.businessanalysis.businessanalysisai.service.impl;

import com.businessanalysis.businessanalysisai.dto.DocumentResponse;
import com.businessanalysis.businessanalysisai.entity.Document;
import com.businessanalysis.businessanalysisai.entity.Project;
import com.businessanalysis.businessanalysisai.entity.User;
import com.businessanalysis.businessanalysisai.mapper.DocumentMapper;
import com.businessanalysis.businessanalysisai.repository.DocumentRepository;
import com.businessanalysis.businessanalysisai.repository.ProjectRepository;
import com.businessanalysis.businessanalysisai.repository.UserRepository;
import com.businessanalysis.businessanalysisai.service.DocumentService;
import com.businessanalysis.businessanalysisai.service.ProjectActivityService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final DocumentMapper documentMapper;
    private final ProjectActivityService activityService;

    @Override
    @Transactional
    public DocumentResponse uploadDocument(Long projectId, MultipartFile file, String userEmail) {
        User user = getUserByEmail(userEmail);
        Project project = getProjectIfOwned(projectId, user.getId());

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown");
        String fileExtension = getFileExtension(originalFilename);

        // Validate file type
        if (!fileExtension.equalsIgnoreCase("pdf") && !fileExtension.equalsIgnoreCase("docx")) {
            throw new IllegalArgumentException("Only PDF and DOCX files are allowed for analysis.");
        }

        // Generate a safe internal filename
        String storedFileName = UUID.randomUUID().toString() + "." + fileExtension;
        String filePath = "/storage/documents/" + storedFileName; // Placeholder path

        // TODO: Implement actual binary storage logic here (e.g., save to local filesystem or AWS S3).
        // Example: Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Store metadata in the database
        Document document = Document.builder()
                .project(project)
                .uploadedBy(user)
                .originalFileName(originalFilename)
                .storedFileName(storedFileName)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .filePath(filePath)
                .build();

        Document savedDocument = documentRepository.save(document);
        
        activityService.logActivity(project, user, com.businessanalysis.businessanalysisai.entity.ActivityAction.DOCUMENT_UPLOADED, com.businessanalysis.businessanalysisai.entity.ActivityStatus.SUCCESS, "Uploaded document: " + originalFilename);

        return documentMapper.toResponse(savedDocument);
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentResponse getDocument(Long documentId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found."));

        if (!document.getProject().getUser().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Document not found or you do not have permission to access it.");
        }

        return documentMapper.toResponse(document);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> getProjectDocuments(Long projectId, String userEmail) {
        User user = getUserByEmail(userEmail);
        getProjectIfOwned(projectId, user.getId()); // Verifies ownership

        List<Document> documents = documentRepository.findAllByProjectId(projectId);

        return documents.stream()
                .map(documentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteDocument(Long documentId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found."));

        if (!document.getProject().getUser().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Document not found or you do not have permission to access it.");
        }

        // TODO: Delete the actual binary file from the filesystem or cloud storage before removing the DB record.
        
        documentRepository.delete(document);
        
        activityService.logActivity(document.getProject(), user, com.businessanalysis.businessanalysisai.entity.ActivityAction.DOCUMENT_DELETED, com.businessanalysis.businessanalysisai.entity.ActivityStatus.SUCCESS, "Deleted document: " + document.getOriginalFileName());
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
    
    /**
     * Helper method to extract file extension.
     */
    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex == -1) ? "" : filename.substring(dotIndex + 1);
    }
}
