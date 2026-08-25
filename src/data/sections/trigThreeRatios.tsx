/**
 * Section 4 — Three Ratios, Three Names
 * Prediction-first. The student parks an indigo guess on a 0-to-1 sine scale,
 * then drags the triangle's corner round to 60° and sees the real value land.
 * The scale shares the hypotenuse's pixel length, so the dashed guide makes
 * "sine = opposite over hypotenuse" literally visible.
 */

import React, { useRef, useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InlineLinkedHighlight,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring, type Vec2 } from "@/lib/motion";
import {
    choicePropsFromDefinition,
    clozePropsFromDefinition,
    getVariableInfo,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
} from "../variables";

// ── View constants ───────────────────────────────────────────────────────────

const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 390;
const BASE_Y = 300;
const VERTEX: Vec2 = { x: 60, y: BASE_Y };
const HYPOTENUSE_PX = 260; // also the length of the 0-to-1 scale: the visible tie
const SCALE_X = 520;

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const ACCENT = "#62D0AD"; // the triangle and the true sine
const PARTNER = "#8E90F5"; // the student's prediction

const EASE_150 = { transition: "opacity 150ms ease, stroke-width 150ms ease" } as const;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const formatRatio = (value: number) => value.toFixed(2);
const formatAngle = (value: number) => `${Math.round(value)}°`;
const scaleY = (value: number) => BASE_Y - value * HYPOTENUSE_PX;

// ── The bespoke drawing ──────────────────────────────────────────────────────

function RatioDrawing() {
    const setVar = useSetVar();
    const angle = useVar<number>("triangleAngle", 30);
    const prediction = useVar<number>("sinePrediction", 0.5);
    const highlight = useVar<string>("ratioHighlight", "");

    const [draggingCorner, setDraggingCorner] = useState(false);
    const [draggingGuess, setDraggingGuess] = useState(false);
    const [hoveredCorner, setHoveredCorner] = useState(false);
    const [hoveredGuess, setHoveredGuess] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    const cornerScale = useSpring(draggingCorner || hoveredCorner ? 1.15 : 1, { stiffness: 400, damping: 26 });
    const guessScale = useSpring(draggingGuess || hoveredGuess ? 1.15 : 1, { stiffness: 400, damping: 26 });

    // Highlight contract: an element may belong to several ratios.
    const dim = (ids: string[]) => (highlight && !ids.includes(highlight) ? 0.35 : 1);
    const isActive = (ids: string[]) => ids.includes(highlight);
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("ratioHighlight", id),
        onPointerLeave: () => setVar("ratioHighlight", ""),
    });

    const radians = toRadians(angle);
    const sine = Math.sin(radians);
    const cosine = Math.cos(radians);
    const tangent = Math.tan(radians);

    const foot: Vec2 = { x: VERTEX.x + HYPOTENUSE_PX * cosine, y: BASE_Y };
    const apex: Vec2 = { x: foot.x, y: BASE_Y - HYPOTENUSE_PX * sine };

    const svgPoint = (event: React.PointerEvent): Vec2 => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH,
            y: ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT,
        };
    };

    const moveCorner = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!draggingCorner) return;
        const point = svgPoint(event);
        const degrees = (Math.atan2(BASE_Y - point.y, point.x - VERTEX.x) * 180) / Math.PI;
        setVar("triangleAngle", clamp(Math.round(degrees), 10, 80));
    };

    const moveGuess = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!draggingGuess) return;
        const point = svgPoint(event);
        setVar("sinePrediction", clamp((BASE_Y - point.y) / HYPOTENUSE_PX, 0, 1));
        setVar("predictionMoved", true);
    };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="A right triangle with a draggable corner beside a sine scale with a draggable prediction marker"
        >
            <defs>
                <filter id="ratio-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* Base and right-angle square. */}
            <g opacity={dim(["cosine", "tangent"])} style={EASE_150} {...hoverProps("cosine")}>
                {isActive(["cosine"]) && (
                    <line x1={VERTEX.x} y1={BASE_Y} x2={foot.x} y2={BASE_Y} stroke={INK_STRUCTURE} strokeWidth="10" strokeLinecap="round" opacity={0.28} />
                )}
                <line
                    x1={VERTEX.x}
                    y1={BASE_Y}
                    x2={foot.x}
                    y2={BASE_Y}
                    stroke={INK_STRUCTURE}
                    strokeWidth={isActive(["cosine", "tangent"]) ? 4 : 2.5}
                    strokeLinecap="round"
                    style={EASE_150}
                />
                <text x={(VERTEX.x + foot.x) / 2} y={BASE_Y + 24} fill={INK} fontSize="12" textAnchor="middle">
                    adjacent
                </text>
            </g>

            <polyline
                points={`${foot.x - 14},${BASE_Y} ${foot.x - 14},${BASE_Y - 14} ${foot.x},${BASE_Y - 14}`}
                fill="none"
                stroke={INK_STRUCTURE}
                strokeWidth="1.5"
            />

            {/* Hypotenuse. */}
            <g opacity={dim(["sine", "cosine"])} style={EASE_150} {...hoverProps("sine")}>
                {isActive(["sine"]) && (
                    <line x1={VERTEX.x} y1={BASE_Y} x2={apex.x} y2={apex.y} stroke={INK_STRUCTURE} strokeWidth="10" strokeLinecap="round" opacity={0.28} />
                )}
                <line
                    x1={VERTEX.x}
                    y1={BASE_Y}
                    x2={apex.x}
                    y2={apex.y}
                    stroke={INK_STRUCTURE}
                    strokeWidth={isActive(["sine", "cosine"]) ? 4 : 2.5}
                    strokeLinecap="round"
                    style={EASE_150}
                />
            </g>

            {/* Opposite side — accent, the numerator of the sine. */}
            <g opacity={dim(["sine", "tangent"])} style={EASE_150} {...hoverProps("sine")}>
                {isActive(["sine", "tangent"]) && (
                    <line x1={foot.x} y1={BASE_Y} x2={apex.x} y2={apex.y} stroke={ACCENT} strokeWidth="10" strokeLinecap="round" opacity={0.28} />
                )}
                <line
                    x1={foot.x}
                    y1={BASE_Y}
                    x2={apex.x}
                    y2={apex.y}
                    stroke={ACCENT}
                    strokeWidth={isActive(["sine", "tangent"]) ? 5 : 3.5}
                    strokeLinecap="round"
                    style={EASE_150}
                />
                <text x={foot.x + 10} y={(BASE_Y + apex.y) / 2 + 4} fill={ACCENT} fontSize="12">
                    opposite
                </text>
            </g>

            {/* Marked angle. */}
            <path
                d={`M ${VERTEX.x + 40} ${BASE_Y} A 40 40 0 0 0 ${VERTEX.x + 40 * cosine} ${BASE_Y - 40 * sine}`}
                fill="none"
                stroke={ACCENT}
                strokeWidth="2.5"
            />
            <text x={VERTEX.x + 52} y={BASE_Y - 14} fill={ACCENT} fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatAngle(angle)}
            </text>

            {/* Draggable corner. */}
            <g transform={`translate(${apex.x} ${apex.y}) scale(${cornerScale})`}>
                <circle r="12" fill={ACCENT} filter="url(#ratio-handle-shadow)" />
            </g>
            <circle
                cx={apex.x}
                cy={apex.y}
                r="26"
                fill="transparent"
                style={{ cursor: draggingCorner ? "grabbing" : "grab", touchAction: "none" }}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setDraggingCorner(true);
                }}
                onPointerMove={moveCorner}
                onPointerUp={() => setDraggingCorner(false)}
                onPointerCancel={() => setDraggingCorner(false)}
                onPointerEnter={() => setHoveredCorner(true)}
                onPointerLeave={() => setHoveredCorner(false)}
            />

            {/* The visible tie: the apex height carried across to the sine scale. */}
            <line
                x1={apex.x}
                y1={apex.y}
                x2={SCALE_X}
                y2={apex.y}
                stroke={ACCENT}
                strokeWidth="1.5"
                strokeDasharray="3 5"
                opacity={0.6}
            />

            {/* The 0-to-1 sine scale — same pixel length as the hypotenuse. */}
            <line x1={SCALE_X} y1={BASE_Y} x2={SCALE_X} y2={scaleY(1)} stroke={INK_QUIET} strokeWidth="2" strokeLinecap="round" />
            <text x={SCALE_X} y={scaleY(1) - 12} fill={INK} fontSize="12" textAnchor="middle">
                1
            </text>
            <text x={SCALE_X} y={BASE_Y + 18} fill={INK} fontSize="12" textAnchor="middle">
                0
            </text>

            {/* The true sine, right of the scale. */}
            <circle cx={SCALE_X} cy={scaleY(sine)} r="6" fill={ACCENT} />
            <text
                x={SCALE_X + 14}
                y={scaleY(sine) + 4}
                fill={ACCENT}
                fontSize="12"
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {formatRatio(sine)}
            </text>

            {/* The student's guess, left of the scale — name above, value below,
                so the two-line label never reaches the triangle's side labels. */}
            <g fill={PARTNER} fontSize="11" textAnchor="end">
                <text x={SCALE_X - 20} y={scaleY(prediction) - 4}>
                    your guess (sine)
                </text>
                <text
                    x={SCALE_X - 20}
                    y={scaleY(prediction) + 12}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {formatRatio(prediction)}
                </text>
            </g>
            <g transform={`translate(${SCALE_X} ${scaleY(prediction)}) scale(${guessScale})`}>
                <circle r="10" fill={PARTNER} filter="url(#ratio-handle-shadow)" />
            </g>
            <circle
                cx={SCALE_X}
                cy={scaleY(prediction)}
                r="24"
                fill="transparent"
                style={{ cursor: draggingGuess ? "grabbing" : "grab", touchAction: "none" }}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setDraggingGuess(true);
                }}
                onPointerMove={moveGuess}
                onPointerUp={() => setDraggingGuess(false)}
                onPointerCancel={() => setDraggingGuess(false)}
                onPointerEnter={() => setHoveredGuess(true)}
                onPointerLeave={() => setHoveredGuess(false)}
            />

            {/* The three ratios, direct-labelled along the foot of the figure. */}
            <g fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                <text x="40" y="358" fill={ACCENT} opacity={dim(["sine"])} {...hoverProps("sine")} style={EASE_150}>
                    {`sin ${formatAngle(angle)} = ${formatRatio(sine)}`}
                </text>
                <text x="250" y="358" fill={INK} opacity={dim(["cosine"])} {...hoverProps("cosine")} style={EASE_150}>
                    {`cos ${formatAngle(angle)} = ${formatRatio(cosine)}`}
                </text>
                <text x="450" y="358" fill={INK} opacity={dim(["tangent"])} {...hoverProps("tangent")} style={EASE_150}>
                    {`tan ${formatAngle(angle)} = ${formatRatio(tangent)}`}
                </text>
            </g>
        </svg>
    );
}

function RatioFigure() {
    const setVar = useSetVar();
    const predictionMoved = useVar<boolean>("predictionMoved", false);

    return (
        <Figure
            id="trig-three-ratios"
            onReset={() => {
                setVar("triangleAngle", 30);
                setVar("sinePrediction", 0.5);
                setVar("predictionMoved", false);
                setVar("ratioHighlight", "");
            }}
            caption="Park your indigo guess on the scale first, then drag the teal corner round to 60°. The dashed line carries the triangle's height straight onto the scale."
        >
            <RatioDrawing />
            <div className="space-y-3 px-6 pb-5">
                <FigureSlider
                    varName="triangleAngle"
                    label="Angle"
                    {...numberPropsFromDefinition(getVariableInfo("triangleAngle"))}
                    formatValue={formatAngle}
                />
                <FigureSlider
                    varName="sinePrediction"
                    label="Your guess (sine)"
                    {...numberPropsFromDefinition(getVariableInfo("sinePrediction"))}
                    formatValue={formatRatio}
                />
            </div>
            <InteractionHintSequence
                hintKey="trig-three-ratios-predict"
                currentStep={predictionMoved ? 1 : 0}
                steps={[
                    {
                        gesture: "drag-vertical",
                        label: "Drag the indigo marker to where sine will land at 60°",
                        position: { x: "81%", y: "44%" },
                        dragPath: { type: "line", startOffset: { x: 0, y: 20 }, endOffset: { x: 0, y: -20 } },
                    },
                    {
                        gesture: "drag-circular",
                        label: "Now drag the teal corner round to 60°",
                        position: { x: "42%", y: "45%" },
                        dragPath: { type: "arc", startAngle: -30, endAngle: -60, radius: 38 },
                    },
                ]}
            />
        </Figure>
    );
}

// ── Blocks ───────────────────────────────────────────────────────────────────

export const trigThreeRatiosBlocks: ReactElement[] = [
    <StackLayout key="layout-trig-ratios-heading" maxWidth="xl">
        <Block id="trig-ratios-heading" padding="md">
            <EditableH2 id="h2-trig-ratios-heading" blockId="trig-ratios-heading">
                Three Ratios, Three Names
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-ratios-setup" maxWidth="xl">
        <Block id="trig-ratios-setup" padding="sm">
            <EditableParagraph id="para-trig-ratios-setup" blockId="trig-ratios-setup">
                At 30° the sine of this triangle reads 0.50. Before touching the angle,
                park the indigo marker on the scale where you think the sine will land
                once the angle doubles to 60°. Then drag the teal corner round until the
                angle gets there.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-ratios-figure" maxWidth="xl">
        <Block id="trig-ratios-figure" padding="sm" hasVisualization>
            <RatioFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-ratios-reflect" maxWidth="xl">
        <Block id="trig-ratios-reflect" padding="sm">
            <EditableParagraph id="para-trig-ratios-reflect" blockId="trig-ratios-reflect">
                It lands on 0.87, not the 1.00 that doubling would have given. That is
                because{" "}
                <InlineLinkedHighlight
                    varName="ratioHighlight"
                    highlightId="sine"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("ratioHighlight"))}
                >
                    sine
                </InlineLinkedHighlight>{" "}
                is no multiplier sitting in front of the angle; it is opposite divided by
                hypotenuse.{" "}
                <InlineLinkedHighlight
                    varName="ratioHighlight"
                    highlightId="cosine"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("ratioHighlight"))}
                >
                    Cosine
                </InlineLinkedHighlight>{" "}
                takes adjacent over hypotenuse, and{" "}
                <InlineLinkedHighlight
                    varName="ratioHighlight"
                    highlightId="tangent"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("ratioHighlight"))}
                >
                    tangent
                </InlineLinkedHighlight>{" "}
                takes opposite over adjacent.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-ratios-question-doubling" maxWidth="xl">
        <Block id="trig-ratios-question-doubling" padding="sm">
            <EditableParagraph id="para-trig-ratios-question-doubling" blockId="trig-ratios-question-doubling">
                Set beside twice the value of sin 30°, the value of sin 60° is{" "}
                <InlineFeedback
                    varName="answerDoubleAngle"
                    correctValue="less than"
                    position="terminal"
                    successMessage="— yes, 0.87 falls short of 1.00, so the angle and its sine simply do not scale together"
                    failureMessage="— that is the multiplier idea talking."
                    hint="Twice sin 30° would be 1.00, and the triangle never gets there"
                    visualizationHint={{
                        blockId: "trig-ratios-figure",
                        hintKey: "trig-ratios-feedback-hint",
                        label: "Discover it yourself",
                        resetVars: { triangleAngle: 30 },
                        steps: [
                            {
                                gesture: "drag-circular",
                                label: "Drag the teal corner round to 60° and read the sine on the scale",
                                position: { x: "42%", y: "45%" },
                                dragPath: { type: "arc", startAngle: -30, endAngle: -60, radius: 38 },
                                completionVar: "triangleAngle",
                                completionValue: 60,
                                completionTolerance: 3,
                            },
                        ],
                    }}
                >
                    <InlineClozeChoice
                        varName="answerDoubleAngle"
                        correctAnswer="less than"
                        options={["equal to", "less than", "greater than"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerDoubleAngle"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-ratios-question-sides" maxWidth="xl">
        <Block id="trig-ratios-question-sides" padding="sm">
            <EditableParagraph id="para-trig-ratios-question-sides" blockId="trig-ratios-question-sides">
                A roof brace makes a right triangle. The side opposite the marked angle is
                3 m and the hypotenuse is 5 m, so the sine of that angle is{" "}
                <InlineFeedback
                    varName="answerSineFromSides"
                    correctValue={["0.6", ".6", "0.60", "3/5"]}
                    position="terminal"
                    successMessage="— exactly, 3 divided by 5, and no calculator button required"
                    failureMessage="— close, but check which two lengths you divided."
                    hint="Sine is the opposite length divided by the hypotenuse"
                    reviewBlockId="trig-ratios-reflect"
                    reviewLabel="Revisit the three ratios"
                >
                    <InlineClozeInput
                        varName="answerSineFromSides"
                        correctAnswer={["0.6", ".6", "0.60", "3/5"]}
                        {...clozePropsFromDefinition(getVariableInfo("answerSineFromSides"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
