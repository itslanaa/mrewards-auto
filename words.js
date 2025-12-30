// Komponen penyusun kalimat agar terlihat seperti pencarian manusia
const subjects = [
    "Cara", "Tips", "Tutorial", "Panduan", "Resep", "Berita", "Info", "Harga", "Review", "Spesifikasi",
    "Kenapa", "Bagaimana", "Dimana", "Kapan", "Siapa", "Apa itu", "Sejarah", "Fakta unik", "Manfaat", "Bahaya"
];

const verbs = [
    "membuat", "memasak", "memperbaiki", "membeli", "menjual", "menggunakan", "merawat", "membersihkan",
    "mengatasi", "menghilangkan", "menanam", "membangun", "menghitung", "belajar", "menulis", "membaca",
    "mengunduh", "install", "update", "upgrade"
];

const objects = [
    "nasi goreng", "laptop gaming", "hp samsung", "motor bekas", "mobil listrik", "kucing anggora",
    "tanaman hias", "rumah minimalis", "kamera dslr", "sepatu lari", "baju batik", "jam tangan",
    "aplikasi android", "windows 11", "iphone 15", "internet indihome", "listrik token", "bpjs kesehatan",
    "paspor online", "sim keliling", "resep rendang", "soto ayam", "gudeg jogja", "pantai bali",
    "gunung bromo", "hotel murah", "tiket pesawat", "kereta api", "bus pariwisata", "sepeda lipat"
];

const complements = [
    "yang enak", "terbaru 2025", "murah berkualitas", "untuk pemula", "tanpa ribet", "di jakarta",
    "yang benar", "secara alami", "dengan mudah", "cepat dan praktis", "paling laris", "terbaik saat ini",
    "yang awet", "original", "bergaransi", "jarak jauh", "di rumah", "sendiri"
];

// Generator kalimat acak yang "nyambung"
function generateQuery() {
    const pattern = Math.floor(Math.random() * 4);
    
    // Pola 1: Subject + Object (Contoh: "Harga laptop gaming")
    if (pattern === 0) {
        return `${getRandom(subjects)} ${getRandom(objects)}`;
    }
    
    // Pola 2: Subject + Verb + Object (Contoh: "Cara membuat nasi goreng")
    if (pattern === 1) {
        return `${getRandom(subjects)} ${getRandom(verbs)} ${getRandom(objects)}`;
    }
    
    // Pola 3: Object + Complement (Contoh: "HP samsung terbaru 2025")
    if (pattern === 2) {
        return `${getRandom(objects)} ${getRandom(complements)}`;
    }

    // Pola 4: Subject + Verb + Object + Complement (Lengkap)
    return `${getRandom(subjects)} ${getRandom(verbs)} ${getRandom(objects)} ${getRandom(complements)}`;
}

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
    generateQuery
};
