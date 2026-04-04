package com.kernelpanic.auth_service.excecoes.personalizado;

public class UsuarioNaoEncontradoException extends RuntimeException {
    public UsuarioNaoEncontradoException(String mensagem) {
        super(mensagem);
    }

    public UsuarioNaoEncontradoException(String mensagem, Throwable cause) {
        super(mensagem, cause);
    }
}
