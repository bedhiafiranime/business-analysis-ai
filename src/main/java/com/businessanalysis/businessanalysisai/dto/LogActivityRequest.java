package com.businessanalysis.businessanalysisai.dto;

import com.businessanalysis.businessanalysisai.entity.ActivityAction;
import com.businessanalysis.businessanalysisai.entity.ActivityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogActivityRequest {
    private Long projectId;
    private ActivityAction action;
    private ActivityStatus status;
    private String details;
}
