package com.kernelpanic.auth_service.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErroRespostaDTO {
	private String titulo;
	private String mensagem;
}