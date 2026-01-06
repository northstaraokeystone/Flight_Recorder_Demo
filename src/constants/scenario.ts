/**
 * Denied Environment Scenario Configuration
 * All timing and scenario parameters in one place
 */

// Phase timing (milliseconds)
export const TIMING = {
  PHASE_NORMAL_OPS_DURATION: 8000,      // 8 seconds - normal flight
  PHASE_DEGRADED_DURATION: 4000,        // 4 seconds - signal degrading
  PHASE_OFFLINE_DURATION: 23000,        // 23 seconds - in dead zone
  PHASE_INCIDENT_DURATION: 4000,        // 4 seconds - detection & avoidance
  PHASE_RECONNECT_DURATION: 5000,       // 5 seconds - exiting dead zone
  PHASE_BURST_SYNC_DURATION: 5000,      // 5 seconds - sync animation
  PHASE_FINAL_HOLD_DURATION: 5000,      // 5 seconds - hold success state

  RECEIPT_TICK_INTERVAL: 300,           // New receipt every 300ms while offline
  BURST_SYNC_SPEED: 50,                 // 50ms per receipt during sync animation
  DECISION_LOG_INTERVAL: 1500,          // New log entry every 1.5s during offline
} as const;

// Scenario phases
export type ScenarioPhase =
  | 'NORMAL_OPS'
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

// Compliance standard states
export type ComplianceState = 'READY' | 'COMPLIANT' | 'MONITORING' | 'ACTIVE' | 'LOGGING' | 'LOCAL_CAPTURE' | 'VERIFIED' | 'CHAIN_INTACT' | 'EXCEEDED';

// Decision log event types
export type DecisionEventType =
  | 'WAYPOINT_LOCKED'
  | 'COMMS_STATUS'
  | 'PROTOCOL'
  | 'OBSTACLE_DETECTED'
  | 'RACI_CHECK'
  | 'STOP_RULE'
  | 'MANEUVER'
  | 'BURST_SYNC'
  | 'CHAIN_INTEGRITY';

export type DecisionSeverity = 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';

// Decision log entry
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

// ROI ticker state
export interface ROIState {
  liabilityExposure: number;
  decisionsSecured: number;
  riskMitigated: number;
  incidentActive: boolean;
}

// Chain block for visualization
export interface ChainBlock {
  id: number;
  decisionId: string;
  hash: string;
  status: 'PENDING' | 'SYNCED' | 'VERIFIED';
  timestamp: number;
}

// Compliance status for each standard
export interface ComplianceStatus {
  faa108: ComplianceState;
  dod300009: ComplianceState;
  euAiAct: ComplianceState;
  do178c?: ComplianceState;
  assureA55?: ComplianceState;
}

// Drone position on map
export interface DronePosition {
  x: number;
  y: number;
  rotation: number; // degrees
}

// Threat/obstacle data
export interface ThreatData {
  id: string;
  label: string;
  x: number;
  y: number;
  detected: boolean;
  avoided: boolean;
}

// Full scenario state
export interface ScenarioState {
  phase: ScenarioPhase;
  phaseStartTime: number;
  elapsedTime: number;
  link: LinkState;
  roi: ROIState;
  compliance: ComplianceStatus;
  decisionLog: DecisionLogEntry[];
  chainBlocks: ChainBlock[];
  offlineReceiptCount: number;
  syncedReceiptCount: number;
  dronePosition: DronePosition;
  threat: ThreatData | null;
  avoidancePath: { x: number; y: number }[];
}

// Initial state factory
export function createInitialScenarioState(): ScenarioState {
  return {
    phase: 'NORMAL_OPS',
    phaseStartTime: Date.now(),
    elapsedTime: 0,
    link: {
      status: 'OPTIMAL',
      latencyMs: 12,
      protocol: 'CLOUD_SYNC',
      since: Date.now(),
    },
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
    chainBlocks: [],
    offlineReceiptCount: 0,
    syncedReceiptCount: 0,
    dronePosition: { x: 80, y: 200, rotation: 45 }, // Starts at FLIGHT_PATH[0]
    threat: null,
    avoidancePath: [],
  };
}

// Zone definitions for the map
export const MAP_ZONES = {
  green: {
    label: 'FLIGHT CORRIDOR',
    x: 30,
    y: 120,
    width: 140,
    height: 160,
  },
  grey: {
    label: 'COMMS DEAD ZONE',
    x: 200,
    y: 80,
    width: 180,
    height: 200,
  },
  red: {
    label: 'LIABILITY ZONE',
    x: 410,
    y: 100,
    width: 120,
    height: 140,
  },
} as const;

// Flight path waypoints
export const FLIGHT_PATH = [
  { x: 80, y: 200, phase: 'NORMAL_OPS' as const },
  { x: 130, y: 170, phase: 'NORMAL_OPS' as const },
  { x: 180, y: 160, phase: 'DEGRADED' as const },
  { x: 240, y: 150, phase: 'OFFLINE' as const },
  { x: 300, y: 140, phase: 'OFFLINE' as const },
  { x: 350, y: 135, phase: 'INCIDENT_DETECTED' as const },
  // Avoidance curve (generated dynamically)
  { x: 340, y: 170, phase: 'AVOIDANCE_EXECUTED' as const },
  { x: 320, y: 200, phase: 'RECONNECTING' as const },
  { x: 280, y: 220, phase: 'RECONNECTING' as const },
  { x: 230, y: 230, phase: 'BURST_SYNC' as const },
  { x: 180, y: 220, phase: 'VERIFIED' as const },
] as const;

// Threat location (school bus)
export const THREAT_LOCATION = {
  id: 'LIAB_TARGET_01',
  label: 'OBSTACLE_DETECTED',
  x: 420,
  y: 145,
};

// Money shot values
export const MONEY_SHOTS = {
  LIABILITY_EXPOSURE: 15_000_000, // $15M
  DECISIONS_AT_INCIDENT: 78,
  FINAL_RECEIPTS_SYNCED: 142,
} as const;
