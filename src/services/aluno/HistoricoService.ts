import { api } from "@/lib/api";

export type StatusSubmissao = "PENDENTE" | "APROVADA" | "REPROVADA";

export interface CertificadoHistorico {
  id: number;
  nomeArquivo: string;
  urlArquivo: string;
}

export interface HistoricoSubmissao {
  id: number;
  identificacao: string;
  tipo: string;
  dataSubmissao: string;
  alunoId: number;
  alunoNome: string;
  cursoNome: string;
  status: StatusSubmissao;
  historicoStatus: StatusSubmissao[];
  quantidadeRegistros: number;
  observacao?: string | null;
  certificados: CertificadoHistorico[];
}

/**
 * Serviço de Histórico de Submissões.
 *
 * Conversa com:
 *  - GET /submissoes/historico        → lista (filtrada por usuário logado)
 *  - GET /submissoes/historico/{id}   → detalhe (com autorização no back)
 *
 * O isolamento por usuário (aluno vê só as suas, coordenador as que avaliou,
 * super_admin todas) é aplicado no back-end com base no JWT já enviado pelo
 * interceptor de `lib/api.ts`.
 */
export const historicoService = {
  async listar(): Promise<HistoricoSubmissao[]> {
    const response = await api.get<HistoricoSubmissao[]>(
      "/submissoes/historico"
    );
    return response.data;
  },

  async buscarPorId(id: number): Promise<HistoricoSubmissao> {
    const response = await api.get<HistoricoSubmissao>(
      `/submissoes/historico/${id}`
    );
    return response.data;
  },
};