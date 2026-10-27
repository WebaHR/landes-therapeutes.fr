"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  MapPin, Phone, Globe, Mail, ArrowLeft, Clock,
  Building2, Shield, ExternalLink, Share2, CheckCircle,
} from "lucide-react";
import { getProfessionalById } from "@/lib/storage";
import { Professional, formatDayHours } from "@/types";

const SingleMap = dynamic(() => import("@/components/map/SingleMap"), { ssr: false });
const AppointmentWidget = dynamic(() => import("@/components/professional/AppointmentWidget"), { ssr: false });

const DAY_LABELS: Record<string, string> = {
  monday:"Lundi", tuesday:"Mardi", wednesday:"Mercredi",
  thursday:"Jeudi", friday:"Vendredi", saturday:"Samedi", sunday:"Dimanche",
};
const DAYS_ORDER = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

function getTodayKey() {
  return ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][new Date().getDay()];
}

function isOpenNow(pro: Professional): { open: boolean; label: string } {
  if (!pro.openingHours) return { open: false, label: "Horaires non renseignés" };
  const key   = getTodayKey();
  const hours = (pro.openingHours as any)[key];
  if (!hours || hours.closed) return { open: false, label: "Fermé aujourd'hui" };

  const now = new Date().getHours() * 60 + new Date().getMinutes();
  const inRange = (o?: string, c?: string) => {
    if (!o || !c) return false;
    const [oh,om] = o.split(":").map(Number);
    const [ch,cm] = c.split(":").map(Number);
    return now >= oh*60+om && now < ch*60+cm;
  };

  if (inRange(hours.morningOpen, hours.morningClose))
    return { open: true, label: `Ouvert · Ferme à ${hours.morningClose}` };
  if (inRange(hours.afternoonOpen, hours.afternoonClose))
    return { open: true, label: `Ouvert · Ferme à ${hours.afternoonClose}` };
  // legacy
  if (inRange(hours.open, hours.close))
    return { open: true, label: `Ouvert · Ferme à ${hours.close}` };

  return { open: false, label: "Fermé pour le moment" };
}

export default function ProfessionalProfilePage() {
  const { id }   = useParams<{ id: string }>();
  const [pro, setPro]       = useState<Professional | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const d = getProfessionalById(id);
    if (!d) { setNotFound(true); return; }
    setPro(d);
  }, [id]);

  if (notFound) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🌲</p>
      <h1 className="text-2xl font-bold text-landes-pine mb-2">Professionnel introuvable</h1>
      <p className="text-gray-500 mb-6">Cette fiche n&apos;existe pas ou a été supprimée.</p>
      <Link href="/annuaire" className="btn-primary inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>
    </div>
  );

  if (!pro) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-landes-forest border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initials    = pro.companyName.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  const todayKey    = getTodayKey();
  const openStatus  = isOpenNow(pro);
  const hasHours    = pro.openingHours && Object.keys(pro.openingHours).length > 0;

  return (
    <div className="bg-landes-cream min-h-screen">

      {/* Back */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <Link href="/annuaire" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-landes-forest transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour à l&apos;annuaire
        </Link>
      </div>

      {/* BANNER */}
      <div className="relative mt-4 max-w-6xl mx-auto px-4 sm:px-6">
        <div className={`w-full rounded-2xl overflow-hidden ${pro.banner ? "h-44 sm:h-56" : "h-32"} relative`}>
          {pro.banner
            ? <img src={pro.banner} alt="Bannière" className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-landes-pine to-landes-forest" />
          }
          {/* Overlay gradient bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Logo + name overlaid on banner */}
        <div className="absolute bottom-0 left-8 sm:left-10 translate-y-1/2 flex items-end gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white flex-shrink-0">
            {pro.logo
              ? <img src={pro.logo} alt="Logo" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-landes-forest to-landes-sage flex items-center justify-center text-white font-bold text-2xl">
                  {initials}
                </div>
            }
          </div>
        </div>

        {/* Share button top-right */}
        <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(()=>setCopied(false),2500); }}
          className="absolute top-3 right-3 flex items-center gap-2 bg-black/30 hover:bg-black/50 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm border border-white/20 transition-colors">
          {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
          {copied ? "Copié !" : "Partager"}
        </button>
      </div>

      {/* Name + badges (below banner, offset for logo) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-landes-pine">{pro.companyName}</h1>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" /> Vérifié Prolocal-Landes
          </span>
        </div>
        <p className="text-landes-sage font-medium mt-0.5">{pro.category}</p>
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-gray-500 text-sm">
            <MapPin className="w-3.5 h-3.5" /> {pro.city} ({pro.postalCode})
          </span>
          {hasHours && (
            <span className={`flex items-center gap-1.5 text-sm font-medium ${openStatus.open ? "text-green-600" : "text-red-500"}`}>
              <span className={`w-2 h-2 rounded-full ${openStatus.open ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
              {openStatus.label}
            </span>
          )}
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">

            {/* About */}
            <div className="card p-6">
              <h2 className="font-bold text-landes-pine text-lg mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-landes-sage" /> À propos
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{pro.description}</p>
            </div>

            {/* Appointment widget */}
            {pro.agendaEnabled && <AppointmentWidget pro={pro} />}

          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            <div className="card p-6 lg:sticky lg:top-24 space-y-4">
              <h2 className="font-bold text-landes-pine text-lg">Contacter</h2>

              {pro.phone && (
                <a href={`tel:${pro.phone}`} className="flex items-center gap-3 p-3 bg-landes-forest/5 hover:bg-landes-forest/10 rounded-xl transition-colors group">
                  <div className="w-10 h-10 bg-landes-forest text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Téléphone</p>
                    <p className="font-semibold text-landes-pine group-hover:text-landes-forest">{pro.phone}</p>
                  </div>
                </a>
              )}

              <a href={`mailto:${pro.email}`} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group">
                <div className="w-10 h-10 bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="font-medium text-gray-700 truncate text-sm">{pro.email}</p>
                </div>
              </a>

              {pro.website && (
                <a href={pro.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">Site internet</p>
                    <p className="font-medium text-blue-700 truncate text-sm flex items-center gap-1">
                      {pro.website.replace(/https?:\/\//,"")} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </p>
                  </div>
                </a>
              )}

              <div className="flex items-start gap-3 pt-1">
                <div className="w-10 h-10 bg-landes-sand/40 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-landes-dune" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Adresse</p>
                  <p className="text-sm font-medium text-gray-700 leading-snug">{pro.address}<br />{pro.postalCode} {pro.city}</p>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pro.address} ${pro.city}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs text-landes-forest hover:underline mt-1 inline-flex items-center gap-1">
                    Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {pro.lat && pro.lng
                ? <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 220 }}>
                    <SingleMap lat={pro.lat} lng={pro.lng} name={pro.companyName} address={`${pro.address}, ${pro.city}`} />
                  </div>
                : <div className="rounded-xl border border-dashed border-gray-200 h-20 flex items-center justify-center">
                    <p className="text-xs text-gray-400">Localisation non renseignée</p>
                  </div>
              }
            </div>

            {/* Opening hours */}
            {hasHours && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-landes-pine text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-landes-sage" /> Horaires
                  </h2>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${openStatus.open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${openStatus.open ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
                    {openStatus.open ? "Ouvert" : "Fermé"}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {DAYS_ORDER.map(day => {
                    const h = (pro.openingHours as any)?.[day];
                    if (!h) return null;
                    const isToday = day === todayKey;
                    return (
                      <div key={day} className={`flex justify-between items-center py-1.5 px-2 rounded-lg text-xs ${isToday ? "bg-landes-forest/10 font-semibold" : "hover:bg-gray-50"}`}>
                        <span className={`w-20 flex-shrink-0 ${isToday ? "text-landes-forest" : "text-gray-600"}`}>
                          {isToday && "→ "}{DAY_LABELS[day]}
                        </span>
                        <span className={`text-right ${isToday ? "text-landes-forest" : "text-gray-700"}`}>
                          {formatDayHours(h)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Legal */}
            <div className="card p-5">
              <h2 className="font-bold text-landes-pine text-base mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-landes-sage" /> Informations légales
              </h2>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-gray-400 mb-0.5">Forme juridique</p>
                  <p className="font-medium text-gray-700">{pro.legalForm}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">Numéro SIREN</p>
                  <p className="font-medium text-gray-700 font-mono">{pro.siren.replace(/(\d{3})(\d{3})(\d{3})/,"$1 $2 $3")}</p>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400">
              Membre depuis {new Date(pro.createdAt).toLocaleDateString("fr-FR",{month:"long",year:"numeric"})}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
