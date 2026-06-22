// ═══════════════════════════════════════════════
// NexusForge OS — Mock Database
// ═══════════════════════════════════════════════
// Este archivo maneja todo el estado del prototipo local,
// incluyendo clases, estudiantes, grupos, proyectos, tareas Kanban y chat.
// Se persiste en localStorage cuando está en el cliente.

export interface MockClass {
  id: string;
  name: string;
  accessCode: string;
  teacherId: string;
  createdAt: string;
  iconLetter: string; // Letra para el círculo estilo Discord (fallback)
  color: string;      // Color de acento para la clase
  iconUrl?: string;   // Imagen gamificada seleccionada
}

export interface MockStudent {
  id: string;
  username: string;
  email: string;
  specialty: string;
  role: "estudiante" | "maestro";
  classIds: string[];
  classGroupIds: Record<string, string>; // classId -> groupId
}

export interface MockProject {
  id: string;
  groupId: string;
  classId: string;
  title: string;
  description: string;
  iconUrl?: string;
  videoUrl?: string;
  githubRepoUrl?: string;
  deployUrl?: string;
  coins: number;
  ratingAvg: number;
  rank: "Bronce" | "Plata" | "Oro" | "Platino" | "Diamante";
}

export interface MockGroup {
  id: string;
  classId: string;
  name: string;
  isPublic: boolean;
  memberIds: string[];
}

export interface MockTask {
  id: string;
  groupId: string;
  classId: string;
  title: string;
  description: string;
  status: "TODO" | "DOING" | "DONE";
  assignedToId?: string;
}

export interface MockChatMessage {
  id: string;
  groupId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
}

// ── Datos Iniciales ────────────────────────────

const INITIAL_CLASSES: MockClass[] = [
  {
    id: "class-is2",
    name: "Ingeniería de Software II",
    accessCode: "IS2-2026",
    teacherId: "teacher-001",
    createdAt: new Date().toISOString(),
    iconLetter: "IS",
    color: "#8E76C8", // Violeta
    iconUrl: "/icons/sword.png",
  },
  {
    id: "class-so",
    name: "Sistemas Operativos II",
    accessCode: "SO2-2026",
    teacherId: "teacher-001",
    createdAt: new Date().toISOString(),
    iconLetter: "SO",
    color: "#3D4CA8", // Azul
    iconUrl: "/icons/shield.png",
  },
];

const INITIAL_GROUPS: MockGroup[] = [
  {
    id: "group-forjadores",
    classId: "class-is2",
    name: "Los Forjadores",
    isPublic: true,
    memberIds: ["student-sofia", "student-carlos"],
  },
  {
    id: "group-kernel",
    classId: "class-so",
    name: "Kernel Masters",
    isPublic: true,
    memberIds: ["student-jose", "student-miguel"],
  },
];

const INITIAL_PROJECTS: MockProject[] = [
  {
    id: "project-nexus",
    groupId: "group-forjadores",
    classId: "class-is2",
    title: "NexusForge OS",
    description: "Plataforma web colaborativa, gamificada y en tiempo real para la gestión de proyectos académicos de ingeniería de software. Incluye tableros Kanban, chat y duelos de proyectos.",
    githubRepoUrl: "https://github.com/nexusforge/nexusforge-os",
    deployUrl: "https://nexusforge-os.dev",
    videoUrl: "https://youtube.com/watch?v=mock-video-nf",
    coins: 142,
    ratingAvg: 4.9,
    rank: "Diamante",
  },
  {
    id: "project-kernel-panic",
    groupId: "group-kernel",
    classId: "class-so",
    title: "Valkyrie Kernel",
    description: "Un microkernel experimental escrito en Rust con soporte para paginación multitarea y sistemas de archivos simplificados.",
    githubRepoUrl: "https://github.com/kernelmasters/valkyrie-kernel",
    deployUrl: "",
    videoUrl: "",
    coins: 48,
    ratingAvg: 4.1,
    rank: "Oro",
  },
];

const INITIAL_STUDENTS: MockStudent[] = [
  {
    id: "student-jose",
    username: "Jose Estudiante",
    email: "jose@gmail.com",
    specialty: "Full Stack Developer",
    role: "estudiante",
    classIds: ["class-is2", "class-so"],
    classGroupIds: {
      "class-so": "group-kernel", // Asignado en SO, sin asignar en IS2
    },
  },
  {
    id: "student-sofia",
    username: "Sofia Ruiz",
    email: "sofia@gmail.com",
    specialty: "DevOps Engineer",
    role: "estudiante",
    classIds: ["class-is2"],
    classGroupIds: {
      "class-is2": "group-forjadores",
    },
  },
  {
    id: "student-carlos",
    username: "Carlos Gómez",
    email: "carlos@gmail.com",
    specialty: "UI/UX Designer",
    role: "estudiante",
    classIds: ["class-is2"],
    classGroupIds: {
      "class-is2": "group-forjadores",
    },
  },
  {
    id: "student-miguel",
    username: "Miguel Peralta",
    email: "miguel@gmail.com",
    specialty: "Systems Programmer",
    role: "estudiante",
    classIds: ["class-so"],
    classGroupIds: {
      "class-so": "group-kernel",
    },
  },
  {
    id: "teacher-ana",
    username: "Ana Maestra",
    email: "ana_maestra@gmail.com",
    specialty: "Catedrática Asociada",
    role: "maestro",
    classIds: ["class-is2", "class-so"],
    classGroupIds: {},
  },
  {
    id: "student-ana",
    username: "Ana Estudiante",
    email: "ana_estudiante@gmail.com",
    specialty: "Data Scientist",
    role: "estudiante",
    classIds: ["class-is2"],
    classGroupIds: {
      "class-is2": "group-forjadores",
    },
  },
];

const INITIAL_TASKS: MockTask[] = [
  {
    id: "task-1",
    groupId: "group-forjadores",
    classId: "class-is2",
    title: "Diseñar Maqueta HUD",
    description: "Diseñar las vistas del dashboard en base a la estética oscura cyberpunk de Discord.",
    status: "DONE",
    assignedToId: "student-carlos",
  },
  {
    id: "task-2",
    groupId: "group-forjadores",
    classId: "class-is2",
    title: "Integrar Cookies de SSR",
    description: "Cambiar el cliente de localStorage a cookies para evitar ciclos infinitos en el middleware de Next.js.",
    status: "DOING",
    assignedToId: "student-jose",
  },
  {
    id: "task-3",
    groupId: "group-forjadores",
    classId: "class-is2",
    title: "Configurar Base de Datos Supabase",
    description: "Crear tablas e índices en PostgreSQL para producción.",
    status: "TODO",
    assignedToId: "student-sofia",
  },
  {
    id: "task-4",
    groupId: "group-kernel",
    classId: "class-so",
    title: "Implementar Paginación de Memoria",
    description: "Desarrollar la carga de tablas de páginas a nivel de kernel físico.",
    status: "DOING",
    assignedToId: "student-miguel",
  },
];

const INITIAL_MESSAGES: MockChatMessage[] = [
  {
    id: "msg-1",
    groupId: "group-forjadores",
    senderName: "Sofia Ruiz",
    senderRole: "DevOps Mage",
    message: "Hola equipo, ya configuré el despliegue automático en Vercel para pruebas.",
    timestamp: "18:32",
  },
  {
    id: "msg-2",
    groupId: "group-forjadores",
    senderName: "Carlos Gómez",
    senderRole: "UI/UX Ranger",
    message: "¡Excelente! Acabo de actualizar la paleta de colores para que sea ultra-dark.",
    timestamp: "18:35",
  },
];

// Helper para localStorage
const isClient = typeof window !== "undefined";

function getStored<T>(key: string, initial: T): T {
  if (!isClient) return initial;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : initial;
  } catch {
    return initial;
  }
}

function setStored<T>(key: string, val: T): void {
  if (!isClient) return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("Error al guardar en localStorage", e);
  }
}

// ── API Simulado ───────────────────────────────

export const mockDb = {
  getClasses: () => getStored<MockClass[]>("nf_classes", INITIAL_CLASSES),
  
  addClass: (name: string, accessCode: string, teacherId: string, iconUrl?: string) => {
    const classes = mockDb.getClasses();
    const colors = ["#8E76C8", "#3D4CA8", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const words = name.trim().split(/\s+/);
    const iconLetter = words.map(w => w[0]).join("").slice(0, 3).toUpperCase() || "CL";

    const newClass: MockClass = {
      id: `class-${Math.random().toString(36).substring(2, 9)}`,
      name,
      accessCode: accessCode.toUpperCase(),
      teacherId,
      createdAt: new Date().toISOString(),
      iconLetter,
      color: randomColor,
      iconUrl,
    };
    classes.push(newClass);
    setStored("nf_classes", classes);
    return newClass;
  },

  getStudents: () => getStored<MockStudent[]>("nf_students", INITIAL_STUDENTS),

  getGroups: () => getStored<MockGroup[]>("nf_groups", INITIAL_GROUPS),

  getProjects: () => getStored<MockProject[]>("nf_projects", INITIAL_PROJECTS),

  joinClass: (studentEmail: string, code: string) => {
    const classes = mockDb.getClasses();
    const students = mockDb.getStudents();
    const targetClass = classes.find(c => c.accessCode === code.toUpperCase());

    if (!targetClass) {
      return { error: "Código de clase inválido." };
    }

    const student = students.find(s => s.email === studentEmail);
    if (!student) {
      return { error: "Estudiante no encontrado." };
    }

    if (student.classIds.includes(targetClass.id)) {
      return { error: "Ya estás registrado en esta clase." };
    }

    student.classIds.push(targetClass.id);
    if (!student.classGroupIds) {
      student.classGroupIds = {};
    }
    setStored("nf_students", students);
    return { success: true, targetClass };
  },

  getStudentsInClass: (classId: string) => {
    const students = mockDb.getStudents();
    return students.filter(s => s.classIds.includes(classId));
  },

  getGroupsInClass: (classId: string) => {
    const groups = mockDb.getGroups();
    return groups.filter(g => g.classId === classId);
  },

  getProjectForGroup: (groupId: string) => {
    const projects = mockDb.getProjects();
    return projects.find(p => p.groupId === groupId) || null;
  },

  updateProject: (projectId: string, data: Partial<MockProject>) => {
    const projects = mockDb.getProjects();
    const idx = projects.findIndex(p => p.id === projectId);
    if (idx !== -1) {
      projects[idx] = { ...projects[idx], ...data };
      setStored("nf_projects", projects);
      return projects[idx];
    }
    return null;
  },

  assignStudentToGroup: (studentId: string, groupId: string | null, classId: string) => {
    const students = mockDb.getStudents();
    const groups = mockDb.getGroups();

    const student = students.find((s) => s.id === studentId);
    if (!student) return false;

    if (!student.classGroupIds) {
      student.classGroupIds = {};
    }

    const currentGroupId = student.classGroupIds[classId];

    if (currentGroupId) {
      const oldGroup = groups.find((g) => g.id === currentGroupId);
      if (oldGroup) {
        oldGroup.memberIds = oldGroup.memberIds.filter((id) => id !== studentId);
      }
    }

    if (!groupId) {
      delete student.classGroupIds[classId];
    } else {
      student.classGroupIds[classId] = groupId;
      const newGroup = groups.find((g) => g.id === groupId);
      if (newGroup) {
        if (!newGroup.memberIds.includes(studentId)) {
          newGroup.memberIds.push(studentId);
        }
      }
    }

    setStored("nf_students", students);
    setStored("nf_groups", groups);
    return true;
  },

  addGroup: (name: string, classId: string) => {
    const groups = mockDb.getGroups();
    const projects = mockDb.getProjects();

    const newGroupId = `group-${Math.random().toString(36).substring(2, 9)}`;
    const newGroup: MockGroup = {
      id: newGroupId,
      classId,
      name,
      isPublic: true,
      memberIds: [],
    };

    const newProject: MockProject = {
      id: `project-${Math.random().toString(36).substring(2, 9)}`,
      groupId: newGroupId,
      classId,
      title: `Proyecto de ${name}`,
      description: `Espacio de desarrollo asignado para el equipo ${name}.`,
      coins: 0,
      ratingAvg: 5.0,
      rank: "Bronce",
    };

    groups.push(newGroup);
    projects.push(newProject);

    setStored("nf_groups", groups);
    setStored("nf_projects", projects);

    return newGroup;
  },

  // ── Métodos para Tareas Kanban ──────────────────────────────────

  getTasks: () => getStored<MockTask[]>("nf_tasks", INITIAL_TASKS),

  addTask: (groupId: string, classId: string, title: string, description: string, assignedToId?: string) => {
    const tasks = mockDb.getTasks();
    const newTask: MockTask = {
      id: `task-${Math.random().toString(36).substring(2, 9)}`,
      groupId,
      classId,
      title,
      description,
      status: "TODO",
      assignedToId,
    };
    tasks.push(newTask);
    setStored("nf_tasks", tasks);
    return newTask;
  },

  updateTaskStatus: (taskId: string, status: "TODO" | "DOING" | "DONE") => {
    const tasks = mockDb.getTasks();
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      tasks[idx].status = status;
      setStored("nf_tasks", tasks);
      return tasks[idx];
    }
    return null;
  },

  updateTaskAssignee: (taskId: string, assignedToId?: string) => {
    const tasks = mockDb.getTasks();
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      tasks[idx].assignedToId = assignedToId === "none" ? undefined : assignedToId;
      setStored("nf_tasks", tasks);
      return tasks[idx];
    }
    return null;
  },


  // ── Métodos para Chat del Grupo ────────────────────────────────

  getChatMessages: () => getStored<MockChatMessage[]>("nf_chat_messages", INITIAL_MESSAGES),

  sendChatMessage: (groupId: string, senderName: string, senderRole: string, message: string) => {
    const messages = mockDb.getChatMessages();
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newMsg: MockChatMessage = {
      id: `msg-${Math.random().toString(36).substring(2, 9)}`,
      groupId,
      senderName,
      senderRole,
      message,
      timestamp,
    };
    messages.push(newMsg);
    setStored("nf_chat_messages", messages);
    return newMsg;
  }
};
