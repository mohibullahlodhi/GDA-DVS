"use client";

import { Mail, Phone, MapPin } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    label: "Email Support",
    value: "support@gda.gov.pk",
    href: "mailto:support@gda.gov.pk",
    desc: "Send us a query anytime for official verification support.",
  },
  {
    icon: Phone,
    label: "Helpline",
    value: "+92 992 000 000",
    href: "tel:+92992000000",
    desc: "Available during official GDA work hours (9 AM - 5 PM).",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "ZTBL Building, Main Mansehra Road, Abbottabad, KPK, Pakistan",
    href: "https://maps.google.com/?q=Galiyat+Development+Authority+Abbottabad",
    desc: "Second Floor, Galiyat Development Authority Office.",
  },
];

export function GetInTouch() {
  return (
    <section className="w-full bg-white border-t border-gray-100 relative overflow-hidden py-20 sm:py-24">
      {/* Subtle top background decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.3)] to-transparent" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-16 text-center md:text-left space-y-3">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1F33]"
            style={{
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Get in Touch
          </h2>
          <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-gray-600 font-light dmsans">
            Have questions about document verification, barcode validity, or need institutional support? Reach out to our dedicated GDA team.
          </p>
          <div className="h-[2px] w-[50px] bg-[var(--color-accent)] rounded-full mt-2 mx-auto md:mx-0" />
        </div>

        {/* Info Grid */}
        <div className="grid gap-8 sm:grid-cols-3">
          {contactInfo.map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href={item.href}
                target={item.label === "Headquarters" ? "_blank" : undefined}
                rel={item.label === "Headquarters" ? "noopener noreferrer" : undefined}
                className="group flex flex-col items-start rounded-2xl border border-gray-100 bg-[#F8FAF9] p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-[rgba(201,168,76,0.35)] hover:bg-white"
              >
                {/* Icon Wrapper badge */}
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(27,67,50,0.06)] text-[#1b4332] transition-all duration-300 group-hover:bg-[#1b4332] group-hover:text-white group-hover:scale-110 shadow-sm">
                  <Icon size={22} />
                </div>
                
                {/* Meta details */}
                <span className="text-[10px] font-bold uppercase tracking-widest text-[rgba(201,168,76,0.9)] dmsans">
                  {item.label}
                </span>
                
                <h3 className="mt-3 text-base font-bold text-[#0B1F33] leading-tight dmsans transition-colors group-hover:text-[#1b4332]">
                  {item.value}
                </h3>
                
                <p className="mt-2 text-xs text-gray-600 leading-relaxed font-light dmsans">
                  {item.desc}
                </p>
                
                {/* Interactive Link action */}
                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-[#1b4332] opacity-80 transition-opacity group-hover:opacity-100">
                  <span className="dmsans">Contact Details</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}
