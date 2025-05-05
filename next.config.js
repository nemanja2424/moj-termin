/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Definiši domene sa kojih Next.js može da učitava slike
    // Ako koristiš slike iz 'public' foldera, ovo nije neophodno
    domains: ['tvojdomen.com'], // Zameni sa svojim domenom ako koristiš slike sa eksternih izvora
  },
  reactStrictMode: true, // Omogućava strogi režim (dobro za otkrivanje grešaka)
  swcMinify: true, // Omogućava optimizaciju build-a
};

module.exports = nextConfig;
