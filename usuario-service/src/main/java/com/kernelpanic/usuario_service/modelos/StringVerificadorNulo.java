package com.kernelpanic.usuario_service.modelos;

public class StringVerificadorNulo {

    // Retorna true se a string for nula ou vazia
    public boolean verificar(String valor) {
        return valor == null || valor.trim().isEmpty();
    }
}