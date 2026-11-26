// ===== UBAH DATA PESTA DI SINI =====
const NOMOR_WA = "6289632188118";            // nomor tuan rumah, format 62 tanpa +
const NAMA_ULTAH = "Arby";
const TARGET = new Date("2026-12-19T19:00:00+07:00");
const TEMPAT = "Jl. Kebayoran Regensi No. 84";

const $ = id => document.getElementById(id);
// Personalisasi: ?to=Nama&ket=Teman%20Kuliah
const q = new URLSearchParams(location.search);
const to = q.get("to"), ket = q.get("ket");
if (to) { $("gNama").textContent = to; $("fNama").value = to; }
if (ket) $("gKet").textContent = ket;
$("mapBtn").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(TEMPAT);

// Konfeti: satu momen saat undangan dibuka
function confetti() {
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const c = $("fx"), x = c.getContext("2d");
  c.width = innerWidth; c.height = innerHeight;
  const cols = ["#75ddeb", "#0b8a7a", "#90f1a9", "#ffd23c", "#ffffff"];
  const ps = Array.from({ length: 140 }, () => ({
    x: c.width / 2, y: c.height * .6,
    vx: (Math.random() - .5) * 16, vy: -Math.random() * 18 - 4,
    w: 6 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .4,
    col: cols[Math.floor(Math.random() * cols.length)]
  }));
  let f = 0;
  (function loop() {
    x.clearRect(0, 0, c.width, c.height);
    ps.forEach(p => {
      p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      x.save(); x.translate(p.x, p.y); x.rotate(p.r);
      x.fillStyle = p.col; x.fillRect(-p.w / 2, -p.w / 4, p.w, p.w / 2); x.restore();
    });
    if (++f < 150) requestAnimationFrame(loop); else x.clearRect(0, 0, c.width, c.height);
  })();
}

$("openBtn").onclick = () => {
  $("cover").classList.add("open");
  document.body.classList.remove("lock");
  window.scrollTo(0, 0);
  confetti();
  setMusic(true);
};

function tick() {
  let t = Math.max(0, TARGET - new Date());
  const p = n => String(n).padStart(2, "0");
  $("d").textContent = p(Math.floor(t / 864e5));
  $("h").textContent = p(Math.floor(t / 36e5) % 24);
  $("m").textContent = p(Math.floor(t / 6e4) % 60);
  $("s").textContent = p(Math.floor(t / 1e3) % 60);
}
tick(); setInterval(tick, 1000);

$("calBtn").onclick = () => {
  const z = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const end = new Date(TARGET.getTime() + 3 * 36e5);
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
    "SUMMARY:" + NAMA_ULTAH + "’s Birthday Party",
    "DTSTART:" + z(TARGET), "DTEND:" + z(end),
    "LOCATION:" + TEMPAT, "DESCRIPTION:Pesta ulang tahun " + NAMA_ULTAH,
    "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "birthday-party.ics";
  a.click();
};

// ===== MUSIK: tombol melayang play/pause =====
const bgm = $("bgm"), musicBtn = $("musicBtn");
function setMusic(on) {
  if (on) bgm.play().then(() => musicBtn.classList.add("on")).catch(() => {
    musicBtn.classList.remove("on");
    toast("Musik tidak dapat diputar. Coba tekan tombol musik lagi.");
  });
  else { bgm.pause(); musicBtn.classList.remove("on"); }
}
musicBtn.onclick = () => setMusic(bgm.paused);

// ===== TOAST + SALIN KE CLIPBOARD =====
function toast(teks) {
  const e = $("toast");
  e.textContent = teks; e.classList.add("show");
  setTimeout(() => e.classList.remove("show"), 2200);
}
document.querySelectorAll("[data-copy]").forEach(b => b.onclick = async () => {
  try { await navigator.clipboard.writeText(b.dataset.copy); toast("Berhasil disalin!"); }
  catch { toast("Gagal menyalin, salin manual ya"); }
});

// ===== ANIMASI SAAT SCROLL + FOTO KOSONG =====
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); }
}), { threshold: .15 });
document.querySelectorAll(".rv").forEach(el => io.observe(el));
document.querySelectorAll(".grid img").forEach(i => i.onerror = () => i.style.display = "none");

// ===== RSVP + BUKU TAMU (localStorage) =====
const KEY = "buku-tamu-ultah";
function muat() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } }
function simpan(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} }
function tampil() {
  const ul = $("bukuTamu"); ul.textContent = "";
  const data = muat();
  if (!data.length) {
    const li = document.createElement("li");
    li.textContent = "Belum ada ucapan. Jadilah yang pertama!";
    ul.append(li); return;
  }
  data.forEach((x, n) => {
  const li = document.createElement("li"), b = document.createElement("b"), p = document.createElement("p");
  const hapus = document.createElement("button");
  b.textContent = x.nama + " (" + x.status + ")";
  p.textContent = x.ucapan;
  hapus.textContent = "Hapus";
  hapus.className = "btn alt";
  hapus.onclick = () => { data.splice(n, 1); simpan(data); tampil(); toast("Ucapan dihapus"); };
  li.append(b, p, hapus); ul.append(li);
});
}
$("rsvpForm").onsubmit = e => {
  e.preventDefault();
  const data = muat();
  data.unshift({ nama: $("fNama").value.trim(), status: $("fStatus").value, ucapan: $("fUcap").value.trim() || "(tanpa ucapan)" });
  simpan(data); tampil();
  $("fUcap").value = "";
  toast("Terima kasih, ucapanmu tersimpan!");
};
$("waBtn").onclick = () => {
  if (!$("rsvpForm").reportValidity()) return;
  let pesan = "Halo " + NAMA_ULTAH + "!\n\nNama: " + $("fNama").value + "\nKehadiran: " + $("fStatus").value;
  if ($("fUcap").value) pesan += "\nUcapan: " + $("fUcap").value;
  window.open("https://wa.me/" + NOMOR_WA + "?text=" + encodeURIComponent(pesan), "_blank");
};
tampil();

// ===== INTERAKSI: ketuk angka 17 = konfeti lagi =====
$("angka").onclick = confetti;
$("angka").onkeydown = e => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    confetti();
  }
};

// ===== INTERAKSI: ketuk foto = tampil besar (lightbox) =====
const lb = $("lb"), lbImg = $("lbImg");
document.querySelectorAll(".grid img").forEach(i => i.onclick = () => {
  lbImg.src = i.src;            // salin alamat foto ke layar besar
  lb.classList.add("show");     // tampilkan
});
lb.onclick = () => lb.classList.remove("show");   // ketuk lagi = tutup
