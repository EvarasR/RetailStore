function isValidNextRoute(next) {
  if (!next || typeof next !== 'string') return false;
  
  const trimmed = next.trim();
  if (!trimmed.startsWith('/')) return false;
  if (trimmed.startsWith('//')) return false;
  if (trimmed.toLowerCase().startsWith('http')) return false;
  if (trimmed.toLowerCase().startsWith('javascript:')) return false;
  if (trimmed.startsWith('/\\')) return false; // To prevent /\\evil.example bypassing 

  return true;
}

const valids = [
    "/cuenta/pedidos",
    "/producto/12",
    "/checkout",
    "/catalogo?q=teclado"
];

const invalids = [
    "https://evil.example",
    "http://evil.example",
    "//evil.example",
    "///evil.example",
    "javascript:alert(1)",
    "data:text/html,test",
    "\\evil.example",
    "/%2F%2Fevil.example"
];

console.log("=== DEBEN ACEPTARSE ===");
valids.forEach(url => {
    console.log(`[${isValidNextRoute(url) ? 'PASS' : 'FAIL'}] ${url} -> ${isValidNextRoute(url)}`);
});

console.log("\n=== DEBEN RECHAZARSE ===");
invalids.forEach(url => {
    // Before decode
    console.log(`[${!isValidNextRoute(url) ? 'PASS' : 'FAIL'}] ${url} -> ${isValidNextRoute(url)}`);
    // After decode simulation (React Router / URLSearchParams might pass decoded values)
    const decoded = decodeURIComponent(url);
    if (decoded !== url) {
        console.log(`  (Decoded: ${decoded}) -> [${!isValidNextRoute(decoded) ? 'PASS' : 'FAIL'}] ${isValidNextRoute(decoded)}`);
    }
});
