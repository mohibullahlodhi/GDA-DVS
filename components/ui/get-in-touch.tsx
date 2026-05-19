"use client";

import { Mail, Phone, MapPin } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "support@gda.gov.pk",
    href: "mailto:support@gda.gov.pk",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+92 992 000 000",
    href: "tel:+92992000000",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "Galiyat Development Authority, Second floor ZTBL Building Main Mansehra Road Abbottabad, Khyber PakhtunKhwa, Pakistan",
    href: "#",
  },
];

export function GetInTouch() {
  return (
    <section
      className="w-full border-t border-[rgba(201,168,76,0.15)]"
      style={{
        background: "#FFFFFF",
        color: "#1A1A1A",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="mb-12">
          <h2
            className="text-3xl font-bold sm:text-4xl"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#2E7D32",
            }}
          >
            Get in Touch
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
            Have questions about document verification or need support? Reach
            out to our team.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {contactInfo.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className="flex flex-col items-start rounded-lg border border-[rgba(46,125,50,0.2)] p-6 transition hover:border-[rgba(46,125,50,0.4)] hover:bg-[rgba(46,125,50,0.06)] backdrop-blur-sm"
              >
                <Icon
                  size={28}
                  className="mb-3"
                  style={{ color: "#2E7D32" }}
                />
                <div className="text-xs uppercase tracking-widest text-gray-600">
                  {item.label}
                </div>
                <div className="mt-2 text-sm font-medium text-gray-800">
                  {item.value}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
