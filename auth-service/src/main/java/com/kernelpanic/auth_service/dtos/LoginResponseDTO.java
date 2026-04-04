package com.kernelpanic.auth_service.dtos;

import lombok.Data;

@Data
public class LoginResponseDTO {
    private String token;
    private String email;
    private String cargo;
}
