package com.kernelpanic.usuario_service.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioCadastroDTO {

    private Long gerenteId;

    @NotBlank(message = "O nome do usuario é obrigatório")
    @Size(max = 100, message = "O nome não pode exceder 100 caracteres")
    private String nome;

    @NotBlank(message = "O cargo é obrigatório")
    @Size(max = 30, message = "O cargo não pode passar de 30 caracteres")
    private String cargo;

    @NotBlank(message = "O email não pode ser vazio")
    @Email(message = "Email inválido")
    @Size(max = 150, message = "O email não pode ultrapassar 150 caracteres")
    private String email;

    @NotBlank(message = "O salário é obrigatório")
    @Size(max = 20, message = "O salário não pode ultrapassar 20 caracteres")
    private String salario;

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 6, max = 255, message = "A senha deve ter no minimo 6 caracteres")
    private String senha;
}