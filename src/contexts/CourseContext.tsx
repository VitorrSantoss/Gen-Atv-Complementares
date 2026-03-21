{/* ============================================================== */}
{/* 1. Este ficheiro tem como objetivo garantir que, quando o aluno 
   seleciona um curso no Dashboard, essa escolha seja lembrada nas outras páginas (Submissão e Notificações).                                             */}
{/* ============================================================== */}

import React, { createContext, useContext, useState } from 'react';

// Movendo os dados mockados para o contexto para serem globais
// Adicionado o objeto de categorias com limite e horas aprovadas
// Horas aprovadas, pendentes e rejeitadas para cada curso, para que seja possível mostrar o progresso do curso no dashboard do aluno
const initialCourses = [
 { 
   id: "1", name: "Engenharia de Software", meta: 200, aprovadas: 120, pendentes: 20, rejeitadas: 5,
   categorias: {
     Ensino: { limite: 100, aprovadas: 80 },
     Pesquisa: { limite: 60, aprovadas: 20 },
     Extensao: { limite: 40, aprovadas: 10 },
     Cultural: { limite: 20, aprovadas: 10 }
   }
 },
 { 
   id: "2", name: "Administração", meta: 150, aprovadas: 45, pendentes: 10, rejeitadas: 2,
   categorias: {
     Ensino: { limite: 80, aprovadas: 20 },
     Pesquisa: { limite: 40, aprovadas: 10 },
     Extensao: { limite: 30, aprovadas: 10 },
     Cultural: { limite: 10, aprovadas: 5 }
   }
 },
];

interface CourseContextData {
 courses: typeof initialCourses;
 activeCourseId: string;
 setActiveCourseId: (id: string) => void;
 activeCourse: typeof initialCourses[0];
}

const CourseContext = createContext<CourseContextData | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [courses] = useState(initialCourses);
 const [activeCourseId, setActiveCourseId] = useState(courses[0].id);

 const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

 return (
   <CourseContext.Provider value={{ courses, activeCourseId, setActiveCourseId, activeCourse }}>
     {children}
   </CourseContext.Provider>
 );
};

// Hook personalizado para facilitar o uso
export const useCourse = () => {
 const context = useContext(CourseContext);
 if (!context) throw new Error("useCourse deve ser usado dentro de um CourseProvider");
 return context;
};