/**
 * Core Types for AI Flight Recorder Demo
 */

// Gate status based on confidence threshold
export type GateStatus = 'green' | 'yellow' | 'red';

// Authority in RACI chain
export type Authority = 'AI' | 'HUMAN' | 'PENDING';

// Decision action types
export type ActionType =
  | 'NAVIGATE'
  | 'DETECT'
  | 'ESCALATE'
  | 'APPROVE'
  | 'ENGAGE';

// RACI structure for accountability
export interface RACI {
  responsible: string;      // Who does the work
  accountable: string;      // Who is accountable (can be operator ID)
  consulted?: string;       // Who was consulted
  informed?: string;        // Who was informed
}

// Single decision receipt
export interface Receipt {
  id: string;
  timestamp: string;        // 14:06:00 format
  timestampMs: number;      // Full timestamp in ms
  action: ActionType;
  confidence: number;       // 0.0 to 1.0
  gate: GateStatus;
  raci: RACI;
  hash: {
    sha256: string;
    blake3: string;
  };
  merkleDepth: number;
  reason?: string;          // For escalation/approval
}

// Authority chain node (for visualization)
export interface AuthorityChainNode {
  receipt: Receipt;
  children?: AuthorityChainNode[];
}

// Merkle tree node
export interface MerkleNode {
  id: string;
  hash: string;
  isLeaf: boolean;
  isAffected?: boolean;     // True if part of tampered path
  left?: MerkleNode;
  right?: MerkleNode;
  receipt?: Receipt;        // Only for leaf nodes
}

// Attack types for tampering simulation
export type AttackType =
  | 'REMOVE_APPROVAL'       // Remove human approval receipt
  | 'CHANGE_GATE'           // Change YELLOW to GREEN
  | 'BACKDATE_APPROVAL';    // Backdate approval timestamp

export interface Attack {
  id: AttackType;
  name: string;
  description: string;
}

// Verification result
export interface VerificationResult {
  name: string;
  passed: boolean;
  details: string;
  expected?: string;
  computed?: string;
}

// Screen identifiers
export type ScreenId =
  | 'mission-context'
  | 'live-mission'
  | 'decision-explorer'
  | 'tampering-console'
  | 'rejection'
  | 'comparison'
  | 'close';

// Mission map waypoint
export interface Waypoint {
  x: number;
  y: number;
  type: 'waypoint' | 'current' | 'threat' | 'engage';
}
