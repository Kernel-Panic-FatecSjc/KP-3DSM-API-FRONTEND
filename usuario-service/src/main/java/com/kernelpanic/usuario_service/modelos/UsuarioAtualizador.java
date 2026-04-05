package com.kernelpanic.usuario_service.modelos;

import com.kernelpanic.usuario_service.entidades.Usuario;

public class UsuarioAtualizador {

    private StringVerificadorNulo verificador = new StringVerificadorNulo();

    private void atualizarDados(Usuario usuario, Usuario atualizacao) {
        if (!verificador.verificar(atualizacao.getNome())) {
            usuario.setNome(atualizacao.getNome());
        }

        if (!verificador.verificar(atualizacao.getCargo())) {
            usuario.setCargo(atualizacao.getCargo());
        }

        if (!verificador.verificar(atualizacao.getEmail())) {
            usuario.setEmail(atualizacao.getEmail());
        }

        if (!verificador.verificar(atualizacao.getSenha())) {
            usuario.setSenha(atualizacao.getSenha());
        }

        if (atualizacao.getGerente() != null) {
            usuario.setGerente(atualizacao.getGerente());
        }
    }

    public void atualizar(Usuario usuario, Usuario atualizacao) {
        atualizarDados(usuario, atualizacao);
    }
}