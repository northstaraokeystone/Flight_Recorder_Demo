/**
 * Receipt generation and mission simulation
 */

import type { Receipt, ActionType, RACI, MerkleNode } from '../types';
import { getGateColor } from '../constants/colors';
import { generateDualHash } from './crypto';

let receiptCounter = 0;

/**
 * Generate a unique receipt ID
 */
function generateReceiptId(): string {
  return `RCP-${Date.now()}-${++receiptCounter}`;
}

/**
 * Format timestamp from base time + offset
 */
function formatTimestamp(baseHour: number, baseMinute: number, baseSecond: number, offsetSeconds: number): string {
  const totalSeconds = baseSecond + offsetSeconds;
  const minutes = baseMinute + Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hours = baseHour + Math.floor(minutes / 60);
  const finalMinutes = minutes % 60;

  return `${hours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Create a single receipt
 */
export function createReceipt(
  action: ActionType,
  timestamp: string,
  confidence: number,
  raci: RACI,
  merkleDepth: number,
  reason?: string
): Receipt {
  const gate = getGateColor(confidence);
  const data = JSON.stringify({ action, timestamp, confidence, raci, reason });
  const hash = generateDualHash(data);

  return {
    id: generateReceiptId(),
    timestamp,
    timestampMs: Date.now(),
    action,
    confidence,
    gate,
    raci,
    hash,
    merkleDepth,
    reason,
  };
}

/**
 * Generate the complete mission receipt sequence
 */
export function generateMissionReceipts(): Receipt[] {
  const baseHour = 14;
  const baseMinute = 5;
  const baseSecond = 58;

  const receipts: Receipt[] = [
    // Initial navigation - high confidence, AI autonomous
    createReceipt(
      'NAVIGATE',
      formatTimestamp(baseHour, baseMinute, baseSecond, 0),
      0.92,
      { responsible: 'AI', accountable: 'AI' },
      847,
    ),
    createReceipt(
      'NAVIGATE',
      formatTimestamp(baseHour, baseMinute, baseSecond, 1),
      0.91,
      { responsible: 'AI', accountable: 'AI' },
      848,
    ),
    // Detection - confidence drops, gate turns yellow
    createReceipt(
      'DETECT',
      formatTimestamp(baseHour, baseMinute, baseSecond, 2),
      0.73,
      { responsible: 'AI', accountable: 'AI' },
      849,
      'THREAT_CONFIDENCE_LOW'
    ),
    // Escalation - human required
    createReceipt(
      'ESCALATE',
      formatTimestamp(baseHour, baseMinute, baseSecond, 2),
      0.73,
      { responsible: 'AI', accountable: 'PENDING', consulted: 'OPR-MIKE' },
      850,
      'HUMAN_APPROVAL_REQUIRED'
    ),
    // Human approval
    createReceipt(
      'APPROVE',
      formatTimestamp(baseHour, baseMinute, baseSecond, 4),
      0.95,
      { responsible: 'HUMAN', accountable: 'OPR-MIKE' },
      851,
      'THREAT_CONFIRMED'
    ),
    // Engagement - green gate after approval
    createReceipt(
      'ENGAGE',
      formatTimestamp(baseHour, baseMinute, baseSecond, 5),
      0.98,
      { responsible: 'AI', accountable: 'OPR-MIKE' },
      852,
    ),
  ];

  return receipts;
}

/**
 * Build a Merkle tree from receipts
 */
export function buildMerkleTree(receipts: Receipt[], affectedIndices: number[] = []): MerkleNode {
  if (receipts.length === 0) {
    return {
      id: 'root',
      hash: '0'.repeat(16),
      isLeaf: false,
    };
  }

  // Create leaf nodes
  const leaves: MerkleNode[] = receipts.map((receipt, index) => ({
    id: `leaf-${index}`,
    hash: receipt.hash.sha256,
    isLeaf: true,
    isAffected: affectedIndices.includes(index),
    receipt,
  }));

  // Build tree bottom-up
  function buildLevel(nodes: MerkleNode[]): MerkleNode {
    if (nodes.length === 1) {
      return nodes[0];
    }

    const pairs: MerkleNode[] = [];
    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i];
      const right = nodes[i + 1] || nodes[i]; // Duplicate last if odd

      const combinedHash = generateDualHash(left.hash + right.hash).sha256;
      const isAffected = left.isAffected || right.isAffected;

      pairs.push({
        id: `node-${pairs.length}-${Math.random().toString(36).slice(2, 6)}`,
        hash: combinedHash,
        isLeaf: false,
        isAffected,
        left,
        right: nodes[i + 1] ? right : undefined,
      });
    }

    return buildLevel(pairs);
  }

  const root = buildLevel(leaves);
  root.id = 'root';

  return root;
}

/**
 * Get the authority chain from receipts (key decision nodes)
 */
export function getAuthorityChain(receipts: Receipt[]): Receipt[] {
  // Filter to key decision points
  return receipts.filter(r =>
    r.action === 'DETECT' ||
    r.action === 'APPROVE' ||
    r.action === 'ENGAGE'
  );
}
