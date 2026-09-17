package com.businessanalysis.businessanalysisai.service;

import com.businessanalysis.businessanalysisai.dto.DocumentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentService {

    /**
     * Uploads a requirement document (PDF/DOCX) and attaches it to the specified project.
     * The userEmail ensures the requesting user owns the parent project.
     */
    DocumentResponse uploadDocument(Long projectId, MultipartFile file, String userEmail);

    /**
     * Retrieves the metadata for a specific uploaded document.
     */
    DocumentResponse getDocument(Long documentId, String userEmail);

    /**
     * Lists all documents that have been attached to a specific project.
     */
    List<DocumentResponse> getProjectDocuments(Long projectId, String userEmail);

    /**
     * Deletes a document from the database and the underlying storage system.
     */
    void deleteDocument(Long documentId, String userEmail);
}
