package com.businessanalysis.businessanalysisai.dto;

import java.time.LocalDateTime;

public record DocumentResponse(
        Long id,
        Long projectId,
        String originalFileName,
        String fileType,
        Long fileSize,
        LocalDateTime uploadDate
) {}
