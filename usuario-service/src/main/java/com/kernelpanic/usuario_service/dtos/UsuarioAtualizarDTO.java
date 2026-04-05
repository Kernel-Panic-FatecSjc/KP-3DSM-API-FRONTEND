package com.kernelpanic.usuario_service.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioAtualizarDTO {



    private Long gerenteId;

    @Size(max = 100, message = "O nome não pode exceder 100 caracteres")
    private String nome;

    @Size(max = 30, message = "O cargo não pode passar de 30 caracteres")
    private String cargo;

    @Email(message = "Email inválido")
    @Size(max = 150, message = "O email não pode ultrapassar 150 caracteres")
    private String email;

    @NotBlank(message = "O salário é obrigatório")
    @Size(max = 20, message = "O salário não pode ultrapassar 20 caracteres")
    private String salario;

    @Size(max = 255, message = "A senha não pode ultrapassar 255 caracteres")
    private String senha;
}