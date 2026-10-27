import { Professional } from "@/types";

const STORAGE_KEY = "prolocal_professionals";
const ADMIN_KEY   = "prolocal_admin";
const SESSION_KEY = "prolocal_session";

const DEFAULT_ADMIN = { email: "admin@prolocal-landes.fr", password: "Admin2024!" };

export function getProfessionals(): Professional[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : getSampleData();
}

export function saveProfessional(pro: Professional): void {
  const pros = getProfessionals();
  const idx = pros.findIndex((p) => p.id === pro.id);
  if (idx >= 0) { pros[idx] = pro; } else { pros.push(pro); }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pros));
}

export function deleteProfessional(id: string): void {
  const pros = getProfessionals().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pros));
}

export function getProfessionalById(id: string): Professional | null {
  return getProfessionals().find((p) => p.id === id) || null;
}

export function getProfessionalByEmail(email: string): Professional | null {
  return getProfessionals().find((p) => p.email === email) || null;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function setSession(type: "pro" | "admin", id?: string): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ type, id, ts: Date.now() }));
}

export function getSession(): { type: "pro" | "admin"; id?: string } | null {
  if (typeof window === "undefined") return null;
  const data = sessionStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function checkAdminCredentials(email: string, password: string): boolean {
  const stored = localStorage.getItem(ADMIN_KEY);
  const admin = stored ? JSON.parse(stored) : DEFAULT_ADMIN;
  return admin.email === email && admin.password === password;
}

function getSampleData(): Professional[] {
  const samples: Professional[] = [
    {
      id: "demo1",
      companyName: "Boulangerie des Pins",
      siren: "123456789",
      legalForm: "SARL",
      category: "Alimentation & Épicerie",
      description: "Boulangerie artisanale au cœur de Mont-de-Marsan, spécialisée dans les pains au levain et viennoiseries maison depuis 1987. Farines locales, four à bois.",
      firstName: "Jean", lastName: "Dupont",
      email: "boulangerie@example.com", password: "demo123",
      phone: "05 58 12 34 56",
      address: "12 rue de la Forêt", city: "Mont-de-Marsan", postalCode: "40000",
      lat: 43.8914, lng: -0.5006,
      plan: "gold", status: "active",
      website: "https://boulangerie-des-pins.fr",
      createdAt: new Date(Date.now() - 30*24*3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      validatedAt: new Date(Date.now() - 28*24*3600000).toISOString(),
      openingHours: {
        monday:    { open: "07:00", close: "13:00", closed: false },
        tuesday:   { open: "07:00", close: "13:00", closed: false },
        wednesday: { open: "07:00", close: "13:00", closed: false },
        thursday:  { open: "07:00", close: "13:00", closed: false },
        friday:    { open: "07:00", close: "19:00", closed: false },
        saturday:  { open: "07:00", close: "13:30", closed: false },
        sunday:    { open: "08:00", close: "12:30", closed: false },
      },
    },
    {
      id: "demo2",
      companyName: "Menuiserie Labrouche",
      siren: "987654321",
      legalForm: "Auto-entrepreneur",
      category: "Bâtiment & Travaux",
      description: "Artisan menuisier depuis 15 ans à Dax, spécialisé dans la fabrication sur mesure, la pose de parquets et la rénovation intérieure. Devis gratuit.",
      firstName: "Pierre", lastName: "Labrouche",
      email: "menuiserie@example.com", password: "demo123",
      phone: "05 58 98 76 54",
      address: "8 chemin des Artisans", city: "Dax", postalCode: "40100",
      lat: 43.7101, lng: -1.0527,
      plan: "premium", status: "active",
      createdAt: new Date(Date.now() - 60*24*3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      validatedAt: new Date(Date.now() - 58*24*3600000).toISOString(),
      openingHours: {
        monday:    { open: "08:00", close: "18:00", closed: false },
        tuesday:   { open: "08:00", close: "18:00", closed: false },
        wednesday: { open: "08:00", close: "18:00", closed: false },
        thursday:  { open: "08:00", close: "18:00", closed: false },
        friday:    { open: "08:00", close: "17:00", closed: false },
        saturday:  { open: "09:00", close: "12:00", closed: false },
        sunday:    { open: "", close: "", closed: true },
      },
    },
    {
      id: "demo3",
      companyName: "Surf School Biscarrosse",
      siren: "456123789",
      legalForm: "SAS",
      category: "Sport & Fitness",
      description: "École de surf professionnelle sur la côte atlantique. Cours collectifs et particuliers pour tous niveaux. Location de matériel. Stages vacances.",
      firstName: "Marie", lastName: "Océane",
      email: "surf@example.com", password: "demo123",
      phone: "05 58 45 67 89",
      address: "Avenue de la Plage", city: "Biscarrosse", postalCode: "40600",
      lat: 44.4524, lng: -1.2502,
      plan: "premium", status: "active",
      website: "https://surf-biscarrosse.fr",
      createdAt: new Date(Date.now() - 15*24*3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      validatedAt: new Date(Date.now() - 13*24*3600000).toISOString(),
      openingHours: {
        monday:    { open: "09:00", close: "19:00", closed: false },
        tuesday:   { open: "09:00", close: "19:00", closed: false },
        wednesday: { open: "09:00", close: "19:00", closed: false },
        thursday:  { open: "09:00", close: "19:00", closed: false },
        friday:    { open: "09:00", close: "20:00", closed: false },
        saturday:  { open: "08:00", close: "20:00", closed: false },
        sunday:    { open: "08:00", close: "20:00", closed: false },
      },
    },
    {
      id: "demo4",
      companyName: "Gîte de la Pinède",
      siren: "789456123",
      legalForm: "EURL",
      category: "Hébergement & Tourisme",
      description: "Gîte rustique et chaleureux en pleine forêt landaise à Mimizan. Capacité 8 personnes, piscine, barbecue, à 10 min des plages. Idéal familles.",
      firstName: "Sophie", lastName: "Martin",
      email: "gite@example.com", password: "demo123",
      phone: "06 12 34 56 78",
      address: "Route des Lacs", city: "Mimizan", postalCode: "40200",
      lat: 44.2033, lng: -1.2297,
      plan: "standard", status: "active",
      createdAt: new Date(Date.now() - 45*24*3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      validatedAt: new Date(Date.now() - 43*24*3600000).toISOString(),
      openingHours: {
        monday:    { open: "09:00", close: "18:00", closed: false },
        tuesday:   { open: "09:00", close: "18:00", closed: false },
        wednesday: { open: "09:00", close: "18:00", closed: false },
        thursday:  { open: "09:00", close: "18:00", closed: false },
        friday:    { open: "09:00", close: "18:00", closed: false },
        saturday:  { open: "10:00", close: "17:00", closed: false },
        sunday:    { open: "", close: "", closed: true },
      },
    },
    {
      id: "demo5",
      companyName: "Cabinet Vétérinaire Landes Sud",
      siren: "321654987",
      legalForm: "SCP",
      category: "Médical & Paramédical",
      description: "Cabinet vétérinaire pour animaux de compagnie et animaux de ferme à Capbreton. Service d'urgence 7j/7. Chirurgie, vaccinations, consultations.",
      firstName: "Docteur", lastName: "Berrois",
      email: "veto@example.com", password: "demo123",
      phone: "05 58 33 44 55",
      address: "15 avenue de la République", city: "Capbreton", postalCode: "40130",
      lat: 43.6429, lng: -1.4292,
      plan: "standard", status: "pending",
      createdAt: new Date(Date.now() - 2*24*3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  return samples;
}

// ── Appointments ──────────────────────────────────────────────
const APPT_KEY = "prolocal_appointments";

export function getAppointments(): import("@/types").Appointment[] {
  if (typeof window === "undefined") return [];
  const d = localStorage.getItem(APPT_KEY);
  return d ? JSON.parse(d) : [];
}

export function getAppointmentsByPro(proId: string): import("@/types").Appointment[] {
  return getAppointments().filter(a => a.professionalId === proId);
}

export function saveAppointment(appt: import("@/types").Appointment): void {
  const all = getAppointments();
  const idx = all.findIndex(a => a.id === appt.id);
  if (idx >= 0) { all[idx] = appt; } else { all.push(appt); }
  localStorage.setItem(APPT_KEY, JSON.stringify(all));
}

export function deleteAppointment(id: string): void {
  const all = getAppointments().filter(a => a.id !== id);
  localStorage.setItem(APPT_KEY, JSON.stringify(all));
}

/** Retourne les créneaux déjà pris pour un pro à une date donnée */
export function getBookedSlots(proId: string, date: string): string[] {
  return getAppointments()
    .filter(a => a.professionalId === proId && a.date === date && a.status !== "cancelled")
    .map(a => a.time);
}

// ── Blocked dates (congés / absences) ────────────────────────
const BLOCKED_KEY = "prolocal_blocked_dates";

export function getBlockedDates(): import("@/types").BlockedDate[] {
  if (typeof window === "undefined") return [];
  const d = localStorage.getItem(BLOCKED_KEY);
  return d ? JSON.parse(d) : [];
}

export function getBlockedDatesByPro(proId: string): import("@/types").BlockedDate[] {
  return getBlockedDates().filter(b => b.professionalId === proId);
}

export function saveBlockedDate(blocked: import("@/types").BlockedDate): void {
  const all = getBlockedDates();
  const idx = all.findIndex(b => b.id === blocked.id);
  if (idx >= 0) { all[idx] = blocked; } else { all.push(blocked); }
  localStorage.setItem(BLOCKED_KEY, JSON.stringify(all));
}

export function deleteBlockedDate(id: string): void {
  const all = getBlockedDates().filter(b => b.id !== id);
  localStorage.setItem(BLOCKED_KEY, JSON.stringify(all));
}

/** Vérifie si une date/heure est bloquée pour un pro */
export function isDateBlocked(proId: string, date: string, time?: string): boolean {
  const blocked = getBlockedDatesByPro(proId).filter(b => b.date === date);
  if (!blocked.length) return false;
  return blocked.some(b => {
    if (b.allDay) return true;
    if (!time || !b.startTime || !b.endTime) return false;
    const [th, tm] = time.split(":").map(Number);
    const [sh, sm] = b.startTime.split(":").map(Number);
    const [eh, em] = b.endTime.split(":").map(Number);
    const t = th * 60 + tm;
    return t >= sh * 60 + sm && t < eh * 60 + em;
  });
}
