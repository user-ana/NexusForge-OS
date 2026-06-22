"use client";

import { useState, type ReactNode, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { mockDb, type MockClass, type MockGroup } from "@/lib/mock-db";

// ═══════════════════════════════════════════════
// NexusForge OS — Layout con Barra Lateral Discord
// ═══════════════════════════════════════════════

const GAMING_ICONS = [
  { id: "sword", name: "Cyber Sword", path: "/icons/sword.png" },
  { id: "shield", name: "Tech Shield", path: "/icons/shield.png" },
  { id: "crystal", name: "Mana Crystal", path: "/icons/crystal.png" },
  { id: "potion", name: "Red Flask", path: "/icons/potion.png" },
  { id: "crown", name: "Guild Crown", path: "/icons/crown.png" },
];

function DashboardLayoutInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, signOut, isLoading } = useAuth();
  
  const [classes, setClasses] = useState<MockClass[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false); // Modal para crear grupo (Maestro)
  const [classNameInput, setClassNameInput] = useState("");
  const [classCodeInput, setClassCodeInput] = useState("");
  const [groupNameInput, setGroupNameInput] = useState(""); // Input de nombre de grupo
  const [selectedIcon, setSelectedIcon] = useState("/icons/sword.png");
  const [modalError, setModalError] = useState<string | null>(null);
  
  const activeClassId = searchParams.get("classId");
  const activeTab = searchParams.get("tab") || "general";
  const activeGroupId = searchParams.get("groupId");

  const [activeClassGroups, setActiveClassGroups] = useState<MockGroup[]>([]);

  // Set mounted flag
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar clases asociadas al usuario
  useEffect(() => {
    if (!user) return;
    const all = mockDb.getClasses();
    if (user.role === "maestro") {
      setClasses(all.filter((c) => c.teacherId === user.id));
    } else {
      const students = mockDb.getStudents();
      const currentStudent = students.find((s) => s.email === user.email);
      if (currentStudent) {
        setClasses(all.filter((c) => currentStudent.classIds.includes(c.id)));
      }
    }
  }, [user, showClassModal]);

  // Escuchar evento para abrir modal de clase desde el dashboard
  useEffect(() => {
    const handleOpen = () => setShowClassModal(true);
    window.addEventListener("open-class-modal", handleOpen);
    return () => window.removeEventListener("open-class-modal", handleOpen);
  }, []);

  // Cargar grupos de la clase activa si el usuario es maestro
  useEffect(() => {
    if (activeClassId && user?.role === "maestro") {
      setActiveClassGroups(mockDb.getGroupsInClass(activeClassId));
    } else {
      setActiveClassGroups([]);
    }
  }, [activeClassId, user, showGroupModal]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleCreateOrJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (user?.role === "maestro") {
      if (!classNameInput || !classCodeInput) {
        setModalError("Completa todos los campos");
        return;
      }
      const all = mockDb.getClasses();
      if (all.some((c) => c.accessCode === classCodeInput.toUpperCase())) {
        setModalError("El código de acceso ya está en uso");
        return;
      }
      mockDb.addClass(classNameInput, classCodeInput, user.id, selectedIcon);
      setShowClassModal(false);
      setClassNameInput("");
      setClassCodeInput("");
      setSelectedIcon("/icons/sword.png");
      window.dispatchEvent(new CustomEvent("classes-updated"));
    } else {
      if (!classCodeInput) {
        setModalError("Ingresa un código de clase");
        return;
      }
      const result = mockDb.joinClass(user?.email || "", classCodeInput);
      if (result.error) {
        setModalError(result.error);
        return;
      }
      setShowClassModal(false);
      setClassCodeInput("");
      window.dispatchEvent(new CustomEvent("classes-updated"));
      if (result.targetClass) {
        router.push(`/dashboard?classId=${result.targetClass.id}&tab=general`);
      }
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupNameInput || !activeClassId) return;

    mockDb.addGroup(groupNameInput, activeClassId);
    setShowGroupModal(false);
    setGroupNameInput("");

    // Trigger local state reload by reloading groups
    setActiveClassGroups(mockDb.getGroupsInClass(activeClassId));
    
    // Disparar evento para que la vista del dashboard se entere del nuevo grupo
    const event = new CustomEvent("groups-updated");
    window.dispatchEvent(event);
  };

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "OP";
  const selectedClass = classes.find((c) => c.id === activeClassId);

  // Ocultar segunda columna de canales si:
  // - No hay clase seleccionada (Home).
  // - O si el usuario es estudiante (los estudiantes no necesitan esta barra ya que usan pestañas).
  const shouldHideSecondarySidebar = !activeClassId || (user?.role === "estudiante" && activeClassId);

  if (!mounted) {
    return <div className="text-center p-12 text-nf-text-muted">Cargando Forja Principal...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-nf-void font-sans select-none">
      
      {/* ── 1. Discord Server Sidebar (Far Left) ── */}
      <aside className="w-[72px] bg-nf-surface border-r border-nf-panel-border flex flex-col items-center py-4 gap-2 shrink-0 z-40">
        {/* Home icon */}
        <Link
          href="/dashboard"
          className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-nf-surface-container flex items-center justify-center transition-all duration-200 group relative shrink-0 ${
            !activeClassId ? "!rounded-[16px] bg-nf-violet/30 text-nf-primary" : "text-nf-text-muted hover:bg-nf-violet/20 hover:text-nf-on-surface"
          }`}
          title="Panel General"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded bg-nf-surface-highest text-nf-on-surface text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
            Clases
          </div>
          {!activeClassId && <div className="absolute left-0 w-1 h-5 bg-nf-primary rounded-r" />}
        </Link>

        <div className="w-8 h-[2px] bg-nf-panel-border my-1 shrink-0" />

        {/* Classes List */}
        <div className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {classes.map((cls) => {
            const isActive = cls.id === activeClassId;
            return (
              <Link
                key={cls.id}
                href={`/dashboard?classId=${cls.id}&tab=general`}
                className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] flex items-center justify-center transition-all duration-200 group relative font-mono text-[14px] font-bold shrink-0 overflow-hidden ${
                  isActive
                    ? "rounded-[16px] text-white"
                    : "text-nf-text-muted hover:text-white"
                }`}
                style={{
                  backgroundColor: isActive ? cls.color : `${cls.color}25`,
                  border: `1.5px solid ${cls.color}60`,
                }}
              >
                {cls.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cls.iconUrl}
                    alt={cls.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  cls.iconLetter
                )}
                
                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded bg-nf-surface-highest text-nf-on-surface text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                  {cls.name}
                </div>
                
                {/* Left Active Line */}
                {isActive && <div className="absolute left-0 w-1 h-6 bg-white rounded-r" />}
              </Link>
            );
          })}

          {/* Plus Button */}
          <button
            onClick={() => setShowClassModal(true)}
            className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-nf-surface-highest border border-dashed border-nf-panel-border flex items-center justify-center text-nf-primary hover:bg-nf-primary hover:text-nf-void transition-all duration-200 group relative cursor-pointer shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded bg-nf-surface-highest text-nf-on-surface text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
              {user?.role === "maestro" ? "Crear Clase" : "Unirse a Clase"}
            </div>
          </button>
        </div>

        {/* Sign Out Button at Bottom */}
        <button
          onClick={handleSignOut}
          disabled={!mounted || isLoading}
          className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-nf-surface-container/40 hover:bg-red-500/10 text-nf-text-muted hover:text-red-500 flex items-center justify-center transition-all duration-200 group relative cursor-pointer shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded bg-nf-surface-highest text-nf-on-surface text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
            Cerrar Sesión
          </div>
        </button>
      </aside>

      {/* ── 2. Channel/Section Sidebar (Discord Second Column) ── */}
      {!shouldHideSecondarySidebar && (
        <aside className="w-60 bg-nf-surface-dim border-r border-nf-panel-border flex flex-col justify-between shrink-0 z-30 animate-fade-in">
          <div>
            {/* Header Area */}
            <div className="h-14 border-b border-nf-panel-border/80 flex items-center px-4 justify-between bg-nf-surface/20">
              <span className="font-semibold text-[13px] text-nf-on-surface truncate pr-2 font-display" title={selectedClass?.name || "NexusForge OS"}>
                {selectedClass?.name || "NexusForge OS"}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-nf-primary animate-glow-pulse" />
            </div>

            {/* Navigation channels */}
            <nav className="p-3 space-y-1">
              {selectedClass && (
                <>
                  <Link
                    href={`/dashboard?classId=${selectedClass.id}&tab=general`}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-all ${
                      activeTab === "general"
                        ? "bg-white/5 text-white font-medium"
                        : "text-nf-text-muted hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-nf-text-muted font-bold">#</span> general
                  </Link>

                  {/* Header Seccion: Grupos de Aula (Detalle 2) */}
                  <div className="flex items-center justify-between px-3 pt-5 mb-1.5">
                    <span className="text-[10px] font-bold text-nf-text-muted/60 uppercase tracking-wider font-mono">
                      Grupos de Aula
                    </span>
                    {user?.role === "maestro" && (
                      <button
                        onClick={() => setShowGroupModal(true)}
                        className="text-nf-text-muted hover:text-white transition-colors cursor-pointer"
                        title="Crear Grupo"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {activeClassGroups.length === 0 ? (
                    <div className="text-[11px] text-nf-text-muted/50 font-mono px-3 italic pt-1">
                      Sin grupos creados
                    </div>
                  ) : (
                    activeClassGroups.map((g) => {
                      const isGroupActive = activeTab === "project" && activeGroupId === g.id;
                      return (
                        <Link
                          key={g.id}
                          href={`/dashboard?classId=${selectedClass.id}&tab=project&groupId=${g.id}`}
                          className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-all truncate ${
                            isGroupActive
                              ? "bg-white/5 text-white font-medium"
                              : "text-nf-text-muted hover:bg-white/5 hover:text-white"
                          }`}
                          title={g.name}
                        >
                          <span className="text-nf-text-muted font-bold">#</span> {g.name.toLowerCase().replace(/\s+/g, "-")}
                        </Link>
                      );
                    })
                  )}
                </>
              )}
            </nav>
          </div>

          {/* User Card at Sidebar Bottom */}
          <div className="p-3 bg-nf-surface/40 border-t border-nf-panel-border/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-nf-violet/20 border border-nf-violet/40 flex items-center justify-center shrink-0">
                <span className="text-nf-primary text-xs font-bold font-mono">{initials}</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-nf-on-surface truncate" title={user?.username || "Usuario"}>
                  {user?.username || "Usuario"}
                </div>
                <div className="text-[9px] font-mono font-bold text-nf-text-muted uppercase tracking-wider truncate">
                  {user?.role === "maestro" ? "Catedrático" : "Estudiante"}
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ── 3. Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-nf-background">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-nf-panel-border bg-nf-surface/30 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-white tracking-wide font-display">
              {selectedClass ? (
                <span className="flex items-center gap-2 text-nf-text-muted">
                  <span className="text-white font-medium">{selectedClass.name}</span>
                  <span>/</span>
                  <span className="text-nf-primary">
                    # {activeTab === "project" ? (activeGroupId ? "proyecto-grupo" : "proyecto") : activeTab}
                  </span>
                </span>
              ) : (
                "Forjas Activas"
              )}
            </h1>
          </div>

          {/* Gamified Coins */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-nf-oro/20 flex items-center justify-center shadow-[0_0_8px_rgba(251,191,36,0.2)]">
                <div className="w-1.5 h-1.5 rounded-full bg-nf-oro" />
              </div>
              <span className="text-nf-oro text-xs font-bold font-mono">142</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-nf-diamante">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" />
              </svg>
              <span className="text-nf-diamante text-xs font-bold font-mono">5</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0B0E14]">
          {children}
        </main>
      </div>

      {/* ── 4. Create / Join Class Modal ── */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-nf-surface border border-nf-panel-border rounded-2xl overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.85)] animate-slide-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-nf-panel-border/80 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-display">
                {user?.role === "maestro" ? "Crear Nueva Aula" : "Unirse a una Clase"}
              </h3>
              <button
                onClick={() => {
                  setShowClassModal(false);
                  setModalError(null);
                }}
                className="text-nf-text-muted hover:text-white transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateOrJoinClass} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 rounded-lg bg-nf-error-container/10 border border-nf-error/20 text-nf-error text-xs font-mono">
                  {modalError}
                </div>
              )}

              {user?.role === "maestro" ? (
                <>
                  <div>
                    <label className="nf-input-label">Nombre de la Clase</label>
                    <input
                      type="text"
                      className="nf-input !bg-nf-void/80"
                      placeholder="Ej. Ingeniería de Software III"
                      value={classNameInput}
                      onChange={(e) => setClassNameInput(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="nf-input-label">Código de Acceso Único</label>
                    <input
                      type="text"
                      className="nf-input !bg-nf-void/80 font-mono uppercase"
                      placeholder="Ej. IS3-2026"
                      value={classCodeInput}
                      onChange={(e) => setClassCodeInput(e.target.value)}
                      required
                    />
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="nf-input-label !mb-2.5">Selecciona el Emblema de Clase</label>
                    <div className="grid grid-cols-5 gap-3.5">
                      {GAMING_ICONS.map((icon) => {
                        const isSelected = selectedIcon === icon.path;
                        return (
                          <button
                            key={icon.id}
                            type="button"
                            onClick={() => setSelectedIcon(icon.path)}
                            className={`relative aspect-square rounded-xl overflow-hidden border cursor-pointer p-1 transition-all ${
                              isSelected
                                ? "border-nf-primary bg-nf-primary/10 shadow-[0_0_12px_rgba(179,157,255,0.2)]"
                                : "border-nf-panel-border bg-nf-void/50 hover:border-nf-primary/40"
                            }`}
                            title={icon.name}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={icon.path}
                              alt={icon.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-nf-primary animate-glow-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="nf-input-label">Código de la Clase</label>
                  <input
                    type="text"
                    className="nf-input !bg-nf-void/80 font-mono uppercase"
                    placeholder="Ej. IS2-2026"
                    value={classCodeInput}
                    onChange={(e) => setClassCodeInput(e.target.value)}
                    required
                  />
                  <p className="text-[10px] text-nf-text-muted mt-1.5">
                    Pide a tu maestro el código de acceso alfanumérico para ingresar.
                  </p>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowClassModal(false);
                    setModalError(null);
                  }}
                  className="flex-1 cursor-pointer py-3 rounded-xl border border-nf-panel-border hover:bg-white/5 text-xs text-nf-text-muted hover:text-white uppercase font-bold tracking-wider transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 cursor-pointer py-3 rounded-xl bg-gradient-to-r from-nf-primary to-nf-primary-bright text-nf-void text-xs uppercase font-bold tracking-wider shadow-lg transition-all active:scale-[0.98]"
                >
                  {user?.role === "maestro" ? "Crear Clase" : "Unirse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. Create Group Modal (Maestro) ── */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-nf-surface border border-nf-panel-border rounded-2xl overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.85)] animate-slide-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-nf-panel-border/80 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-display">
                Crear Nuevo Grupo de Desarrollo
              </h3>
              <button
                onClick={() => setShowGroupModal(false)}
                className="text-nf-text-muted hover:text-white transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="nf-input-label">Nombre del Grupo/Equipo</label>
                <input
                  type="text"
                  className="nf-input !bg-nf-void/80"
                  placeholder="Ej. Kernel Masters"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  required
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="flex-1 cursor-pointer py-3 rounded-xl border border-nf-panel-border hover:bg-white/5 text-xs text-nf-text-muted hover:text-white uppercase font-bold tracking-wider transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 cursor-pointer py-3 rounded-xl bg-gradient-to-r from-nf-primary to-nf-primary-bright text-nf-void text-xs uppercase font-bold tracking-wider shadow-lg transition-all active:scale-[0.98]"
                >
                  Crear Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="text-center p-12 text-nf-text-muted">Cargando Forja Principal...</div>}>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </Suspense>
    </AuthProvider>
  );
}
