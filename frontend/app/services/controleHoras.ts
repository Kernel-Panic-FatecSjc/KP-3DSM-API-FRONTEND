const BASE_URL = process.env.NEXT_PUBLIC_APONTAMENTO_API_URL || 'http://localhost:8080';
const USUARIO_URL = process.env.NEXT_PUBLIC_USUARIO_API_URL || 'http://localhost:8080';

export type TipoAtividade = 'ANALISE' | 'DESENVOLVIMENTO' | 'TESTES' | 'CORRECAO_BUG' | 'FEATURE';

export type EstadoHora = 'PENDENTE' | 'AGUARDANDO_APROVACAO' | 'APROVADO' | 'REJEITADO';

export interface HorasExibirDTO {
    id: number;
    tarefaId: number | null;
    usuarioId: number;
    tituloSessao: string;
    tipoAtividade: TipoAtividade;
    descricao: string | null;
    dataLancamento: string; // "YYYY-MM-DD"
    inicio: string;         // "HH:mm:ss"
    fim: string;            // "HH:mm:ss"
    justificativa: string | null;
    motivoRejeicao: string | null;
    estado: EstadoHora;
    dataCriacao: string;
}

export interface HorasCadastrarDTO {
    usuarioId: number;
    tarefaId?: number | null;
    tituloSessao: string;
    tipoAtividade: TipoAtividade;
    descricao?: string;
    dataLancamento: string; // "YYYY-MM-DD"
    inicio: string;         // "HH:mm"
    fim: string;            // "HH:mm"
    justificativa?: string;
}

export interface HorasAtualizarDTO {
    id: number;
    tarefaId?: number | null;
    tituloSessao: string;
    tipoAtividade: TipoAtividade;
    descricao?: string;
    dataLancamento: string;
    inicio: string;
    fim: string;
    justificativa?: string;
}

export interface HorasRejeitarDTO {
    id: number;
    motivoRejeicao: string;
}

export interface HorasFiltroParams {
    usuarioId?: number;
    estado?: EstadoHora;
    dataInicio?: string;
    dataFim?: string;
}

export interface UsuarioExibirDTO {
    id: number;
    nome: string;
    cargo: string;
    email: string;
    salario: string;
    gerenteId: number | null;
    dataCriacao: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const erro = await res.text();
        throw new Error(erro || `Erro ${res.status}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
}

// BUSCAR apontamentos filtro (todas as abas)
export async function filtrarHoras(params: HorasFiltroParams): Promise<HorasExibirDTO[]> {
    const query = new URLSearchParams();
    if (params.usuarioId !== undefined) query.append('usuarioId', String(params.usuarioId));
    if (params.estado) query.append('estado', params.estado);
    if (params.dataInicio) query.append('dataInicio', params.dataInicio);
    if (params.dataFim) query.append('dataFim', params.dataFim);

    const res = await fetch(`${BASE_URL}/horas/filtrar?${query.toString()}`);
    return handleResponse<HorasExibirDTO[]>(res);
}

// BUSCAR apontamento id
export async function buscarHoraPorId(id: number): Promise<HorasExibirDTO> {
    const res = await fetch(`${BASE_URL}/horas/${id}`);
    return handleResponse<HorasExibirDTO>(res);
}

// CRIAR apontamento
export async function criarHora(dto: HorasCadastrarDTO): Promise<HorasExibirDTO> {
    const res = await fetch(`${BASE_URL}/horas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
    });
    return handleResponse<HorasExibirDTO>(res);
}

// EDITAR apontamento 
export async function editarHora(dto: HorasAtualizarDTO): Promise<HorasExibirDTO> {
    const res = await fetch(`${BASE_URL}/horas/editar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
    });
    return handleResponse<HorasExibirDTO>(res);
}

// EXCLUIR apontamento 
export async function excluirHora(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/horas/${id}`, {
        method: 'DELETE',
    });
    return handleResponse<void>(res);
}

// APROVAR apontamento
export async function aprovarHora(id: number): Promise<HorasExibirDTO> {
    const res = await fetch(`${BASE_URL}/horas/${id}/aprovar`, {
        method: 'PATCH',
    });
    return handleResponse<HorasExibirDTO>(res);
}

// REJEITAR apontamento
export async function rejeitarHora(dto: HorasRejeitarDTO): Promise<HorasExibirDTO> {
    const res = await fetch(`${BASE_URL}/horas/rejeitar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
    });
    return handleResponse<HorasExibirDTO>(res);
}

// ENVIAR apontamento para aprovação
export async function enviarParaAprovacao(id: number): Promise<HorasExibirDTO> {
    const res = await fetch(`${BASE_URL}/horas/${id}/enviar`, {
        method: 'PATCH',
    });
    return handleResponse<HorasExibirDTO>(res);
}

// // BUSCAR usuario por id
// export async function buscarUsuarioPorId(id: number): Promise<UsuarioExibirDTO> {
//     const res = await fetch(`${USUARIO_URL}/usuario/${id}`);
//     return handleResponse<UsuarioExibirDTO>(res);
// }

// // BUSCAR todos os usuarios
// export async function buscarTodosUsuarios(): Promise<UsuarioExibirDTO[]> {
//     const res = await fetch(`${USUARIO_URL}/usuario/todos`);
//     return handleResponse<UsuarioExibirDTO[]>(res);
// }