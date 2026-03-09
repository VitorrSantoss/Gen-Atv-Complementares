import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Save } from "lucide-react";

const initialRules = [
  { id: "1", area: "Pesquisa", maxHoras: 80, descricao: "Iniciação científica, publicações, congressos" },
  { id: "2", area: "Extensão", maxHoras: 60, descricao: "Projetos de extensão, voluntariado acadêmico" },
  { id: "3", area: "Ensino", maxHoras: 40, descricao: "Monitoria, tutoria, cursos de capacitação" },
  { id: "4", area: "Cultural", maxHoras: 30, descricao: "Eventos culturais, exposições, palestras" },
  { id: "5", area: "Social", maxHoras: 30, descricao: "Trabalho voluntário, ações comunitárias" },
];

const CoordinatorRules = () => {
  const [rules, setRules] = useState(initialRules);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState(0);

  const startEdit = (id: string, current: number) => { setEditing(id); setEditValue(current); };
  const saveEdit = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, maxHoras: editValue } : r));
    setEditing(null);
  };

  const totalMax = rules.reduce((acc, r) => acc + r.maxHoras, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans' }}>Motor de Regras</h1>
        <p className="text-muted-foreground mt-1">Configure os limites de horas por área de atividade</p>
      </div>

      <Card className="glass-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Limites por Área</CardTitle>
            <div className="text-sm text-muted-foreground">
              Total máximo: <span className="font-bold text-foreground">{totalMax}h</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Área</TableHead>
                <TableHead>Máx. Horas</TableHead>
                <TableHead className="hidden md:table-cell">Descrição</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.area}</TableCell>
                  <TableCell>
                    {editing === rule.id ? (
                      <Input type="number" className="w-20" value={editValue} onChange={(e) => setEditValue(Number(e.target.value))} />
                    ) : (
                      <span className="font-semibold text-primary">{rule.maxHoras}h</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{rule.descricao}</TableCell>
                  <TableCell className="text-right">
                    {editing === rule.id ? (
                      <Button variant="ghost" size="icon" onClick={() => saveEdit(rule.id)}><Save className="h-4 w-4 text-success" /></Button>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => startEdit(rule.id, rule.maxHoras)}><Pencil className="h-4 w-4" /></Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader><CardTitle className="text-lg">Visualização dos Limites</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{rule.area}</span>
                  <span className="text-muted-foreground">{rule.maxHoras}h</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${(rule.maxHoras / 100) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoordinatorRules;
