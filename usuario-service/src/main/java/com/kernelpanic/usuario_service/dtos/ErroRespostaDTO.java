package com.kernelpanic.usuario_service.dtos;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ErroRespostaDTO {
    @NotNull(message = "O timestamp é obrigatório")
    private LocalDateTime timestamp;

    @NotNull(message = "O status é obrigatório")
    private Integer status;

    @NotBlank(message = "A mensagem é obrigatória")
    private String mensagem;

    private String descricao;

    public ErroRespostaDTO(Integer status, String mensagem, String descricao){
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.mensagem = mensagem;
        this.descricao = descricao;
    }
}
