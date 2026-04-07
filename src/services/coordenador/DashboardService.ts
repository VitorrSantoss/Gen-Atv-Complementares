import { alunoService } from "./AlunoService";
import { certificadoService } from "./CertificadoService";
import { cursoService } from "./CursoService";

export const dashboardService = {
  async getDashboardData() {
    const [alunos, submissoes, cursos] = await Promise.all([
      alunoService.getAll(), // Alterado de listarAlunos para getAll
      certificadoService.getAll(),
      cursoService.getAll()
    ]);

    return { alunos, submissoes, cursos };
  }
};