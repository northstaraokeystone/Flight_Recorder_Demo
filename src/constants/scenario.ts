/**
 * Governance Scenario Configuration v2.2 DIAMOND
 * CRAG Fallback / RACI Handoff Narrative
 *
 * The story: AI detects uncertainty → asks for help → human responds → liability is clear
 */

import type { RACIState, ModeState, CRAGState, ReasonCode } from './colors';

// Phase timing (milliseconds) with strategic pauses
export const TIMING = {
  // Phase durations
  PHASE_TAKEOFF_DURATION: 2000,         // 2s - takeoff
  PHASE_NORMAL_OPS_DURATION: 10000,     // 10s - normal flight, confidence high
  PHASE_WAYPOINT_DURATION: 3000,        // 3s per waypoint
  PHASE_UNCERTAINTY_PAUSE: 1500,        // 1.5s pause before uncertainty event
  PHASE_UNCERTAINTY_DURATION: 2000,     // 2s - AI detects unknown object
  PHASE_CRAG_TRIGGERED_DURATION: 1000,  // 1s - CRAG activating
  PHASE_HUMAN_QUERY_PAUSE: 2000,        // 2s THE KEY PAUSE - system waiting for human
  PHASE_HUMAN_RESPONSE_DURATION: 1500,  // 1.5s - human responds
  PHASE_HANDOFF_BACK_DURATION: 1000,    // 1s - RACI returns to AI
  PHASE_ROUTE_RESUME_DURATION: 3000,    // 3s - resume original route
  PHASE_COMPLETE_DURATION: 2000,        // 2s - mission complete
  PHASE_AFFIDAVIT_PAUSE: 1500,          // 1.5s before affidavit slides up

  // Intervals
  RECEIPT_TICK_INTERVAL: 300,           // New receipt every 300ms
  LOG_ENTRY_INTERVAL: 800,              // Log entries during normal ops
  DECISION_LOG_INTERVAL: 1500,          // Decisions during uncertainty

  // Legacy timing compatibility
  PHASE_DEGRADED_DURATION: 4000,
  PHASE_OFFLINE_DURATION: 8000,
  PHASE_INCIDENT_DURATION: 4000,
  PHASE_RECONNECT_DURATION: 5000,
  PHASE_BURST_SYNC_DURATION: 5000,
  PHASE_FINAL_HOLD_DURATION: 5000,
  BURST_SYNC_SPEED: 50,

  // Confidence thresholds
  CONFIDENCE_DROP_THRESHOLD: 0.62,      // When CRAG is triggered
  CONFIDENCE_RESTORED: 0.94,            // After human confirmation
} as const;

// Scenario phases - governance-focused narrative
export type ScenarioPhase =
  | 'TAKEOFF'
  | 'NORMAL_OPS'
  | 'WAYPOINT_1'
  | 'WAYPOINT_2'
  | 'UNCERTAINTY_DETECTED'
  | 'CRAG_TRIGGERED'
  | 'HUMAN_QUERY'
  | 'HUMAN_RESPONSE'
  | 'RACI_HANDOFF_BACK'
  | 'ROUTE_RESUMED'
  | 'MISSION_COMPLETE'
  | 'AFFIDAVIT'
  | 'TRUST_GAP'
  // Legacy phases for compatibility
  | 'DEGRADED'
  | 'OFFLINE'
  | 'INCIDENT_DETECTED'
  | 'STOP_RULE_TRIGGERED'
  | 'AVOIDANCE_EXECUTED'
  | 'RECONNECTING'
  | 'BURST_SYNC'
  | 'VERIFIED'
  | 'COMPLETE';

// Link status
export type LinkStatus = 'OPTIMAL' | 'DEGRADED' | 'SEVERED' | 'RESTORED';

// Protocol mode
export type ProtocolMode = 'CLOUD_SYNC' | 'AUTONOMOUS_FIDUCIARY';

// Governance event types for logging
export type GovernanceEventType =
  | 'WAYPOINT_ACHIEVED'
  | 'WAYPOINT_LOCKED'
  | 'CONFIDENCE_UPDATE'
  | 'UNCERTAINTY_DETECTED'
  | 'CRAG_FALLBACK_TRIGGERED'
  | 'EXTERNAL_QUERY'
  | 'GROUND_CONTROL_RESPONSE'
  | 'RACI_HANDOFF'
  | 'ROUTE_RESUMED'
  | 'MISSION_COMPLETE'
  | 'SENSOR_FUSION'
  | 'TELEMETRY_LOG'
  | 'POSITION_FIX'
  | 'LINK_STATUS'
  | 'MODE_SWITCH'
  | 'CHAIN_VERIFY';

export type EventSeverity = 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';

// Legacy type alias
export type DecisionEventType = GovernanceEventType;
export type DecisionSeverity = EventSeverity;

// Governance log entry with block IDs and reason codes
export interface GovernanceLogEntry {
  blockId: number;
  timestamp: string;
  eventType: GovernanceEventType;
  detail: string;
  reasonCode: ReasonCode | null;
  hash: string;
  severity: EventSeverity;
}

// Legacy log entry interface
export interface DecisionLogEntry {
  timestamp: string;
  eventType: DecisionEventType;
  value: string;
  severity: DecisionSeverity;
  offline: boolean;
}

// Link status object
export interface LinkState {
  status: LinkStatus;
  latencyMs: number | null;
  protocol: ProtocolMode;
  since: number;
}

// Governance state for the panel
export interface GovernanceDisplayState {
  raci: RACIState;
  confidence: number;
  mode: ModeState;
  crag: CRAGState;
  fallback: 'NONE' | 'TRIGGERED';
  reasonCode: string | null;
}

// Chain block for visualization
export interface ChainBlock {
  id: number;
  decisionId: string;
  hash: string;
  status: 'PENDING' | 'SYNCED' | 'VERIFIED';
  timestamp: number;
}

// Drone position on map
export interface DronePosition {
  x: number;
  y: number;
  rotation: number;
}

// Unknown object data (replaces ThreatData)
export interface UnknownObject {
  id: string;
  label: string;
  x: number;
  y: number;
  detected: boolean;
  identified: boolean;
  identifiedAs?: string;
}

// Legacy interface
export interface ThreatData {
  id: string;
  label: string;
  x: number;
  y: number;
  detected: boolean;
  avoided: boolean;
}

// ROI ticker state
export interface ROIState {
  liabilityExposure: number;
  decisionsSecured: number;
  riskMitigated: number;
  incidentActive: boolean;
}

// Compliance types
export type ComplianceState = 'READY' | 'COMPLIANT' | 'MONITORING' | 'ACTIVE' | 'LOGGING' | 'LOCAL_CAPTURE' | 'VERIFIED' | 'CHAIN_INTACT' | 'EXCEEDED';

export interface ComplianceStatus {
  faa108: ComplianceState;
  dod300009: ComplianceState;
  euAiAct: ComplianceState;
  do178c?: ComplianceState;
  assureA55?: ComplianceState;
}

// Full scenario state
export interface ScenarioState {
  phase: ScenarioPhase;
  phaseStartTime: number;
  elapsedTime: number;
  link: LinkState;
  governance: GovernanceDisplayState;
  governanceLog: GovernanceLogEntry[];
  chainBlocks: ChainBlock[];
  dronePosition: DronePosition;
  unknownObject: UnknownObject | null;
  currentWaypoint: number;
  totalWaypoints: number;
  // Legacy fields for compatibility
  roi: ROIState;
  compliance: ComplianceStatus;
  decisionLog: DecisionLogEntry[];
  offlineReceiptCount: number;
  syncedReceiptCount: number;
  threat: ThreatData | null;
  avoidancePath: { x: number; y: number }[];
}

// Initial state factory
export function createInitialScenarioState(): ScenarioState {
  return {
    phase: 'TAKEOFF',
    phaseStartTime: Date.now(),
    elapsedTime: 0,
    link: {
      status: 'OPTIMAL',
      latencyMs: 12,
      protocol: 'CLOUD_SYNC',
      since: Date.now(),
    },
    governance: {
      raci: 'AI_SYSTEM',
      confidence: 0.99,
      mode: 'AUTONOMOUS',
      crag: 'STANDBY',
      fallback: 'NONE',
      reasonCode: null,
    },
    governanceLog: [],
    chainBlocks: [],
    dronePosition: { x: 80, y: 200, rotation: 45 },
    unknownObject: null,
    currentWaypoint: 0,
    totalWaypoints: 5,
    // Legacy fields
    roi: {
      liabilityExposure: 0,
      decisionsSecured: 0,
      riskMitigated: 0,
      incidentActive: false,
    },
    compliance: {
      faa108: 'READY',
      dod300009: 'COMPLIANT',
      euAiAct: 'LOGGING',
    },
    decisionLog: [],
    offlineReceiptCount: 0,
    syncedReceiptCount: 0,
    threat: null,
    avoidancePath: [],
  };
}

// Zone definitions for the map (stealth aesthetic)
export const MAP_ZONES = {
  green: {
    label: 'FLIGHT CORRIDOR',
    x: 30,
    y: 120,
    width: 140,
    height: 160,
  },
  grey: {
    label: 'UNCERTAINTY ZONE',
    x: 200,
    y: 80,
    width: 180,
    height: 200,
  },
  red: {
    label: 'DESTINATION',
    x: 410,
    y: 100,
    width: 120,
    height: 140,
  },
} as const;

// Flight path waypoints
export const FLIGHT_PATH = [
  { x: 80, y: 200, label: 'TAKEOFF', phase: 'TAKEOFF' as const },
  { x: 130, y: 170, label: 'WPT_1', phase: 'WAYPOINT_1' as const },
  { x: 180, y: 160, label: 'WPT_2', phase: 'WAYPOINT_2' as const },
  { x: 240, y: 150, label: 'WPT_3', phase: 'NORMAL_OPS' as const },
  { x: 300, y: 145, label: 'WPT_4', phase: 'NORMAL_OPS' as const },
  { x: 350, y: 140, label: 'WPT_5', phase: 'ROUTE_RESUMED' as const },
  { x: 420, y: 145, label: 'DEST', phase: 'MISSION_COMPLETE' as const },
] as const;

// GPS Drift zone location (triggers CRAG) - v2.3 BULLETPROOF
export const UNKNOWN_OBJECT_LOCATION = {
  id: 'GPS_DRIFT_01',
  label: 'GPS DRIFT ZONE',
  x: 270,
  y: 145,
};

// Legacy compatibility
export const THREAT_LOCATION = {
  id: 'LIAB_TARGET_01',
  label: 'OBSTACLE_DETECTED',
  x: 420,
  y: 145,
};

// Key narrative moments - v2.3 GPS DRIFT scenario
export const NARRATIVE_EVENTS = {
  UNCERTAINTY_DETECTED: {
    message: 'GPS signal degradation detected',
    reasonCode: 'RC006_CONTEXT_MISSING' as const,
  },
  CRAG_QUERY: {
    message: 'Ground Control - GPS recalibration requested',
  },
  HUMAN_RESPONSE: {
    message: 'Proceed - GPS recalibrated, signal restored',
    identifiedAs: 'GPS_RESTORED',
  },
  RACI_HANDOFF_TO_HUMAN: {
    from: 'AI_SYSTEM' as const,
    to: 'HUMAN_IN_LOOP' as const,
  },
  RACI_HANDOFF_TO_AI: {
    from: 'HUMAN_IN_LOOP' as const,
    to: 'AI_SYSTEM' as const,
  },
} as const;

// Affidavit data
export const AFFIDAVIT_DATA = {
  missionId: 'FLT-2026-0105-0847',
  aircraft: 'UAV-ALPHA-7',
  operator: 'Northstar AO',
  raciCompliance: 100,
  liabilityStatus: 'SHARED' as const,
} as const;

// Money shot values
export const MONEY_SHOTS = {
  LIABILITY_EXPOSURE: 15_000_000,
  DECISIONS_AT_INCIDENT: 78,
  FINAL_RECEIPTS_SYNCED: 142,
} as const;
