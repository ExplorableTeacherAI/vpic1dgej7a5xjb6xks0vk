/**
 * Section 2 — One Angle, One Ratio
 * A skate ramp locked at 30°. The student drags the top corner along the slope
 * to stretch the ramp; a ghost of the starting ramp stays behind as the
 * before-state reference. Height and length both change; their ratio does not.
 */

import React, { useEffect, useRef, useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeInput,
    InlineFeedback,
    InlineFormula,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InlineSpotColor,
    InlineTrigger,
    InteractionHintSequence,
    RevealOnInteraction,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring, vec2, type Vec2 } from "@/lib/motion";
import {
    clozePropsFromDefinition,
    getVariableInfo,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
    spotColorPropsFromDefinition,
} from "../variables";

// ── Domain model ─────────────────────────────────────────────────────────────

const SLOPE_DEGREES = 30;
const SLOPE_RADIANS = (SLOPE_DEGREES * Math.PI) / 180;
const SIN_SLOPE = Math.sin(SLOPE_RADIANS);
const COS_SLOPE = Math.cos(SLOPE_RADIANS);
const MIN_LENGTH = 2;
const MAX_LENGTH = 6;
const DEFAULT_LENGTH = 3;

// ── View constants ───────────────────────────────────────────────────────────

const VIEW_WIDTH = 620;
const VIEW_HEIGHT = 340;
const GROUND_Y = 280;
const ORIGIN: Vec2 = { x: 70, y: GROUND_Y };
const PIXELS_PER_METER = 66;

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const ACCENT = "#62D0AD"; // the height (the opposite side) and the drag handle
const HYPOTENUSE = "#F7B23B"; // the sloping surface — the ramp length
const ANGLE = "#62CCF9"; // the locked 30° angle

const EASE_150 = { transition: "opacity 150ms ease, stroke-width 150ms ease" } as const;

const formatMetres = (value: number) => `${value.toFixed(2)} m`;
const formatRatio = (value: number) => value.toFixed(2);

const cornerFor = (length: number) => ({
    x: ORIGIN.x + length * COS_SLOPE * PIXELS_PER_METER,
    y: GROUND_Y - length * SIN_SLOPE * PIXELS_PER_METER,
});

// ── The bespoke drawing ──────────────────────────────────────────────────────

function RampDrawing() {
    const setVar = useSetVar();
    const length = useVar<number>("rampLength", DEFAULT_LENGTH);
    const highlight = useVar<string>("rampHighlight", "");

    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    const handleScale = useSpring(dragging || hovered ? 1.15 : 1, {
        stiffness: 400,
        damping: 26,
    });

    const opacity = (id: string) => (highlight && highlight !== id ? 0.35 : 1);
    const isActive = (id: string) => highlight === id;
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("rampHighlight", id),
        onPointerLeave: () => setVar("rampHighlight", ""),
    });

    // Stretching the ramp by any route (corner, slider, prose) counts as exploring.
    useEffect(() => {
        if (Math.abs(length - DEFAULT_LENGTH) > 0.05) setVar("rampExplored", true);
    }, [length, setVar]);

    const corner = cornerFor(length);
    const ghost = cornerFor(DEFAULT_LENGTH);
    const height = length * SIN_SLOPE;
    const base = length * COS_SLOPE;
    const ratio = height / length;

    const handlePointerMove = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!dragging || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const point: Vec2 = {
            x: ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH,
            y: ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT,
        };
        const slopeDirection: Vec2 = { x: COS_SLOPE, y: -SIN_SLOPE };
        const alongSlope = vec2.dot(vec2.sub(point, ORIGIN), slopeDirection);
        setVar("rampLength", clamp(alongSlope / PIXELS_PER_METER, MIN_LENGTH, MAX_LENGTH));
        setVar("rampExplored", true);
    };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="A skate ramp locked at thirty degrees with a draggable top corner"
        >
            <defs>
                <filter id="ramp-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* Live readouts — one formatter per quantity, tabular numerals. */}
            <g fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                <text x="40" y="42" fill={ACCENT} opacity={opacity("height")} style={EASE_150}>
                    {`height        ${formatMetres(height)}`}
                </text>
                <text x="40" y="64" fill={HYPOTENUSE} opacity={opacity("slope")} style={EASE_150}>
                    {`ramp          ${formatMetres(length)}`}
                </text>
                <text x="40" y="90" fill={INK} fontWeight="600">
                    <tspan fill={ACCENT}>height</tspan>
                    {" ÷ "}
                    <tspan fill={HYPOTENUSE}>ramp</tspan>
                    {` = ${formatRatio(ratio)}`}
                </text>
            </g>

            {/* Ground. */}
            <line
                x1="40"
                y1={GROUND_Y}
                x2="580"
                y2={GROUND_Y}
                stroke={INK_QUIET}
                strokeWidth="2"
                strokeLinecap="round"
            />

            {/* Ghost of the starting 3 m ramp — the before-state reference. */}
            <polyline
                points={`${ORIGIN.x},${GROUND_Y} ${ghost.x},${GROUND_Y} ${ghost.x},${ghost.y} ${ORIGIN.x},${GROUND_Y}`}
                fill="none"
                stroke={INK_QUIET}
                strokeWidth="1.5"
                strokeDasharray="4 5"
                strokeLinejoin="round"
            />

            {/* Base — structure weight. */}
            <g opacity={opacity("__structure")} style={EASE_150}>
                <line
                    x1={ORIGIN.x}
                    y1={GROUND_Y}
                    x2={corner.x}
                    y2={GROUND_Y}
                    stroke={INK_STRUCTURE}
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                {/* Right-angle square at the foot of the ramp. */}
                <polyline
                    points={`${corner.x - 14},${GROUND_Y} ${corner.x - 14},${GROUND_Y - 14} ${corner.x},${GROUND_Y - 14}`}
                    fill="none"
                    stroke={INK_STRUCTURE}
                    strokeWidth="1.5"
                />
                {/* Angle arc and its label. */}
                <path
                    d={`M ${ORIGIN.x + 46} ${GROUND_Y} A 46 46 0 0 0 ${ORIGIN.x + 46 * COS_SLOPE} ${GROUND_Y - 46 * SIN_SLOPE}`}
                    fill="none"
                    stroke={ANGLE}
                    strokeWidth="2.5"
                />
                <text x={ORIGIN.x + 56} y={GROUND_Y - 14} fill={ANGLE} fontSize="12">
                    30°
                </text>
                <text
                    x={(ORIGIN.x + corner.x) / 2}
                    y={GROUND_Y + 22}
                    fill={INK}
                    fontSize="12"
                    textAnchor="middle"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {formatMetres(base)}
                </text>
            </g>

            {/* Height — accent, one of the two linked quantities. */}
            <g {...hoverProps("height")} opacity={opacity("height")} style={{ ...EASE_150, cursor: "default" }}>
                {isActive("height") && (
                    <line
                        x1={corner.x}
                        y1={GROUND_Y}
                        x2={corner.x}
                        y2={corner.y}
                        stroke={ACCENT}
                        strokeWidth="9"
                        strokeLinecap="round"
                        opacity={0.28}
                    />
                )}
                <line
                    x1={corner.x}
                    y1={GROUND_Y}
                    x2={corner.x}
                    y2={corner.y}
                    stroke={ACCENT}
                    strokeWidth={isActive("height") ? 4.5 : 3}
                    strokeLinecap="round"
                    style={EASE_150}
                />
                <text
                    x={corner.x + 12}
                    y={(GROUND_Y + corner.y) / 2 + 4}
                    fill={ACCENT}
                    fontSize="12"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {formatMetres(height)}
                </text>
            </g>

            {/* Sloping surface — amber, the side the student drags. */}
            <g {...hoverProps("slope")} opacity={opacity("slope")} style={{ ...EASE_150, cursor: "default" }}>
                {isActive("slope") && (
                    <line
                        x1={ORIGIN.x}
                        y1={GROUND_Y}
                        x2={corner.x}
                        y2={corner.y}
                        stroke={HYPOTENUSE}
                        strokeWidth="10"
                        strokeLinecap="round"
                        opacity={0.28}
                    />
                )}
                <line
                    x1={ORIGIN.x}
                    y1={GROUND_Y}
                    x2={corner.x}
                    y2={corner.y}
                    stroke={HYPOTENUSE}
                    strokeWidth={isActive("slope") ? 5 : 3.5}
                    strokeLinecap="round"
                    style={EASE_150}
                />
                <text
                    x={(ORIGIN.x + corner.x) / 2 - 10}
                    y={(GROUND_Y + corner.y) / 2 - 10}
                    fill={HYPOTENUSE}
                    fontSize="12"
                    textAnchor="end"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {formatMetres(length)}
                </text>
            </g>

            {/* Draggable top corner. */}
            <g transform={`translate(${corner.x} ${corner.y}) scale(${handleScale})`}>
                <circle r="12" fill={ACCENT} filter="url(#ramp-handle-shadow)" />
            </g>
            <circle
                cx={corner.x}
                cy={corner.y}
                r="24"
                fill="transparent"
                style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setDragging(true);
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={() => setDragging(false)}
                onPointerCancel={() => setDragging(false)}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            />
        </svg>
    );
}

function RampFigure() {
    const setVar = useSetVar();

    return (
        <Figure
            id="trig-ramp-ratio"
            onReset={() => {
                setVar("rampLength", DEFAULT_LENGTH);
                setVar("rampHighlight", "");
            }}
            caption="The steepness is locked at 30°. Drag the teal corner along the slope: both lengths change, the ratio does not. The dashed outline shows where the ramp started."
        >
            <RampDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="rampLength"
                    label="Ramp length"
                    {...numberPropsFromDefinition(getVariableInfo("rampLength"))}
                    formatValue={formatMetres}
                />
            </div>
            <InteractionHintSequence
                hintKey="trig-ramp-drag-corner"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag the teal corner up the slope",
                        position: { x: "39%", y: "48%" },
                        dragPath: {
                            type: "line",
                            startOffset: { x: -26, y: 15 },
                            endOffset: { x: 26, y: -15 },
                        },
                    },
                ]}
            />
        </Figure>
    );
}

// ── Blocks ───────────────────────────────────────────────────────────────────

export const trigRatioConstantBlocks: ReactElement[] = [
    <StackLayout key="layout-trig-ratio-heading" maxWidth="xl">
        <Block id="trig-ratio-heading" padding="md">
            <EditableH2 id="h2-trig-ratio-heading" blockId="trig-ratio-heading">
                One Angle, One Ratio
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-ratio-setup" maxWidth="xl">
        <Block id="trig-ratio-setup" padding="sm">
            <EditableParagraph id="para-trig-ratio-setup" blockId="trig-ratio-setup">
                Here is a skate ramp whose steepness is locked at{" "}
                <InlineSpotColor
                    id="spot-trig-ratio-setup-angle"
                    varName="markedAngle"
                    {...spotColorPropsFromDefinition(getVariableInfo("markedAngle"))}
                >
                    30°
                </InlineSpotColor>
                . Drag the teal corner at the top to stretch the{" "}
                <InlineLinkedHighlight
                    varName="rampHighlight"
                    highlightId="slope"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("rampHighlight"))}
                    color="#F7B23B"
                    bgColor="rgba(247, 178, 59, 0.22)"
                >
                    sloping surface
                </InlineLinkedHighlight>{" "}
                out to{" "}
                <InlineScrubbleNumber
                    varName="rampLength"
                    {...numberPropsFromDefinition(getVariableInfo("rampLength"))}
                    formatValue={formatMetres}
                />
                , and watch the{" "}
                <InlineLinkedHighlight
                    varName="rampHighlight"
                    highlightId="height"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("rampHighlight"))}
                >
                    height
                </InlineLinkedHighlight>{" "}
                climb with it while the ratio in the corner refuses to budge.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-ratio-figure" maxWidth="xl">
        <Block id="trig-ratio-figure" padding="sm" hasVisualization>
            <RampFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-ratio-reflect" maxWidth="xl">
        <Block id="trig-ratio-reflect" padding="sm">
            <EditableParagraph id="para-trig-ratio-reflect" blockId="trig-ratio-reflect">
                <InlineTrigger
                    id="trigger-trig-ratio-longer-ramp"
                    varName="rampLength"
                    value={6}
                    color="#F7B23B"
                    bgColor="rgba(247, 178, 59, 0.18)"
                    icon="zap"
                >
                    Longer ramp
                </InlineTrigger>
                , taller ramp, same{" "}
                <InlineFormula
                    id="formula-trig-ratio-height-over-ramp"
                    latex="\text{\clr{sideOpposite}{height}} \div \text{\clr{sideHypotenuse}{ramp}} = 0.50"
                    colorMap={{ sideOpposite: "#62D0AD", sideHypotenuse: "#F7B23B" }}
                />
                . The two lengths keep changing, but their ratio is pinned to the angle,
                which means that one decimal is really a name for the steepness. Every{" "}
                <InlineSpotColor
                    id="spot-trig-ratio-reflect-angle"
                    varName="markedAngle"
                    {...spotColorPropsFromDefinition(getVariableInfo("markedAngle"))}
                >
                    30°
                </InlineSpotColor>{" "}
                slope on earth shares it.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-ratio-question" maxWidth="xl">
        <Block id="trig-ratio-question" padding="sm">
            <EditableParagraph id="para-trig-ratio-question" blockId="trig-ratio-question">
                <RevealOnInteraction varName="rampExplored">
                    A ramp at the skatepark next door has the same{" "}
                    <InlineSpotColor
                        id="spot-trig-ratio-question-angle"
                        varName="markedAngle"
                        {...spotColorPropsFromDefinition(getVariableInfo("markedAngle"))}
                    >
                        30°
                    </InlineSpotColor>{" "}
                    slope and is{" "}
                    <InlineSpotColor
                        id="spot-trig-ratio-question-ramp-length"
                        varName="sideHypotenuse"
                        {...spotColorPropsFromDefinition(getVariableInfo("sideHypotenuse"))}
                    >
                        8 m
                    </InlineSpotColor>{" "}
                    long. Measured in metres, its{" "}
                    <InlineSpotColor
                        id="spot-trig-ratio-question-height"
                        varName="sideOpposite"
                        {...spotColorPropsFromDefinition(getVariableInfo("sideOpposite"))}
                    >
                        height
                    </InlineSpotColor>{" "}
                    is{" "}
                    <InlineFeedback
                        varName="answerRampHeight"
                        correctValue={["4", "4m", "4 m"]}
                        position="terminal"
                        successMessage="— exactly, and you never needed a protractor: 0.50 of 8 m is 4 m"
                        failureMessage="— not yet."
                        hint="Whatever the ramp length, the height is 0.50 of it"
                        visualizationHint={{
                            blockId: "trig-ratio-figure",
                            hintKey: "trig-ratio-feedback-hint",
                            label: "Discover it yourself",
                            resetVars: { rampLength: 2 },
                            steps: [
                                {
                                    gesture: "drag",
                                    label: "Drag the corner until the ramp reads 4 m — what height does it show?",
                                    position: { x: "39%", y: "48%" },
                                    completionVar: "rampLength",
                                    completionValue: 4,
                                    completionTolerance: 0.15,
                                },
                                {
                                    gesture: "drag",
                                    label: "Keep going to 6 m — the height is still half the ramp",
                                    position: { x: "55%", y: "35%" },
                                    completionVar: "rampLength",
                                    completionValue: 6,
                                    completionTolerance: 0.15,
                                },
                            ],
                        }}
                    >
                        <InlineClozeInput
                            varName="answerRampHeight"
                            correctAnswer={["4", "4m", "4 m"]}
                            {...clozePropsFromDefinition(getVariableInfo("answerRampHeight"))}
                        />
                    </InlineFeedback>.
                </RevealOnInteraction>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
