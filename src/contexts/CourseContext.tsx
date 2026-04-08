import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { courseService } from "@/services/admin/courseService";

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface CategoriaProgresso {
  limite: number;
  aprovadas: number;
}

export interface Course {
  id: string;
  name: string;
  meta: number;
  aprovadas: number;
  pendentes: number;
  rejeitadas: number;
  categorias?: Record<string, CategoriaProgresso>;
}

interface CourseContextType {
  courses: Course[];
  activeCourseId: string;
  setActiveCourseId: (id: string) => void;
  activeCourse: Course;
  isLoading: boolean;
  /**
   * Atualiza o progresso de horas de um curso com base nas submissões do aluno.
   * Deve ser chamado após carregar as submissões.
   */
  updateProgress: (
    courseId: string,
    aprovadas: number,
    pendentes: number,
    rejeitadas: number
  ) => void;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaultCourse: Course = {
  id: "",
  name: "Carregando...",
  meta: 0,
  aprovadas: 0,
  pendentes: 0,
  rejeitadas: 0,
};

// ─── Context ─────────────────────────────────────────────────────────────────

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Busca os cursos do back-end ao montar
  useEffect(() => {
    courseService
      .getAll()
      .then((data) => {
        const mapped: Course[] = data.map((c) => ({
          id: c.id.toString(),
          name: c.nome,
          meta: c.cargaHorariaMinima,
          aprovadas: 0,
          pendentes: 0,
          rejeitadas: 0,
          categorias: {
            Ensino: { limite: Math.floor(c.cargaHorariaMinima * 0.4), aprovadas: 0 },
            Pesquisa: { limite: Math.floor(c.cargaHorariaMinima * 0.35), aprovadas: 0 },
            Extensao: { limite: Math.floor(c.cargaHorariaMinima * 0.25), aprovadas: 0 },
          },
        }));

        setCourses(mapped);
        if (mapped.length > 0) setActiveCourseId(mapped[0].id);
      })
      .catch(() => {
        // fallback vazio — o StudentDashboard mostrará estado de erro
        setCourses([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const updateProgress = (
    courseId: string,
    aprovadas: number,
    pendentes: number,
    rejeitadas: number
  ) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, aprovadas, pendentes, rejeitadas } : c
      )
    );
  };

  const activeCourse =
    courses.find((c) => c.id === activeCourseId) ?? defaultCourse;

  return (
    <CourseContext.Provider
      value={{
        courses,
        activeCourseId,
        setActiveCourseId,
        activeCourse,
        isLoading,
        updateProgress,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourse must be used within CourseProvider");
  return ctx;
}