"use client";

import React from 'react';
import Image from 'next/image';

interface Client {
  name: string;
  logo: string;
}

const defaultClients: Client[] = [
  { name: 'Moniepoint', logo: '/images/leading-clients/moniepoint.png' },
  { name: 'Tikera', logo: '/images/leading-clients/Tikera.png' },
  { name: 'Sycamore', logo: '/images/leading-clients/Sycamore-3.png' },
  { name: 'Renmoney', logo: '/images/leading-clients/R.jpg' },
  { name: 'Tafta', logo: '/images/leading-clients/images-13.jpeg' },
  { name: 'OmniRetail', logo: '/images/leading-clients/images-23.png' },
  { name: 'Unilever', logo: '/images/leading-clients/images-31.png' },
];

export const ClientMarquee: React.FC<{ clients?: Client[] }> = ({
  clients = defaultClients,
}) => {
  // Duplicate list to achieve continuous infinite marquee scroll
  const duplicatedClients = [...clients, ...clients];

  return (
    <div className="relative w-full overflow-hidden marquee-container py-1">
      <div className="animate-marquee flex items-center">
        {duplicatedClients.map((client, index) => (
          <div
            key={`${client.name}-${index}`}
            className="flex items-center justify-center shrink-0 px-6"
          >
            <Image
              src={client.logo}
              alt={client.name}
              width={120}
              height={32}
              className="h-7 w-auto max-h-7 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
