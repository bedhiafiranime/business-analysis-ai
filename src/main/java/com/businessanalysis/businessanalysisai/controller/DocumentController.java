package com.businessanalysis.businessanalysisai.controller;

import com.businessanalysis.businessanalysisai.dto.DocumentResponse;
import com.businessanalysis.businessanalysisai.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/projects/{projectId}/documents")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @PathVariable Long projectId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        DocumentResponse response = documentService.uploadDocument(projectId, file, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/documents/{id}")
    public ResponseEntity<DocumentResponse> getDocument(
            @PathVariable Long id,
            Authentication authentication) {
        DocumentResponse response = documentService.getDocument(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/projects/{projectId}/documents")
    public ResponseEntity<List<DocumentResponse>> getProjectDocuments(
            @PathVariable Long projectId,
            Authentication authentication) {
        List<DocumentResponse> responses = documentService.getProjectDocuments(projectId, authentication.getName());
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long id,
            Authentication authentication) {
        documentService.deleteDocument(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
