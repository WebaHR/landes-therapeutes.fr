"use client";
import Link from "next/link";
import { Professional } from "@/types";
import { MapPin, Phone, Globe, ArrowRight } from "lucide-react";
import PlanBadge from "@/components/ui/PlanBadge";

interface ProfessionalCardProps {
  pro: Professional;
}

export default function ProfessionalCard({ pro }: ProfessionalCardProps) {
  const initials = pro.companyName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Link
      href={`/annuaire/${pro.id}`}
      className="card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-5 block group"
    >
      <div className="flex items-start gap-4">
        {/* Avatar / Logo */}
        {pro.logo ? (
          <img
            src={pro.logo}
            alt={`Logo ${pro.companyName}`}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100"
          />
        ) : (
          <div className="w-14 h-14 bg-gradient-to-br from-landes-forest to-landes-sage rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-landes-pine text-base truncate group-hover:text-landes-forest transition-colors">
                {pro.companyName}
              </h3>
              <p className="text-sm text-landes-sage font-medium">{pro.category}</p>
            </div>
            <PlanBadge plan={pro.plan} />
          </div>

          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{pro.description}</p>

          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{pro.address}, {pro.city} ({pro.postalCode})</span>
            </div>
            {pro.phone && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{pro.phone}</span>
              </div>
            )}
            {pro.website && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{pro.website.replace("https://", "")}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA hint on hover */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end">
        <span className="text-xs text-landes-forest font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Voir la fiche <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
