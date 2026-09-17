package com.businessanalysis.businessanalysisai.dto;

import com.businessanalysis.businessanalysisai.entity.ActivityAction;
import com.businessanalysis.businessanalysisai.entity.ActivityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectActivityResponse {
    private Long id;
    private Long projectId;
    private String projectName;
    private String userName;
    private ActivityAction action;
    private ActivityStatus status;
    private String details;
    private LocalDateTime timestamp;
}
