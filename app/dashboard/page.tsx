"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { mockDb, type MockClass, type MockStudent, type MockProject, type MockGroup, type MockTask, type MockChatMessage } from "@/lib/mock-db";

// ═══════════════════════════════════════════════
// NexusForge OS — Dashboard Principal (Reactivo)
// ═══════════════════════════════════════════════

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const classId = searchParams.get("classId");
  const tab = searchParams.get("tab") || "general";
  const groupId = searchParams.get("groupId"); // Seleccionado por el maestro en la barra lateral

  // Estados locales para reactividad
  const [mounted, setMounted] = useState(false);
  const [classes, setClasses] = useState<MockClass[]>([]);
  const [students, setStudents] = useState<MockStudent[]>([]);
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [groups, setGroups] = useState<MockGroup[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Formulario de edición de proyecto para estudiante
  const [editingProject, setEditingProject] = useState<MockProject | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editGithub, setEditGithub] = useState("");
  const [editDeploy, setEditDeploy] = useState("");
  const [editVideo, setEditVideo] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Kanban & Chat States
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [chatMessages, setChatMessages] = useState<MockChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Nuevo grupo desde vista estudiante
  const [newGroupInput, setNewGroupInput] = useState("");
  const [groupActionError, setGroupActionError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Cargar datos del mock DB
  const loadData = () => {
    setClasses(mockDb.getClasses());
    setStudents(mockDb.getStudents());
    setProjects(mockDb.getProjects());
    setGroups(mockDb.getGroups());
    setTasks(mockDb.getTasks());
    setChatMessages(mockDb.getChatMessages());
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    loadData();
  }, [classId, tab, groupId]);

  // Escuchar eventos de actualización de grupos y clases
  useEffect(() => {
    window.addEventListener("groups-updated", loadData);
    window.addEventListener("classes-updated", loadData);
    return () => {
      window.removeEventListener("groups-updated", loadData);
      window.removeEventListener("classes-updated", loadData);
    };
  }, []);

  // Auto-scroll del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Cargar el proyecto del grupo activo del estudiante en la clase actual
  useEffect(() => {
    if (user?.role === "estudiante" && classId) {
      const student = mockDb.getStudents().find((s) => s.email === user.email);
      const studentGroupId = student?.classGroupIds?.[classId];
      if (student && studentGroupId) {
        const proj = mockDb.getProjectForGroup(studentGroupId);
        if (proj) {
          setEditingProject(proj);
          setEditTitle(proj.title);
          setEditDesc(proj.description);
          setEditGithub(proj.githubRepoUrl || "");
          setEditDeploy(proj.deployUrl || "");
          setEditVideo(proj.videoUrl || "");
        }
      } else {
        setEditingProject(null);
      }
    }
  }, [user, classId, students]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const updated = mockDb.updateProject(editingProject.id, {
      title: editTitle,
      description: editDesc,
      githubRepoUrl: editGithub,
      deployUrl: editDeploy,
      videoUrl: editVideo,
    });

    if (updated) {
      setEditingProject(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // El estudiante crea y se autoasigna a un grupo
  const handleStudentCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    setGroupActionError(null);
    if (!newGroupInput.trim() || !classId || !user) return;

    const group = mockDb.addGroup(newGroupInput, classId);
    const student = students.find((s) => s.email === user.email);
    if (student && group) {
      mockDb.assignStudentToGroup(student.id, group.id, classId);
      setNewGroupInput("");
      loadData();
    }
  };

  // El estudiante se une a un grupo existente
  const handleStudentJoinGroup = (targetGroupId: string) => {
    setGroupActionError(null);
    if (!user || !classId) return;

    const student = students.find((s) => s.email === user.email);
    if (student) {
      mockDb.assignStudentToGroup(student.id, targetGroupId, classId);
      loadData();
    }
  };

  // El estudiante abandona o se desvincula del grupo en esta clase
  const handleStudentLeaveGroup = () => {
    if (!user || !classId) return;
    const student = students.find((s) => s.email === user.email);
    if (student) {
      mockDb.assignStudentToGroup(student.id, null, classId);
      loadData();
    }
  };

  // Maestro asigna/mueve a un alumno a un grupo
  const handleAssignStudent = (studentId: string, targetGroupId: string) => {
    if (!classId) return;
    const parsedGroupId = targetGroupId === "none" ? null : targetGroupId;
    mockDb.assignStudentToGroup(studentId, parsedGroupId, classId);
    loadData();
  };

  // Crear Tarea en el Kanban
  const handleCreateTask = (e: React.FormEvent, activeGroupId: string) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !classId) return;

    mockDb.addTask(activeGroupId, classId, newTaskTitle, newTaskDesc, newTaskAssignee || undefined);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskAssignee("");
    setShowTaskForm(false);
    loadData();
  };

  // Mover Tarea en el Kanban
  const handleMoveTask = (taskId: string, currentStatus: "TODO" | "DOING" | "DONE", direction: "forward" | "backward") => {
    let nextStatus: "TODO" | "DOING" | "DONE" = currentStatus;
    if (currentStatus === "TODO" && direction === "forward") nextStatus = "DOING";
    else if (currentStatus === "DOING" && direction === "forward") nextStatus = "DONE";
    else if (currentStatus === "DOING" && direction === "backward") nextStatus = "TODO";
    else if (currentStatus === "DONE" && direction === "backward") nextStatus = "DOING";

    mockDb.updateTaskStatus(taskId, nextStatus);
    loadData();
  };

  // Enviar mensaje de chat
  const handleSendChat = (e: React.FormEvent, activeGroupId: string) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;

    const senderRole = user.role === "maestro" ? "Forge Master" : "Knight";
    mockDb.sendChatMessage(activeGroupId, user.username, senderRole, chatInput);
    setChatInput("");
    loadData();
  };

  // Colores por rango de proyecto
  const rankColors: Record<string, { base: string; text: string; glow: string }> = {
    Bronce: { base: "#CD7F32", text: "text-[#CD7F32]", glow: "rgba(205, 127, 50, 0.25)" },
    Plata: { base: "#C0C0C0", text: "text-[#C0C0C0]", glow: "rgba(192, 192, 192, 0.25)" },
    Oro: { base: "#F59E0B", text: "text-[#F59E0B]", glow: "rgba(245, 158, 11, 0.25)" },
    Platino: { base: "#38BDF8", text: "text-[#38BDF8]", glow: "rgba(56, 189, 248, 0.25)" },
    Diamante: { base: "#A855F7", text: "text-[#A855F7]", glow: "rgba(168, 85, 247, 0.25)" }
  };

  if (!mounted) {
    return <div className="text-center p-12 text-nf-text-muted">Cargando Forja Principal...</div>;
  }

  // ───────────────────────────────────────────────
  // VISTA 1: HOME (Solo Aulas / Clases)
  // ───────────────────────────────────────────────
  if (!classId) {
    const userClasses = user?.role === "maestro" 
      ? classes.filter(c => c.teacherId === user.id)
      : classes.filter(c => {
          const s = students.find(std => std.email === user?.email);
          return s ? s.classIds.includes(c.id) : false;
        });

    return (
      <div className="max-w-5xl mx-auto space-y-6 page-transition-enter">
        
        {/* Banner de Bienvenida Simplificado con look Tecnológico */}
        <div className="relative overflow-hidden rounded-2xl border border-nf-panel-border bg-gradient-to-br from-[#121620] to-[#0A0D14] p-8 shadow-2xl tech-grid-overlay">
          <div className="absolute top-0 right-0 w-64 h-64 bg-nf-violet/5 rounded-full filter blur-[80px] pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] font-bold text-nf-primary uppercase tracking-widest font-mono glow-text-violet">
              CENTRO DE MANDO INICIADO
            </span>
            <h1 className="text-3xl font-extrabold text-white font-display">
              Bienvenido, {user?.username}
            </h1>
            <p className="text-nf-text-muted text-sm max-w-xl font-mono text-[13px]">
              Accede a tus asignaturas y forjas activas a continuación para comenzar a gestionar código y metas.
            </p>
          </div>
        </div>

        {/* Listado de Clases */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-nf-text-muted uppercase tracking-wider font-mono px-1">
            Tus Forjas Activas ({userClasses.length})
          </h2>

          {userClasses.length === 0 ? (
            <div className="glass rounded-xl p-10 text-center border border-dashed border-nf-panel-border">
              <p className="text-nf-text-muted text-sm mb-4">No estás registrado en ninguna clase actualmente.</p>
              <button 
                onClick={() => {
                  const event = new CustomEvent("open-class-modal");
                  window.dispatchEvent(event);
                }} 
                className="nf-btn-primary !w-auto px-6 cursor-pointer hover:scale-105 transition-all"
              >
                {user?.role === "maestro" ? "Crear una Clase" : "Unirse a una Clase"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userClasses.map((cls) => (
                <div 
                  key={cls.id}
                  className="gaming-glow-card border border-nf-panel-border/80 hover:border-nf-primary/40 rounded-xl p-5 flex flex-col justify-between gap-4 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white shrink-0 font-mono overflow-hidden"
                      style={{ backgroundColor: `${cls.color}25`, border: `1.5px solid ${cls.color}` }}
                    >
                      {cls.iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cls.iconUrl} alt={cls.name} className="w-full h-full object-cover" />
                      ) : (
                        cls.iconLetter
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-md font-display">{cls.name}</h3>
                      <p className="text-[10px] text-nf-text-muted font-mono mt-0.5">CREADO: {new Date(cls.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-nf-panel-border/40">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-nf-text-muted">CÓDIGO:</span>
                      <code className="text-xs font-mono font-bold text-white bg-nf-void/80 px-2 py-1 rounded border border-nf-panel-border">
                        {cls.accessCode}
                      </code>
                      {user?.role === "maestro" && (
                        <button
                          onClick={() => handleCopyCode(cls.accessCode)}
                          className="text-nf-text-muted hover:text-nf-primary transition-colors cursor-pointer"
                          title="Copiar código"
                        >
                          {copiedCode === cls.accessCode ? (
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">¡Copiado!</span>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>

                    <Link
                      href={`/dashboard?classId=${cls.id}&tab=general`}
                      className="text-xs font-bold text-nf-primary hover:text-nf-primary-bright flex items-center gap-1 transition-colors cursor-pointer hover:scale-105 active:scale-95"
                    >
                      Entrar al Aula
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Cargar clase activa actual
  const currentClass = classes.find(c => c.id === classId);
  if (!currentClass) {
    return <div className="text-center p-12 text-nf-text-muted">Cargando clase...</div>;
  }

  // Estudiantes inscritos en la clase activa
  const classStudents = students.filter(s => s.classIds.includes(currentClass.id) && s.role === "estudiante");
  // Grupos en la clase activa
  const classGroups = groups.filter(g => g.classId === currentClass.id);

  // ───────────────────────────────────────────────
  // CASO DE USO 1: VISTA DE MAESTRO (Ya estructurada)
  // ───────────────────────────────────────────────
  if (user?.role === "maestro") {
    
    // Vista general del aula (Gestión total de Alumnos)
    if (tab === "general") {
      return (
        <div className="max-w-5xl mx-auto space-y-6 page-transition-enter">
          {/* Header de clase */}
          <div className="rounded-xl border border-nf-panel-border bg-[#10131B] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-nf-oro">
                CATEDRÁTICO ACTIVO
              </span>
              <h2 className="text-2xl font-black text-white font-display mt-1">{currentClass.name}</h2>
            </div>
            
            <div className="flex items-center gap-3 bg-nf-void/60 border border-nf-panel-border px-4 py-2.5 rounded-xl">
              <div className="text-left">
                <div className="text-[9px] font-mono font-bold text-nf-text-muted uppercase">Código de Acceso</div>
                <div className="text-sm font-mono font-bold text-white">{currentClass.accessCode}</div>
              </div>
              <button
                onClick={() => handleCopyCode(currentClass.accessCode)}
                className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-nf-text-muted hover:text-white transition-colors cursor-pointer"
              >
                {copiedCode === currentClass.accessCode ? (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">¡Copiado!</span>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Gestión / Asignación de Alumnos */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-nf-surface border border-nf-panel-border rounded-xl p-6 space-y-4">
                <div className="border-b border-nf-panel-border/50 pb-3 mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-display">
                    Gestión y Asignación de Grupos
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-nf-text-muted uppercase">
                    Total Operadores: {classStudents.length}
                  </span>
                </div>
                
                {classStudents.length === 0 ? (
                  <p className="text-xs text-nf-text-muted italic">No hay estudiantes inscritos en esta clase.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classStudents.map((std) => {
                      const studentGroupId = std.classGroupIds?.[currentClass.id];
                      return (
                        <div key={std.id} className="flex items-center justify-between gap-3 p-4 bg-nf-void/50 border border-nf-panel-border rounded-xl hover:border-nf-primary/30 transition-all hover-scale-micro">
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{std.username}</div>
                            <div className="text-[9px] font-mono text-nf-text-muted truncate mt-0.5">{std.email}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={studentGroupId || "none"}
                              onChange={(e) => handleAssignStudent(std.id, e.target.value)}
                              className="bg-nf-surface border border-nf-panel-border rounded px-3 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-nf-primary transition-all"
                            >
                              <option value="none">Sin Grupo / Libre</option>
                              {classGroups.map((g) => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      );
    }

    // Vista de proyecto de grupo seleccionado por el maestro
    if (tab === "project" && groupId) {
      const selectedGroup = groups.find((g) => g.id === groupId);
      const proj = projects.find((p) => p.groupId === groupId);

      if (!proj || !selectedGroup) {
        return (
          <div className="max-w-xl mx-auto glass rounded-2xl p-10 text-center border border-dashed border-nf-panel-border mt-8 text-nf-text-muted">
            Este grupo aún no tiene un proyecto configurado.
          </div>
        );
      }

      const groupMembers = classStudents.filter((s) => s.classGroupIds?.[currentClass.id] === groupId);
      const studentsWithoutGroup = classStudents.filter((s) => !s.classGroupIds?.[currentClass.id]);
      const currentRankColor = rankColors[proj.rank] || rankColors.Diamante;

      return (
        <div className="max-w-3xl mx-auto space-y-6 page-transition-enter">
          {/* Header del proyecto */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#11141D] p-6 border border-nf-panel-border rounded-xl">
            <div>
              <div className="text-[9px] font-mono font-bold text-nf-primary uppercase tracking-wider">GRUPO: {selectedGroup.name}</div>
              <h2 className="text-2xl font-black text-white font-display mt-1">{proj.title}</h2>
              <p className="text-xs text-nf-text-muted mt-1">{proj.description}</p>
            </div>

            <div className="flex gap-4 shrink-0">
              <div className="bg-nf-void/50 border border-nf-panel-border px-3.5 py-2 rounded-xl text-center">
                <div className="text-[8px] font-mono text-nf-text-muted uppercase">Rango</div>
                <div className="text-sm font-bold font-mono uppercase" style={{ color: currentRankColor.base }}>{proj.rank}</div>
              </div>
              <div className="bg-nf-void/50 border border-nf-panel-border px-3.5 py-2 rounded-xl text-center">
                <div className="text-[8px] font-mono text-nf-text-muted uppercase">Monedas</div>
                <div className="text-sm font-bold text-nf-oro font-mono">{proj.coins}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-nf-surface border border-nf-panel-border rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-bold text-white font-display border-b border-nf-panel-border/50 pb-2">Integraciones Técnicas</h3>
                
                <div className="space-y-4">
                  {proj.githubRepoUrl && (
                    <div className="flex items-center justify-between p-3.5 bg-nf-void/50 border border-nf-panel-border rounded-xl">
                      <div className="flex items-center gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-nf-text-muted">
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                        </svg>
                        <div>
                          <div className="text-xs font-bold text-white">Repositorio</div>
                          <a href={proj.githubRepoUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-mono text-nf-primary hover:underline truncate block max-w-[200px] mt-0.5">
                            {proj.githubRepoUrl}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {proj.deployUrl && (
                    <div className="flex items-center justify-between p-3.5 bg-nf-void/50 border border-nf-panel-border rounded-xl">
                      <div className="flex items-center gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-nf-text-muted">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        <div>
                          <div className="text-xs font-bold text-white">Producción</div>
                          <a href={proj.deployUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-mono text-nf-primary hover:underline truncate block max-w-[200px] mt-0.5">
                            {proj.deployUrl}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-nf-surface border border-nf-panel-border rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-mono font-bold text-nf-text-muted uppercase tracking-wider px-1">Integrantes ({groupMembers.length})</h4>
                {groupMembers.length === 0 ? (
                  <p className="text-[11px] text-nf-text-muted italic px-1">Grupo vacío</p>
                ) : (
                  <div className="space-y-2">
                    {groupMembers.map((m) => (
                      <div key={m.id} className="text-xs font-bold text-white p-2.5 bg-nf-void/35 border border-nf-panel-border/30 rounded-lg flex items-center justify-between">
                        <span>{m.username}</span>
                        <button
                          onClick={() => handleAssignStudent(m.id, "none")}
                          className="text-[10px] font-bold text-red-500 hover:text-red-400 cursor-pointer"
                          title="Remover del grupo"
                        >
                          Quitar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {studentsWithoutGroup.length > 0 && (
                <div className="bg-nf-surface border border-nf-panel-border rounded-2xl p-4 space-y-3">
                  <h4 className="text-[10px] font-mono font-bold text-nf-text-muted uppercase tracking-wider px-1">Agregar Estudiante</h4>
                  <div className="space-y-2">
                    {studentsWithoutGroup.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleAssignStudent(s.id, selectedGroup.id)}
                        className="w-full text-left p-2 rounded-lg bg-nf-void/50 border border-nf-panel-border/50 text-xs font-semibold text-nf-cyan hover:bg-nf-cyan hover:text-nf-void hover:border-nf-cyan transition-all cursor-pointer truncate"
                      >
                        + {s.username}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  // ───────────────────────────────────────────────
  // CASO DE USO 2: VISTA DE ESTUDIANTE (CON KANBAN Y CHAT)
  // ───────────────────────────────────────────────
  if (user?.role === "estudiante") {
    const student = students.find((s) => s.email === user.email);
    const studentGroupId = student?.classGroupIds?.[currentClass.id];
    const hasGroup = student && studentGroupId;
    const groupName = hasGroup ? (groups.find((g) => g.id === studentGroupId)?.name || "Tu Grupo") : null;

    // Integrantes del grupo del estudiante en esta clase
    const groupMembers = hasGroup ? classStudents.filter((s) => s.classGroupIds?.[currentClass.id] === studentGroupId) : [];
    
    // Tareas del Kanban filtradas por este grupo
    const groupTasks = hasGroup ? tasks.filter((t) => t.groupId === studentGroupId) : [];
    const todoTasks = groupTasks.filter((t) => t.status === "TODO");
    const doingTasks = groupTasks.filter((t) => t.status === "DOING");
    const doneTasks = groupTasks.filter((t) => t.status === "DONE");

    // Mensajes de chat filtrados por el grupo del estudiante
    const groupChatMessages = hasGroup ? chatMessages.filter((m) => m.groupId === studentGroupId) : [];

    // Calcular XP necesario para subir de Tier
    const currentCoins = editingProject?.coins || 0;
    let nextTierName = "Plata";
    let requiredCoins = 50;
    let currentTierProgress = 0;

    if (editingProject) {
      if (editingProject.rank === "Bronce") {
        nextTierName = "Plata";
        requiredCoins = 50;
        currentTierProgress = Math.min((currentCoins / 50) * 100, 100);
      } else if (editingProject.rank === "Plata") {
        nextTierName = "Oro";
        requiredCoins = 100;
        currentTierProgress = Math.min((currentCoins / 100) * 100, 100);
      } else if (editingProject.rank === "Oro") {
        nextTierName = "Platino";
        requiredCoins = 150;
        currentTierProgress = Math.min((currentCoins / 150) * 100, 100);
      } else if (editingProject.rank === "Platino") {
        nextTierName = "Diamante";
        requiredCoins = 200;
        currentTierProgress = Math.min((currentCoins / 200) * 100, 100);
      } else {
        nextTierName = "Máximo Rango";
        requiredCoins = 200;
        currentTierProgress = 100;
      }
    }

    const currentRank = editingProject?.rank || "Bronce";
    const currentRankColor = rankColors[currentRank] || rankColors.Diamante;

    return (
      <div className="max-w-[1400px] mx-auto space-y-6 page-transition-enter">
        
        {/* Banner Gigante del Aula (Incluye Imagen del Aula) */}
        <div className="relative overflow-hidden rounded-2xl border border-nf-panel-border bg-gradient-to-br from-[#10131B] to-[#0A0C12] p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 tech-grid-overlay">
          <div className="flex items-center gap-5">
            {/* Imagen del Aula seleccionada (gaming style) */}
            <div className="w-16 h-16 rounded-xl bg-nf-void/70 border border-nf-panel-border flex items-center justify-center p-1.5 shrink-0 shadow-lg relative overflow-hidden">
              {currentClass.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentClass.iconUrl} alt="Class Icon" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span className="text-xl font-bold text-nf-primary font-mono">{currentClass.iconLetter}</span>
              )}
              {/* Soft neon aura corresponding to color */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{ boxShadow: `inset 0 0 15px ${currentClass.color}` }}
              />
            </div>
            
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-nf-primary flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-nf-primary animate-ping" />
                Gremio de Ingeniería
              </span>
              <h2 className="text-3xl font-black text-white font-display mt-0.5 tracking-wide">{currentClass.name}</h2>
              <p className="text-xs text-nf-text-muted font-mono mt-0.5">CATEDRÁTICO: C. Principal — COD: {currentClass.accessCode}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-nf-void/60 border border-nf-panel-border px-4 py-2 rounded-xl">
            <span className="text-xs font-mono text-nf-text-muted">CÓDIGO AULA:</span>
            <code className="text-xs font-mono font-bold text-white">{currentClass.accessCode}</code>
            <button
              onClick={() => handleCopyCode(currentClass.accessCode)}
              className="p-1 rounded hover:bg-white/5 text-nf-text-muted hover:text-white transition-colors cursor-pointer"
            >
              {copiedCode === currentClass.accessCode ? (
                <span className="text-[10px] font-mono text-emerald-400 font-bold">¡Copiado!</span>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Layout de Doble Columna Principal: 2/3 Workspace + 1/3 Chat & Aliados */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* COLUMNA 1: ESPACIO DE TRABAJO (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Pestañas de Navegación de Aula */}
            <div className="flex border-b border-nf-panel-border/80">
              <Link
                href={`/dashboard?classId=${currentClass.id}&tab=general`}
                className={`px-5 py-3 text-xs uppercase font-bold tracking-wider cursor-pointer transition-all gaming-tab-btn ${
                  tab === "general"
                    ? "gaming-tab-btn-active text-white font-black glow-text-cyan"
                    : "text-nf-text-muted hover:text-white"
                }`}
              >
                [01] Mi Gremio
              </Link>
              
              {hasGroup && (
                <Link
                  href={`/dashboard?classId=${currentClass.id}&tab=kanban`}
                  className={`px-5 py-3 text-xs uppercase font-bold tracking-wider cursor-pointer transition-all gaming-tab-btn ${
                    tab === "kanban"
                      ? "gaming-tab-btn-active text-white font-black glow-text-violet"
                      : "text-nf-text-muted hover:text-white"
                  }`}
                >
                  [02] Tablero Kanban
                </Link>
              )}
            </div>

            {/* A: CONTENIDO PESTAÑA: MI GREMIO */}
            {tab === "general" && (
              <div className="space-y-6 page-transition-enter">
                {!hasGroup ? (
                  // Si no tiene grupo, se une o funda uno
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="gaming-glow-card rounded-2xl p-6 space-y-4 tech-grid-overlay">
                      <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest border-b border-nf-panel-border/80 pb-2">
                        Unirse a Clan Activo
                      </h3>
                      
                      {classGroups.length === 0 ? (
                        <p className="text-xs text-nf-text-muted italic pt-2 font-mono">No se han fundado gremios en esta clase.</p>
                      ) : (
                        <div className="space-y-3 pt-1 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                          {classGroups.map((g) => {
                            const members = students.filter(s => s.classGroupIds?.[currentClass.id] === g.id);
                            return (
                              <div key={g.id} className="flex items-center justify-between gap-3 p-3 bg-nf-void/50 border border-nf-panel-border rounded-xl hover:border-nf-cyan/30 transition-all hover-scale-micro">
                                <div>
                                  <div className="text-xs font-bold text-white">{g.name}</div>
                                  <div className="text-[9px] font-mono text-nf-text-muted mt-0.5">{members.length} integrantes</div>
                                </div>
                                <button
                                  onClick={() => handleStudentJoinGroup(g.id)}
                                  className="px-4 py-2 bg-nf-primary hover:bg-nf-primary-bright text-nf-void text-xs font-extrabold uppercase rounded-lg cursor-pointer transition-all shadow-md active:scale-95"
                                >
                                  Unirse
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="gaming-glow-card rounded-2xl p-6 space-y-4 flex flex-col justify-between tech-grid-overlay">
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest border-b border-nf-panel-border/80 pb-2">
                          Fundar Nuevo Gremio
                        </h3>
                        <p className="text-xs text-nf-text-muted leading-relaxed font-mono">
                          Si eres el líder de un nuevo clan de desarrollo, crea uno nuevo. Recibirás tu panel de telemetría de inmediato.
                        </p>
                      </div>

                      <form onSubmit={handleStudentCreateGroup} className="space-y-3 pt-4">
                        {groupActionError && (
                          <div className="p-2 rounded bg-nf-error-container/10 border border-nf-error/20 text-nf-error text-[10px] font-mono">
                            {groupActionError}
                          </div>
                        )}
                        <div>
                          <label className="nf-input-label">Nombre del Clan</label>
                          <input
                            type="text"
                            className="nf-input !bg-nf-void/80 focus:shadow-[0_0_15px_rgba(179,157,255,0.15)]"
                            placeholder="Ej. Alpha Squad"
                            value={newGroupInput}
                            onChange={(e) => setNewGroupInput(e.target.value)}
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-3 bg-gradient-to-r from-nf-primary to-nf-primary-bright text-nf-void text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-lg hover:shadow-nf-primary/20 transition-all hover:scale-102 active:scale-98"
                        >
                          Fundar y Unirme
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  // Si ya tiene grupo: Ver HUD del proyecto y editar metadatos
                  <>
                    {/* HUD del proyecto */}
                    <div className="gaming-glow-card rounded-xl p-6 border-l-4 border-l-nf-primary space-y-5 relative overflow-hidden tech-grid-overlay">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-nf-primary/5 rounded-full filter blur-[50px] pointer-events-none" />
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold font-mono text-nf-primary uppercase tracking-widest">
                              Gremio Activo: {groupName}
                            </span>
                            <button
                              onClick={handleStudentLeaveGroup}
                              className="px-2 py-0.5 rounded border border-red-500/20 hover:border-red-500/60 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer hover:scale-105 active:scale-95 animate-pulse"
                            >
                              Abandonar Gremio
                            </button>
                          </div>
                          <h2 className="text-3xl font-black text-white font-display mt-2 uppercase tracking-wide glow-text-violet">
                            {editingProject?.title || "Proyecto"}
                          </h2>
                        </div>

                        <div className="flex gap-4 shrink-0 font-mono">
                          <div className="bg-nf-void/80 border border-nf-panel-border px-4 py-2.5 rounded-xl text-center shadow-lg relative overflow-hidden">
                            <div className="text-[8px] text-nf-text-muted uppercase font-bold">Rango</div>
                            <div className="text-md font-black uppercase tracking-wider mt-0.5" style={{ color: currentRankColor.base }}>
                              {currentRank}
                            </div>
                          </div>
                          <div className="bg-nf-void/80 border border-nf-panel-border px-4 py-2.5 rounded-xl text-center shadow-lg">
                            <div className="text-[8px] text-nf-text-muted uppercase font-bold">Monedas</div>
                            <div className="text-md font-black text-nf-oro mt-0.5 glow-text-gold">{currentCoins}</div>
                          </div>
                        </div>
                      </div>

                      {/* RPG Experience Bar */}
                      <div className="space-y-2 pt-2 relative z-10">
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-nf-text-muted">
                          <span>PROGRESO HACIA EL SIGUIENTE RANGO: <b className="text-white uppercase font-black">{nextTierName}</b></span>
                          <span>{currentCoins} / {requiredCoins} COINS</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-nf-void/80 border border-nf-panel-border p-[2px] overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${currentTierProgress}%`,
                              background: `linear-gradient(90deg, var(--color-nf-violet), ${currentRankColor.base})`,
                              boxShadow: `0 0 10px ${currentRankColor.base}`
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Formulario Estilo Terminal */}
                    <div className="gaming-glow-card rounded-xl p-6 tech-grid-overlay">
                      <div className="border-b border-nf-panel-border/80 pb-3 mb-6">
                        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest">
                          CONFIGURACIÓN DE TELEMETRÍA (METADATOS)
                        </h3>
                        <p className="text-xs text-nf-text-muted font-mono mt-1">Vincula los repositorios y despliegues técnicos del producto.</p>
                      </div>

                      {saveSuccess && (
                        <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono animate-fade-in">
                          ✔ Ajustes técnicos actualizados con éxito.
                        </div>
                      )}

                      <form onSubmit={handleSaveProject} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label className="nf-input-label">Nombre del Software</label>
                            <input
                              type="text"
                              className="nf-input !bg-nf-void/70 focus:shadow-[0_0_15px_rgba(179,157,255,0.15)]"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label className="nf-input-label">Enlace de GitHub</label>
                            <input
                              type="url"
                              className="nf-input !bg-nf-void/70 font-mono focus:shadow-[0_0_15px_rgba(179,157,255,0.15)]"
                              value={editGithub}
                              onChange={(e) => setEditGithub(e.target.value)}
                              placeholder="https://github.com/usuario/repo"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="nf-input-label">Descripción del Sistema</label>
                          <textarea
                            rows={3}
                            className="nf-input !bg-nf-void/70 resize-none py-3 text-sm focus:shadow-[0_0_15px_rgba(179,157,255,0.15)]"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label className="nf-input-label">Dirección de Producción (URL)</label>
                            <input
                              type="url"
                              className="nf-input !bg-nf-void/70 font-mono focus:shadow-[0_0_15px_rgba(179,157,255,0.15)]"
                              value={editDeploy}
                              onChange={(e) => setEditDeploy(e.target.value)}
                              placeholder="https://proyecto.vercel.app"
                            />
                          </div>
                          <div>
                            <label className="nf-input-label">Video Demostrativo</label>
                            <input
                              type="url"
                              className="nf-input !bg-nf-void/70 font-mono focus:shadow-[0_0_15px_rgba(179,157,255,0.15)]"
                              value={editVideo}
                              onChange={(e) => setEditVideo(e.target.value)}
                              placeholder="https://youtube.com/watch?v=..."
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-3">
                          <button
                            type="submit"
                            className="nf-btn-primary !w-auto px-8 py-3.5 bg-gradient-to-r from-nf-primary to-nf-primary-bright text-nf-void uppercase font-bold text-xs tracking-wider rounded-xl shadow-lg hover:shadow-nf-primary/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            Sincronizar Datos
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* B: CONTENIDO PESTAÑA: TABLERO KANBAN (Detalle 3) */}
            {tab === "kanban" && hasGroup && (
              <div className="space-y-6 page-transition-enter">
                <div className="flex justify-between items-center bg-[#11141D] border border-nf-panel-border p-4 rounded-xl">
                  <div>
                    <h3 className="text-md font-bold text-white font-mono uppercase tracking-widest">Tablero de Misiones</h3>
                    <p className="text-xs text-nf-text-muted font-mono mt-0.5">Monitorea y actualiza las tareas atómicas del equipo.</p>
                  </div>
                  <button
                    onClick={() => setShowTaskForm(!showTaskForm)}
                    className="px-4 py-2 rounded-lg bg-nf-violet text-nf-void text-xs font-bold uppercase hover:bg-nf-primary transition-all cursor-pointer hover:scale-105"
                  >
                    {showTaskForm ? "Cerrar" : "Crear Misión"}
                  </button>
                </div>

                {/* Formulario de Nueva Misión */}
                {showTaskForm && (
                  <form 
                    onSubmit={(e) => handleCreateTask(e, studentGroupId)}
                    className="gaming-glow-card rounded-xl p-5 space-y-4 animate-slide-up"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="nf-input-label">Título de la Tarea</label>
                        <input
                          type="text"
                          className="nf-input !bg-nf-void/80"
                          placeholder="Ej. Integrar cookies"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="nf-input-label">Descripción</label>
                        <input
                          type="text"
                          className="nf-input !bg-nf-void/80"
                          placeholder="Ej. Configurar @supabase/ssr"
                          value={newTaskDesc}
                          onChange={(e) => setNewTaskDesc(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="nf-input-label">Asignar Responsable</label>
                        <select
                          value={newTaskAssignee}
                          onChange={(e) => setNewTaskAssignee(e.target.value)}
                          className="nf-input !bg-nf-void/80 text-white outline-none cursor-pointer focus:border-nf-primary transition-all"
                        >
                          <option value="">Sin Asignar</option>
                          {groupMembers.map((m) => (
                            <option key={m.id} value={m.id} className="bg-nf-surface text-white">
                              {m.username}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button 
                        type="submit" 
                        className="px-5 py-2.5 rounded-lg bg-nf-cyan text-nf-void text-xs font-extrabold uppercase hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Añadir Tarea
                      </button>
                    </div>
                  </form>
                )}

                {/* Columnas Kanban */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Columna TODO */}
                  <div className="gaming-glow-card rounded-xl p-4 flex flex-col gap-3 min-h-[300px] border-t-2 border-t-red-500">
                    <div className="flex justify-between items-center border-b border-nf-panel-border pb-2 mb-1">
                      <span className="text-xs font-mono font-bold text-white tracking-wider">TODO ({todoTasks.length})</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    </div>
                    {todoTasks.map((t) => {
                      const assignedStudent = students.find((s) => s.id === t.assignedToId);
                      return (
                        <div key={t.id} className="bg-nf-void/60 border border-nf-panel-border/80 rounded-lg p-3 space-y-3 hover:border-red-500/30 transition-all flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-white">{t.title}</div>
                            {t.description && <div className="text-[10px] text-nf-text-muted">{t.description}</div>}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-nf-panel-border/30 gap-2">
                            {/* Selector de Asignación */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div 
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-mono font-black shrink-0 border ${
                                  assignedStudent 
                                    ? "bg-nf-primary/10 border-nf-primary/40 text-nf-primary glow-text-violet"
                                    : "bg-nf-void/80 border-nf-panel-border text-nf-text-muted"
                                }`}
                                title={assignedStudent ? `Asignado a: ${assignedStudent.username}` : "Sin asignar"}
                              >
                                {assignedStudent ? assignedStudent.username.slice(0, 2).toUpperCase() : "?"}
                              </div>
                              <select
                                value={t.assignedToId || ""}
                                onChange={(e) => {
                                  mockDb.updateTaskAssignee(t.id, e.target.value || undefined);
                                  loadData();
                                }}
                                className="bg-transparent border-none text-[10px] text-nf-text-muted hover:text-white outline-none cursor-pointer font-mono font-bold max-w-[100px] truncate"
                              >
                                <option value="" className="bg-nf-surface text-white">Sin asignar</option>
                                {groupMembers.map((m) => (
                                  <option key={m.id} value={m.id} className="bg-nf-surface text-white">
                                    {m.username}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <button
                              onClick={() => handleMoveTask(t.id, t.status, "forward")}
                              className="text-[9px] font-mono font-black text-nf-cyan hover:text-white flex items-center gap-0.5 cursor-pointer uppercase tracking-wider shrink-0"
                            >
                              Trabajar ➔
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Columna DOING */}
                  <div className="gaming-glow-card rounded-xl p-4 flex flex-col gap-3 min-h-[300px] border-t-2 border-t-nf-warning">
                    <div className="flex justify-between items-center border-b border-nf-panel-border pb-2 mb-1">
                      <span className="text-xs font-mono font-bold text-white tracking-wider">DOING ({doingTasks.length})</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-nf-warning animate-ping" />
                    </div>
                    {doingTasks.map((t) => {
                      const assignedStudent = students.find((s) => s.id === t.assignedToId);
                      return (
                        <div key={t.id} className="bg-nf-void/60 border border-nf-panel-border/80 rounded-lg p-3 space-y-3 hover:border-nf-warning/30 transition-all flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-white">{t.title}</div>
                            {t.description && <div className="text-[10px] text-nf-text-muted">{t.description}</div>}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-nf-panel-border/30 gap-2">
                            {/* Selector de Asignación */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div 
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-mono font-black shrink-0 border ${
                                  assignedStudent 
                                    ? "bg-nf-primary/10 border-nf-primary/40 text-nf-primary glow-text-violet"
                                    : "bg-nf-void/80 border-nf-panel-border text-nf-text-muted"
                                }`}
                                title={assignedStudent ? `Asignado a: ${assignedStudent.username}` : "Sin asignar"}
                              >
                                {assignedStudent ? assignedStudent.username.slice(0, 2).toUpperCase() : "?"}
                              </div>
                              <select
                                value={t.assignedToId || ""}
                                onChange={(e) => {
                                  mockDb.updateTaskAssignee(t.id, e.target.value || undefined);
                                  loadData();
                                }}
                                className="bg-transparent border-none text-[10px] text-nf-text-muted hover:text-white outline-none cursor-pointer font-mono font-bold max-w-[85px] truncate"
                              >
                                <option value="" className="bg-nf-surface text-white">Sin asignar</option>
                                {groupMembers.map((m) => (
                                  <option key={m.id} value={m.id} className="bg-nf-surface text-white">
                                    {m.username}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleMoveTask(t.id, t.status, "backward")}
                                className="text-[9px] font-mono font-black text-red-500 hover:text-red-400 cursor-pointer uppercase tracking-wider"
                                title="Regresar"
                              >
                                ⮌
                              </button>
                              <button
                                onClick={() => handleMoveTask(t.id, t.status, "forward")}
                                className="text-[9px] font-mono font-black text-emerald-400 hover:text-emerald-300 cursor-pointer uppercase tracking-wider"
                              >
                                Terminar ➔
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Columna DONE */}
                  <div className="gaming-glow-card rounded-xl p-4 flex flex-col gap-3 min-h-[300px] border-t-2 border-t-emerald-500">
                    <div className="flex justify-between items-center border-b border-nf-panel-border pb-2 mb-1">
                      <span className="text-xs font-mono font-bold text-white tracking-wider">DONE ({doneTasks.length})</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    {doneTasks.map((t) => {
                      const assignedStudent = students.find((s) => s.id === t.assignedToId);
                      return (
                        <div key={t.id} className="bg-nf-void/60 border border-nf-panel-border/80 rounded-lg p-3 space-y-3 hover:border-emerald-500/30 transition-all opacity-85 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-white line-through decoration-nf-panel-border">{t.title}</div>
                            {t.description && <div className="text-[10px] text-nf-text-muted line-through decoration-nf-panel-border">{t.description}</div>}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-nf-panel-border/30 gap-2">
                            {/* Selector de Asignación */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div 
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-mono font-black shrink-0 border ${
                                  assignedStudent 
                                    ? "bg-nf-primary/10 border-nf-primary/40 text-nf-primary glow-text-violet"
                                    : "bg-nf-void/80 border-nf-panel-border text-nf-text-muted"
                                }`}
                                title={assignedStudent ? `Asignado a: ${assignedStudent.username}` : "Sin asignar"}
                              >
                                {assignedStudent ? assignedStudent.username.slice(0, 2).toUpperCase() : "?"}
                              </div>
                              <select
                                value={t.assignedToId || ""}
                                onChange={(e) => {
                                  mockDb.updateTaskAssignee(t.id, e.target.value || undefined);
                                  loadData();
                                }}
                                className="bg-transparent border-none text-[10px] text-nf-text-muted hover:text-white outline-none cursor-pointer font-mono font-bold max-w-[100px] truncate"
                              >
                                <option value="" className="bg-nf-surface text-white">Sin asignar</option>
                                {groupMembers.map((m) => (
                                  <option key={m.id} value={m.id} className="bg-nf-surface text-white">
                                    {m.username}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <button
                              onClick={() => handleMoveTask(t.id, t.status, "backward")}
                              className="text-[9px] font-mono font-black text-nf-warning hover:text-yellow-400 cursor-pointer uppercase tracking-wider shrink-0"
                            >
                              ⮌ Reabrir
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA 2: CHAT DE GRUPO & INTEGRANTES (1/3 de ancho) (Detalle 1 & 4) */}
          <div className="space-y-6">
            
            {/* Panel de Integrantes (Aliados de Gremio Exclusivos) */}
            <div className="gaming-glow-card rounded-xl p-4 space-y-3 tech-grid-overlay">
              <h4 className="text-xs font-mono font-bold text-nf-text-muted uppercase tracking-widest border-b border-nf-panel-border/80 pb-2">
                Mi Gremio / Aliados ({groupMembers.length})
              </h4>
              
              {!hasGroup ? (
                <p className="text-xs text-nf-text-muted italic px-1 font-mono">Sin gremio vinculado</p>
              ) : (
                <div className="space-y-2.5">
                  {groupMembers.map((m) => {
                    const rolesMap = ["DevOps Mage", "Frontend Ranger", "Backend Rogue", "Fullstack Knight"];
                    const studentIndex = m.username.charCodeAt(0) % rolesMap.length;
                    const gameRole = rolesMap[studentIndex];

                    return (
                      <div key={m.id} className="flex items-center gap-3 p-2 bg-nf-void/40 border border-nf-panel-border/40 rounded-lg hover-scale-micro">
                        <div className="w-8 h-8 rounded-full bg-nf-primary/10 border border-nf-primary/30 flex items-center justify-center text-[10px] font-mono font-black text-nf-primary shrink-0">
                          {m.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-white truncate">{m.username}</div>
                          <div className="text-[9px] font-mono font-bold text-nf-cyan uppercase tracking-wider mt-0.5">{gameRole}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Panel de Chat de Grupo Exclusivo */}
            <div className="gaming-glow-card rounded-xl flex flex-col h-[400px] justify-between overflow-hidden border border-nf-panel-border tech-grid-overlay">
              {/* Chat Header */}
              <div className="p-3 bg-nf-void/80 border-b border-nf-panel-border/80 flex items-center justify-between shrink-0">
                <span className="text-xs font-mono font-black text-white tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Chat de Clan
                </span>
                <span className="text-[9px] font-mono text-nf-text-muted">Canal Encriptado</span>
              </div>

              {/* Chat Body (Messages List) */}
              <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3 bg-[#090B0F]/30">
                {!hasGroup ? (
                  <div className="h-full flex items-center justify-center text-center p-4">
                    <p className="text-xs font-mono text-nf-text-muted italic">Únete a un grupo para abrir el chat del clan.</p>
                  </div>
                ) : (
                  <>
                    {groupChatMessages.map((msg) => {
                      const isMe = msg.senderName === user?.username;
                      return (
                        <div 
                          key={msg.id} 
                          className={`flex flex-col max-w-[85%] ${
                            isMe ? "ml-auto items-end" : "mr-auto items-start"
                          }`}
                        >
                          <span className="text-[9px] font-mono text-nf-text-muted mb-0.5">
                            {msg.senderName} • {msg.timestamp}
                          </span>
                          <div 
                            className={`p-2.5 rounded-xl text-xs font-mono leading-relaxed ${
                              isMe 
                                ? "bg-nf-primary-container/40 border border-nf-primary-bright/20 text-nf-primary-container"
                                : "bg-nf-surface border border-nf-panel-border text-nf-on-surface"
                            }`}
                            style={{
                              color: isMe ? "var(--color-nf-primary)" : "var(--color-nf-on-surface)"
                            }}
                          >
                            {msg.message}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input */}
              {hasGroup && (
                <form 
                  onSubmit={(e) => handleSendChat(e, studentGroupId)}
                  className="p-2 bg-nf-void/80 border-t border-nf-panel-border/80 flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    className="flex-1 bg-nf-surface/80 border border-nf-panel-border rounded-lg text-xs font-mono px-3 py-2 text-white outline-none focus:border-nf-primary"
                    placeholder="Escribe en la frecuencia..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    required
                  />
                  <button 
                    type="submit"
                    className="p-2 rounded-lg bg-nf-primary hover:bg-nf-primary-bright text-nf-void shrink-0 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>

      </div>
    );
  }

  return null;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-center p-12 text-nf-text-muted">Cargando Forja Principal...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}
