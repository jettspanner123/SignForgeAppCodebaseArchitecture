package com.theweplm.signforge.Features.ConfigurationConstant.Models;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddWorkLocationRequestDTO {

    @NotBlank(message = "Work location must not be blank.")
    private String location;
}
