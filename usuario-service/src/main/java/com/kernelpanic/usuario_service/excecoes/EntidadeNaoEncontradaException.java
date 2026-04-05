package com.kernelpanic.usuario_service.excecoes;

public class EntidadeNaoEncontradaException extends RuntimeException {

    private String titulo;

    public EntidadeNaoEncontradaException(String titulo, String mensagem) {
        super(mensagem);
        this.titulo = titulo;
    }

    public String getTitulo() {
        return titulo;
    }
}