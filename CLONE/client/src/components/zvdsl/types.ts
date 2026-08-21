export type ZvdslCanvasType =
  | 'NUMBER_LINE'
  | 'zvdsl:number_line'
  | 'SYSTEM_INTERVAL_OVERLAP'
  | 'NUMBER_LINE_DOUBLE_ROOT'
  | 'RATIONAL_FRACTION_SIGN'
  | 'MORPHEME'
  | 'zvdsl:morpheme'
  | 'MORPHEME_BREAKDOWN'
  | 'SYNTAX'
  | 'zvdsl:syntax'
  | 'LINGUISTIC_SYNTAX_TREE'
  | 'SENTENCE_STRUCTURE_DIAGRAM'
  | 'POETIC_SYNTAX'
  | 'CHEM'
  | 'zvdsl:chem'
  | 'CHEMISTRY_STRUCTURE'
  | 'ORBITALS'
  | 'zvdsl:orbitals'
  | 'QUANTUM_ORBITALS'
  | 'FORCES'
  | 'zvdsl:forces'
  | 'FREE_BODY_DIAGRAM'
  | 'FORCES_INCLINED_PLANE'
  | 'V_T_KINEMATICS_GRAPH'
  | 'CIRCULAR_KINEMATICS'
  | 'FREE_FALL_MOTION'
  | 'CIRCUIT'
  | 'zvdsl:circuit'
  | 'ELECTRIC_CIRCUIT'
  | 'PARABOLA_ANALYSIS'
  | 'SYSTEM_GEOMETRIC_INTERSECTION'
  | 'ALGEBRAIC_IDENTITY'
  | 'GRAVITATIONAL_FIELD'
  | string;

export interface BaseZvdslSchema {
  schema_version?: string;
  canvas_type: ZvdslCanvasType;
  title?: string;
  elements?: any[];
  [key: string]: any;
}

// 1. Number Line types
export interface NumberLinePoint {
  type?: 'root_point' | 'root' | 'pole' | 'double_root';
  x: number;
  style?: 'hollow' | 'solid' | 'open' | 'closed';
  label?: string;
  note?: string;
  color?: string;
}

export interface NumberLineIntervalSign {
  type?: 'interval_sign';
  from: number;
  to: number;
  sign: '+' | '−' | '-' | string;
  color?: string;
}

export interface NumberLineShadedRegion {
  type?: 'shaded_region';
  intervals: [number, number][];
  fill?: string;
}

export interface NumberLineLayer {
  type?: 'number_line_layer';
  name?: string;
  interval: [number, number];
  bracket?: 'open' | 'closed';
  color?: string;
}

export interface NumberLineIntersectionHighlight {
  type?: 'intersection_highlight';
  interval: [number, number];
  left_bracket?: '[' | '(';
  right_bracket?: ']' | ')';
}

export interface NumberLineSchema extends BaseZvdslSchema {
  canvas_type: 'NUMBER_LINE' | 'zvdsl:number_line' | 'SYSTEM_INTERVAL_OVERLAP' | 'NUMBER_LINE_DOUBLE_ROOT' | 'RATIONAL_FRACTION_SIGN';
  axis?: { min: number; max: number; step?: number };
  elements?: Array<
    | { type: 'axis'; min: number; max: number; step?: number }
    | NumberLinePoint
    | NumberLineIntervalSign
    | NumberLineShadedRegion
    | NumberLineLayer
    | NumberLineIntersectionHighlight
    | any
  >;
}

// 2. Morpheme types
export type MorphemeRole =
  | 'prefix'
  | 'root'
  | 'suffix'
  | 'ending'
  | 'stem'
  | 'приставка'
  | 'корень'
  | 'суффикс'
  | 'окончание'
  | 'основа'
  | 'түбір'
  | 'түбір сөз'
  | 'екінші түбір'
  | 'жұрнақ'
  | 'жалғау'
  | string;

export interface MorphemePart {
  part: string;
  role: MorphemeRole;
  symbol?: 'prefix' | 'root' | 'suffix' | 'ending' | 'stem' | string;
  meaning?: string;
  description?: string;
}

export interface MorphemeSchema extends BaseZvdslSchema {
  canvas_type: 'MORPHEME' | 'zvdsl:morpheme' | 'MORPHEME_BREAKDOWN';
  word?: string;
  stem?: string;
  elements?: Array<MorphemePart | { type: 'morpheme'; part: string; role: string }>;
}

// 3. Syntax types
export type SyntaxRole =
  | 'subject' // ───
  | 'predicate' // ═══
  | 'attribute' // ~~~~
  | 'object' // - - -
  | 'adverbial' // _._._
  | 'conjunction'
  | 'particle'
  | string;

export interface SyntaxToken {
  text: string;
  role?: SyntaxRole;
  pos?: string; // Part of speech (Зат есім, Етістік, etc.)
  highlight?: boolean;
}

export interface SyntaxClause {
  type?: 'clause_box' | 'subordinate_clause' | 'main_clause' | 'parallel_clause_1' | 'parallel_clause_2';
  text?: string;
  clause_1?: string;
  conjunction?: string;
  clause_2?: string;
  marker?: string;
  role?: string;
}

export interface SyntaxSchema extends BaseZvdslSchema {
  canvas_type: 'SYNTAX' | 'zvdsl:syntax' | 'LINGUISTIC_SYNTAX_TREE' | 'SENTENCE_STRUCTURE_DIAGRAM' | 'POETIC_SYNTAX';
  sentence?: string;
  tokens?: SyntaxToken[];
  elements?: Array<any>;
}

// 4. Chemistry types
export interface ChemBond {
  from: string | number;
  to: string | number;
  type: 'single' | 'double' | 'triple' | 'aromatic' | 'hydrogen';
}

export interface ChemAtom {
  id: string | number;
  element: string;
  x: number;
  y: number;
  charge?: string;
  group?: string;
}

export interface ChemRing {
  type: 'benzene' | 'cyclohexane' | 'cyclopentane';
  center: [number, number];
  radius?: number;
  substituents?: Array<{ angle: number; label: string; group?: string }>;
}

export interface ChemistrySchema extends BaseZvdslSchema {
  canvas_type: 'CHEM' | 'zvdsl:chem' | 'CHEMISTRY_STRUCTURE';
  formula?: string;
  name?: string;
  atoms?: ChemAtom[];
  bonds?: ChemBond[];
  rings?: ChemRing[];
  reactions?: Array<{ reactants: string; conditions?: string; products: string }>;
}

// 5. Orbitals types
export interface QuantumCell {
  subshell: '1s' | '2s' | '2p' | '3s' | '3p' | '3d' | '4s' | string;
  electrons: number; // 0, 1, 2
  spins?: ('up' | 'down')[]; // ['up'], ['up', 'down']
  boxIndex?: number;
  label?: string;
}

export interface OrbitalsSchema extends BaseZvdslSchema {
  canvas_type: 'ORBITALS' | 'zvdsl:orbitals' | 'QUANTUM_ORBITALS';
  element_name?: string;
  atomic_number?: number;
  electron_config?: string;
  cells?: QuantumCell[];
}

// 6. Forces types
export interface ForceVector {
  name: string;
  symbol?: string;
  direction: 'up' | 'down' | 'left' | 'right' | number; // angle in degrees or direction string
  mag?: number;
  color?: string;
  label?: string;
}

export interface ForcesSchema extends BaseZvdslSchema {
  canvas_type: 'FORCES' | 'zvdsl:forces' | 'FREE_BODY_DIAGRAM' | 'FORCES_INCLINED_PLANE' | 'V_T_KINEMATICS_GRAPH' | 'CIRCULAR_KINEMATICS' | 'FREE_FALL_MOTION';
  incline_angle?: number;
  mass?: string | number;
  friction_mu?: number;
  elements?: Array<any>;
}

// 7. Circuit types
export type CircuitElementType =
  | 'battery'
  | 'dc_source'
  | 'resistor'
  | 'switch_open'
  | 'switch_closed'
  | 'ammeter'
  | 'voltmeter'
  | 'lamp'
  | 'capacitor'
  | 'ground'
  | 'wire';

export interface CircuitElement {
  id: string;
  type: CircuitElementType;
  label?: string;
  value?: string;
  x: number;
  y: number;
  rotation?: number;
}

export interface CircuitWire {
  from: [number, number];
  to: [number, number];
  currentArrow?: boolean;
}

export interface CircuitSchema extends BaseZvdslSchema {
  canvas_type: 'CIRCUIT' | 'zvdsl:circuit' | 'ELECTRIC_CIRCUIT';
  components?: CircuitElement[];
  wires?: CircuitWire[];
  current?: string;
  voltage?: string;
}
