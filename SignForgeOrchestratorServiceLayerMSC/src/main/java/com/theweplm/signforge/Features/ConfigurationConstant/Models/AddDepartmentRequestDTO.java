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
public class AddDepartmentRequestDTO {

    @NotBlank(message = "Department name must not be blank.")
    private String department;
}
