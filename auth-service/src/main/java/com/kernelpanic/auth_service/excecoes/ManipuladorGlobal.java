package com.kernelpanic.auth_service.excecoes;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.kernelpanic.auth_service.dtos.ErroRespostaDTO;
import com.kernelpanic.auth_service.excecoes.personalizado.UsuarioNaoEncontradoException;

@ControllerAdvice
public class ManipuladorGlobal {

    @ExceptionHandler(UsuarioNaoEncontradoException.class)
    public ResponseEntity<ErroRespostaDTO> manipularUsuarioNaoEncontrado(UsuarioNaoEncontradoException ex) {
        ErroRespostaDTO erro = new ErroRespostaDTO(
            "Usuário não encontrado",
            ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroRespostaDTO> manipularViolacaoIntegridade(DataIntegrityViolationException ex) {
        ErroRespostaDTO erro = new ErroRespostaDTO(
            "Erro de integridade de dados",
            "Falha ao processar a requisição. Verifique se o email já não está registrado."
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }

    @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErroRespostaDTO> manipularErroTipo(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException ex) {
        ErroRespostaDTO erro = new ErroRespostaDTO(
            "Tipo de dado inválido",
            String.format("O parâmetro '%s' deveria ser do tipo %s", ex.getName(), ex.getRequiredType().getSimpleName())
        );
        return ResponseEntity.badRequest().body(erro);
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ErroRespostaDTO> manipularJsonInvalido(org.springframework.http.converter.HttpMessageNotReadableException ex) {
        ErroRespostaDTO erro = new ErroRespostaDTO(
            "Erro na leitura do JSON",
            "O corpo da requisição possui erros de sintaxe ou caracteres inválidos."
        );
        return ResponseEntity.badRequest().body(erro);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroRespostaDTO> manipularExcecaoGeral(Exception ex) {
        ErroRespostaDTO erro = new ErroRespostaDTO(
            "Erro interno do servidor",
            "Ocorreu um erro inesperado. Tente novamente mais tarde."
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
    }
}