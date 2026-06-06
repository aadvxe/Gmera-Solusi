// Import alat navigasi Next.js supaya halaman root yang langsung mengarahkan user ke dashboard bisa pindah halaman atau membaca route aktif.
import { redirect } from 'next/navigation';

// Home langsung menjalankan redirect dari / ke /beranda, jadi user tidak berhenti di halaman kosong.
export default function Home() {
  redirect('/beranda');
}
