package com.kernelpanic.auth_service.dtos;

import lombok.Data;

@Data
public class LoginRequestDTO {
    private String email;
    private String senha;
}