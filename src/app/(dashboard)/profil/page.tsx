"use client";

// Import React hook yang dipakai halaman profil user yang sedang login, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState } from "react";
// Import Sonner untuk menampilkan toast sukses/error di halaman profil user yang sedang login.
import { toast } from "sonner";
// Import ikon yang dipakai halaman profil user yang sedang login untuk memperjelas tombol, menu, status, dan aksi di layar.
import { Profile1Icon, EditIcon, SaveIcon, LockIcon, EyeIcon, EyeSlashIcon } from "@astraicons/react/bold";
// Import komponen UI reusable supaya halaman profil user yang sedang login memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Button } from "@/components/ui/Button";
// Import komponen UI reusable supaya halaman profil user yang sedang login memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Input } from "@/components/ui/Input";
// Import authStore supaya halaman profil user yang sedang login bisa membaca user login, role, nama tampilan, atau mengosongkan session saat logout.
import { useAuthStore, MOCK_PROFILES, ROLE_LABELS } from "@/store/authStore";

// ProfilPage menampilkan dan memperbarui data profil user yang sedang login.
export default function ProfilPage() {
  const user = useAuthStore((state) => state.user);
  const getDisplayName = useAuthStore((state) => state.getDisplayName);
  const getRoleLabel = useAuthStore((state) => state.getRoleLabel);
  const getInitials = useAuthStore((state) => state.getInitials);

  const displayName = getDisplayName();
  const roleLabel = getRoleLabel();
  const initials = getInitials();

  // isEditing menyimpan nilai is editing yang berubah saat user berinteraksi dengan halaman profil user yang sedang login.
  const [isEditing, setIsEditing] = useState(false);
  // isSaving menyimpan nilai is saving yang berubah saat user berinteraksi dengan halaman profil user yang sedang login.
  const [isSaving, setIsSaving] = useState(false);
  // showCurrentPwd menyimpan nilai show current pwd yang berubah saat user berinteraksi dengan halaman profil user yang sedang login.
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  // showNewPwd menyimpan nilai show new pwd yang berubah saat user berinteraksi dengan halaman profil user yang sedang login.
  const [showNewPwd, setShowNewPwd] = useState(false);
  // showConfirmPwd menyimpan nilai show confirm pwd yang berubah saat user berinteraksi dengan halaman profil user yang sedang login.
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Profile form state
  const [name, setName] = useState(displayName);
  // phone menyimpan nilai phone yang berubah saat user berinteraksi dengan halaman profil user yang sedang login.
  const [phone, setPhone] = useState("+62 812-0000-0001");
  // department menyimpan nilai department yang berubah saat user berinteraksi dengan halaman profil user yang sedang login.
  const [department, setDepartment] = useState("Keuangan");

  // Password form state
  const [currentPwd, setCurrentPwd] = useState("");
  // newPwd menyimpan nilai new pwd yang berubah saat user berinteraksi dengan halaman profil user yang sedang login.
  const [newPwd, setNewPwd] = useState("");
  // confirmPwd menyimpan nilai confirm pwd yang berubah saat user berinteraksi dengan halaman profil user yang sedang login.
  const [confirmPwd, setConfirmPwd] = useState("");

  // handleSaveProfile adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      toast.success("Profil berhasil diperbarui!");
      setIsEditing(false);
      setIsSaving(false);
    }, 800);
  };

  // handleChangePassword adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Kondisi if (newPwd !== confirmPwd) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman profil.
    if (newPwd !== confirmPwd) {
      toast.error("Password baru dan konfirmasi tidak cocok.");
      // handleChangePassword berhenti di sini karena syarat lanjut belum terpenuhi.
      return;
    }
    // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
    if (newPwd.length < 8) {
      toast.error("Password baru minimal 8 karakter.");
      // handleChangePassword berhenti di sini karena syarat lanjut belum terpenuhi.
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      toast.success("Password berhasil diubah!");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setIsSaving(false);
    }, 800);
  };

  const roleColorMap: Record<string, string> = {
    super_admin: "bg-purple-100 text-purple-700",
    finance_manager: "bg-blue-100 text-blue-700",
    accounting_staff: "bg-indigo-100 text-indigo-700",
    sales_staff: "bg-green-100 text-green-700",
    viewer: "bg-gray-100 text-gray-600",
  };
  const userRole = user?.user_metadata?.role || "viewer";
  const roleColor = roleColorMap[userRole] || "bg-gray-100 text-gray-600";

  // ProfilPage menampilkan UI untuk halaman profil user yang sedang login.
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profil Saya</h1>
        <p className="text-sm text-text-secondary mt-1">Kelola informasi akun dan keamanan Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Avatar Card */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-2xl shadow-sm p-6 flex flex-col items-center text-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl select-none">
                {initials}
              </div>
              <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                <EditIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-text-primary">{displayName}</h2>
              <span className={`inline-block mt-1.5 px-3 py-1 rounded-full text-xs font-semibold ${roleColor}`}>
                {roleLabel}
              </span>
            </div>

            <div className="w-full border-t border-border pt-4 text-sm space-y-2.5 text-left">
              <div className="flex justify-between">
                <span className="text-text-muted">Email</span>
                <span className="font-medium text-text-primary text-xs truncate max-w-[140px]">{user?.email || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Telepon</span>
                <span className="font-medium text-text-primary">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Departemen</span>
                <span className="font-medium text-text-primary">{department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status</span>
                <span className="font-semibold text-success text-xs">● Aktif</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Card */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Profile1Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-text-primary">Informasi Pribadi</h3>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="flex items-center gap-1.5">
                  <EditIcon className="w-4 h-4" /> Edit
                </Button>
              )}
            </div>
            <div className="p-6">
              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Nama Lengkap</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-background cursor-default" : ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="bg-background cursor-default text-text-muted"
                    />
                    <p className="text-xs text-text-muted mt-1">Email tidak dapat diubah melalui halaman ini.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Nomor Telepon</label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-background cursor-default" : ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Departemen</label>
                    <Input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-background cursor-default" : ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Peran Akses</label>
                    <Input
                      value={roleLabel}
                      disabled
                      className="bg-background cursor-default text-text-muted"
                    />
                    <p className="text-xs text-text-muted mt-1">Peran hanya dapat diubah oleh Super Admin.</p>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Batal</Button>
                    <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
                      <SaveIcon className="w-4 h-4" />
                      {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                <LockIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-text-primary">Ubah Password</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleChangePassword}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Password Saat Ini</label>
                    <div className="relative">
                      <Input
                        type={showCurrentPwd ? "text" : "password"}
                        value={currentPwd}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        placeholder="Masukkan password saat ini"
                        required
                      />
                      <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                        {showCurrentPwd ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Password Baru</label>
                    <div className="relative">
                      <Input
                        type={showNewPwd ? "text" : "password"}
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        required
                      />
                      <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                        {showNewPwd ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Konfirmasi Password Baru</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPwd ? "text" : "password"}
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        placeholder="Ulangi password baru"
                        required
                      />
                      <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                        {showConfirmPwd ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {newPwd.length > 0 && (
                    <div className="flex gap-2">
                      {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman profil. */}
                      {[newPwd.length >= 8, /[A-Z]/.test(newPwd), /[0-9]/.test(newPwd)].map((ok, i) => (
                        <span key={i} className={`text-xs px-2 py-1 rounded-full font-medium ${ok ? 'bg-success/10 text-success' : 'bg-border text-text-muted'}`}>
                          {["Min. 8 karakter", "Huruf kapital", "Angka"][i]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6 pt-6 border-t border-border">
                  <Button type="submit" disabled={isSaving} className="bg-warning hover:bg-warning/90 text-white flex items-center gap-2">
                    <LockIcon className="w-4 h-4" />
                    {isSaving ? "Menyimpan..." : "Ubah Password"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
