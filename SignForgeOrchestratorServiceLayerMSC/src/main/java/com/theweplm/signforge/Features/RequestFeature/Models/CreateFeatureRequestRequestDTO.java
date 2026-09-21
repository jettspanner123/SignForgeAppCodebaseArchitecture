package com.theweplm.signforge.Features.RequestFeature.Models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class CreateFeatureRequestRequestDTO {

    // Intentionally no targetUserId field: a feature request is always attributed to the
    // authenticated caller (see FeatureRequestController/Service), never a client-supplied account.

    @NotBlank(message = "Feature title is required")
    @Size(min = 5, max = 255, message = "Feature title must be between 5 and 255 characters")
    @com.fasterxml.jackson.annotation.JsonAlias({"title", "Title"})
    private String title;

    @NotBlank(message = "Feature type category is required")
    @com.fasterxml.jackson.annotation.JsonAlias({"featureType", "feature_type", "FeatureType"})
    private String featureType;

    @NotBlank(message = "Feature description is required")
    @Size(min = 20, message = "Feature description must be at least 20 characters")
    @com.fasterxml.jackson.annotation.JsonAlias({"description", "Description"})
    private String description;
}
