/**
 * Variables Configuration
 * =======================
 * 
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 * 
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 * 
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /**
     * Correct answer for cloze input validation.
     * Accepts a single string, pipe-separated alternates (e.g. "first | 1 | 1st"),
     * or an array of accepted answers (e.g. ["first", "1", "1st"]).
     */
    correctAnswer?: string | string[];
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE
 * =====================================================
 * 
 * SUPPORTED TYPES:
 * 
 * 1. NUMBER (slider):
 *    { defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }
 * 
 * 2. TEXT (free text):
 *    { defaultValue: 'Hello', type: 'text', placeholder: 'Enter text...' }
 * 
 * 3. SELECT (dropdown):
 *    { defaultValue: 'sine', type: 'select', options: ['sine', 'cosine', 'tangent'] }
 * 
 * 4. BOOLEAN (toggle):
 *    { defaultValue: true, type: 'boolean' }
 * 
 * 5. ARRAY (list of numbers):
 *    { defaultValue: [1, 2, 3], type: 'array' }
 * 
 * 6. OBJECT (complex data):
 *    { defaultValue: { x: 5, y: 10 }, type: 'object', schema: '{ x: number, y: number }' }
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ─────────────────────────────────────────
    // SECTION 2 — One Angle, One Ratio (skate ramp)
    // ─────────────────────────────────────────
    rampLength: {
        defaultValue: 3,
        type: 'number',
        label: 'Ramp length',
        description: 'Length of the sloping ramp surface, dragged by the student',
        unit: 'm',
        min: 2,
        max: 6,
        step: 0.1,
        color: '#62D0AD',
    },
    rampHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Ramp highlight',
        description: 'Which part of the ramp triangle is highlighted: height | slope',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.22)',
    },
    rampExplored: {
        defaultValue: false,
        type: 'boolean',
        label: 'Ramp explored',
        description: 'True once the student has dragged the ramp',
    },
    answerRampHeight: {
        defaultValue: '',
        type: 'text',
        label: 'Ramp height answer',
        description: 'Height of an 8 m ramp at the same steepness',
        placeholder: '???',
        correctAnswer: ['4', '4m', '4 m'],
        color: '#62D0AD',
    },

    // ─────────────────────────────────────────
    // SECTION 3 — Which Side Is Which
    // ─────────────────────────────────────────
    markedVertex: {
        defaultValue: 0,
        type: 'number',
        label: 'Marked corner',
        description: 'Which acute corner is marked: 0 = bottom corner, 1 = top corner',
        min: 0,
        max: 1,
        step: 1,
        color: '#62D0AD',
    },
    sidesHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Side highlight',
        description: 'Which named side is highlighted: hypotenuse | opposite | adjacent',
        color: '#8E90F5',
        bgColor: 'rgba(142, 144, 245, 0.22)',
    },
    answerSideSwap: {
        defaultValue: '',
        type: 'select',
        label: 'Side swap answer',
        description: 'What the opposite side becomes when the marked corner moves',
        options: ['hypotenuse', 'opposite', 'adjacent'],
        correctAnswer: 'adjacent',
        placeholder: '???',
        color: '#8E90F5',
    },

    // ─────────────────────────────────────────
    // SECTION 4 — Three Ratios, Three Names
    // ─────────────────────────────────────────
    triangleAngle: {
        defaultValue: 30,
        type: 'number',
        label: 'Angle',
        description: 'The marked angle of the right triangle',
        unit: '°',
        min: 10,
        max: 80,
        step: 1,
        color: '#62D0AD',
    },
    sinePrediction: {
        defaultValue: 0.5,
        type: 'number',
        label: 'Your guess',
        description: 'Where the student predicts the sine will land',
        min: 0,
        max: 1,
        step: 0.01,
        color: '#8E90F5',
    },
    predictionMoved: {
        defaultValue: false,
        type: 'boolean',
        label: 'Prediction moved',
        description: 'True once the student has moved the prediction marker',
    },
    ratioHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Ratio highlight',
        description: 'Which ratio is highlighted: sine | cosine | tangent',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.22)',
    },
    answerDoubleAngle: {
        defaultValue: '',
        type: 'select',
        label: 'Doubling answer',
        description: 'How sin 60 compares with twice sin 30',
        options: ['equal to', 'less than', 'greater than'],
        correctAnswer: 'less than',
        placeholder: '???',
        color: '#62D0AD',
    },
    answerSineFromSides: {
        defaultValue: '',
        type: 'text',
        label: 'Sine from sides answer',
        description: 'Sine of the angle in a 3-4-5 triangle',
        placeholder: '???',
        correctAnswer: ['0.6', '.6', '0.60', '3/5'],
        color: '#62D0AD',
    },
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
