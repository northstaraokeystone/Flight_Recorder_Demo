/**
 * Cryptographic utilities for receipt generation
 * Note: This is a demo - using simplified hash simulation
 */

// Simple hash function for demo purposes
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Generate dual hash (SHA256:BLAKE3 format)
 * Demo simulation - real implementation would use actual crypto
 */
export function generateDualHash(data: string): { sha256: string; blake3: string } {
  const base = simpleHash(data);
  return {
    sha256: base.slice(0, 16),
    blake3: simpleHash(base + 'blake3').slice(0, 16),
  };
}

/**
 * Generate a Merkle root from receipt hashes
 */
export function generateMerkleRoot(hashes: string[]): string {
  if (hashes.length === 0) return '0'.repeat(16);
  if (hashes.length === 1) return hashes[0];

  const pairs: string[] = [];
  for (let i = 0; i < hashes.length; i += 2) {
    const left = hashes[i];
    const right = hashes[i + 1] || hashes[i];
    pairs.push(simpleHash(left + right).slice(0, 16));
  }

  return generateMerkleRoot(pairs);
}

/**
 * Format hash for display (SHA256:BLAKE3)
 */
export function formatDualHash(hash: { sha256: string; blake3: string }): string {
  return `${hash.sha256}:${hash.blake3}`;
}
