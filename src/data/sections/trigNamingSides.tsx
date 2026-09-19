/**
 * Section 3 — Which Side Is Which
 * A fixed right triangle. The student drags the angle marker along the
 * hypotenuse from one acute corner to the other; "opposite" and "adjacent"
 * swap sides while the hypotenuse keeps its name.
 */

import React, { useEffect, useRef, useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineFeedback,
    InlineLinkedHighlight,
    InlineSpotColor,
    InlineTooltip,
    InlineTrigger,
    InteractionHintSequence,
    RevealOnInteraction,
} from "@/components/atoms";
import { Figure } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { useSpring, vec2, type Vec2 } from "@/lib/motion";
import {
    choicePropsFromDefinition,
    getVariableInfo,
    linkedHighlightPropsFromDefinition,
    spotColorPropsFromDefinition,
} from "../variables";

// ── View constants ───────────────────────────────────────────────────────────

const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 360;

const BOTTOM_CORNER: Vec2 = { x: 90, y: 300 }; // acute corner 0
const RIGHT_CORNER: Vec2 = { x: 390, y: 300 }; // the right angle
const TOP_CORNER: Vec2 = { x: 390, y: 75 }; // acute corner 1

const INK_STRUCTURE = "#64748B";
const ACCENT = "#62D0AD"; // the opposite side and the drag marker
const PARTNER = "#8E90F5"; // the adjacent side — the covariation partner
const HYPOTENUSE = "#F7B23B"; // the hypotenuse — same amber as the ramp surface
const ANGLE = "#62CCF9"; // the marked angle

const EASE_150 = { transition: "opacity 150ms ease, stroke-width 150ms ease" } as const;

// ── The bespoke drawing ──────────────────────────────────────────────────────

function NamedSidesDrawing() {
    const setVar = useSetVar();
    const marked = useVar<number>("markedVertex", 0);
    const highlight = useVar<string>("sidesHighlight", "");

    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    const atTop = marked >= 0.5;

    // Reaching the far corner by any route (drag or prose) counts as exploring.
    useEffect(() => {
        if (atTop) setVar("sidesExplored", true);
    }, [atTop, setVar]);

    // The marker eases between the two corners — nothing teleports.
    const markerX = useSpring(atTop ? TOP_CORNER.x : BOTTOM_CORNER.x, { stiffness: 200, damping: 22 });
    const markerY = useSpring(atTop ? TOP_CORNER.y : BOTTOM_CORNER.y, { stiffness: 200, damping: 22 });
    const handleScale = useSpring(dragging || hovered ? 1.15 : 1, { stiffness: 400, damping: 26 });

    const opacity = (id: string) => (highlight && highlight !== id ? 0.35 : 1);
    const isActive = (id: string) => highlight === id;
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("sidesHighlight", id),
        onPointerLeave: () => setVar("sidesHighlight", ""),
    });

    // Which physical side plays which role right now.
    const verticalRole = atTop ? "adjacent" : "opposite";
    const horizontalRole = atTop ? "opposite" : "adjacent";
    const colorFor = (role: string) => (role === "opposite" ? ACCENT : PARTNER);

    const handlePointerMove = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!dragging || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const point: Vec2 = {
            x: ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH,
            y: ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT,
        };
        const toBottom = vec2.dist(point, BOTTOM_CORNER);
        const toTop = vec2.dist(point, TOP_CORNER);
        setVar("markedVertex", toTop < toBottom ? 1 : 0);
        setVar("sidesExplored", true);
    };

    // Angle arc at whichever corner is marked.
    const arcPath = atTop
        ? `M ${TOP_CORNER.x} ${TOP_CORNER.y + 44} A 44 44 0 0 1 ${TOP_CORNER.x - 35.2} ${TOP_CORNER.y + 26.4}`
        : `M ${BOTTOM_CORNER.x + 44} ${BOTTOM_CORNER.y} A 44 44 0 0 0 ${BOTTOM_CORNER.x + 35.2} ${BOTTOM_CORNER.y - 26.4}`;
    const thetaPoint = atTop
        ? { x: TOP_CORNER.x - 28, y: TOP_CORNER.y + 60 }
        : { x: BOTTOM_CORNER.x + 62, y: BOTTOM_CORNER.y - 16 };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="A right triangle whose marked corner can be dragged from one acute corner to the other"
        >
            <defs>
                <filter id="sides-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* Right-angle square — structure, never renamed. */}
            <g opacity={opacity("__structure")} style={EASE_150}>
                <polyline
                    points={`${RIGHT_CORNER.x - 16},${RIGHT_CORNER.y} ${RIGHT_CORNER.x - 16},${RIGHT_CORNER.y - 16} ${RIGHT_CORNER.x},${RIGHT_CORNER.y - 16}`}
                    fill="none"
                    stroke={INK_STRUCTURE}
                    strokeWidth="1.5"
                />
            </g>

            {/* Hypotenuse — its own amber; it answers to the right angle, not to θ. */}
            <g {...hoverProps("hypotenuse")} opacity={opacity("hypotenuse")} style={EASE_150}>
                {isActive("hypotenuse") && (
                    <line
                        x1={BOTTOM_CORNER.x}
                        y1={BOTTOM_CORNER.y}
                        x2={TOP_CORNER.x}
                        y2={TOP_CORNER.y}
                        stroke={HYPOTENUSE}
                        strokeWidth="10"
                        strokeLinecap="round"
                        opacity={0.28}
                    />
                )}
                <line
                    x1={BOTTOM_CORNER.x}
                    y1={BOTTOM_CORNER.y}
                    x2={TOP_CORNER.x}
                    y2={TOP_CORNER.y}
                    stroke={HYPOTENUSE}
                    strokeWidth={isActive("hypotenuse") ? 5 : 3.5}
                    strokeLinecap="round"
                    style={EASE_150}
                />
                <text x={228} y={186} fill={HYPOTENUSE} fontSize="13" textAnchor="end">
                    hypotenuse
                </text>
            </g>

            {/* Vertical side. */}
            <g {...hoverProps(verticalRole)} opacity={opacity(verticalRole)} style={EASE_150}>
                {isActive(verticalRole) && (
                    <line
                        x1={RIGHT_CORNER.x}
                        y1={RIGHT_CORNER.y}
                        x2={TOP_CORNER.x}
                        y2={TOP_CORNER.y}
                        stroke={colorFor(verticalRole)}
                        strokeWidth="10"
                        strokeLinecap="round"
                        opacity={0.28}
                    />
                )}
                <line
                    x1={RIGHT_CORNER.x}
                    y1={RIGHT_CORNER.y}
                    x2={TOP_CORNER.x}
                    y2={TOP_CORNER.y}
                    stroke={colorFor(verticalRole)}
                    strokeWidth={isActive(verticalRole) ? 5 : 3.5}
                    strokeLinecap="round"
                    style={EASE_150}
                />
                <text x={406} y={192} fill={colorFor(verticalRole)} fontSize="13">
                    {verticalRole}
                </text>
            </g>

            {/* Horizontal side. */}
            <g {...hoverProps(horizontalRole)} opacity={opacity(horizontalRole)} style={EASE_150}>
                {isActive(horizontalRole) && (
                    <line
                        x1={BOTTOM_CORNER.x}
                        y1={BOTTOM_CORNER.y}
                        x2={RIGHT_CORNER.x}
                        y2={RIGHT_CORNER.y}
                        stroke={colorFor(horizontalRole)}
                        strokeWidth="10"
                        strokeLinecap="round"
                        opacity={0.28}
                    />
                )}
                <line
                    x1={BOTTOM_CORNER.x}
                    y1={BOTTOM_CORNER.y}
                    x2={RIGHT_CORNER.x}
                    y2={RIGHT_CORNER.y}
                    stroke={colorFor(horizontalRole)}
                    strokeWidth={isActive(horizontalRole) ? 5 : 3.5}
                    strokeLinecap="round"
                    style={EASE_150}
                />
                <text x={240} y={326} fill={colorFor(horizontalRole)} fontSize="13" textAnchor="middle">
                    {horizontalRole}
                </text>
            </g>

            {/* The marked angle. */}
            <path d={arcPath} fill="none" stroke={ANGLE} strokeWidth="2.5" />
            <text x={thetaPoint.x} y={thetaPoint.y} fill={ANGLE} fontSize="14" textAnchor="middle">
                θ
            </text>

            {/* Draggable corner marker. */}
            <g transform={`translate(${markerX} ${markerY}) scale(${handleScale})`}>
                <circle r="12" fill={ACCENT} filter="url(#sides-handle-shadow)" />
            </g>
            <circle
                cx={markerX}
                cy={markerY}
                r="26"
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

function NamedSidesFigure() {
    const setVar = useSetVar();

    return (
        <Figure
            id="trig-named-sides"
            onReset={() => {
                setVar("markedVertex", 0);
                setVar("sidesHighlight", "");
            }}
            caption="Drag the teal marker along the hypotenuse to the far corner. The two shorter sides swap names; the hypotenuse keeps its own."
        >
            <NamedSidesDrawing />
            <InteractionHintSequence
                hintKey="trig-named-sides-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag the teal marker up to the far corner",
                        position: { x: "15%", y: "83%" },
                        dragPath: {
                            type: "line",
                            startOffset: { x: -12, y: 9 },
                            endOffset: { x: 34, y: -25 },
                        },
                    },
                ]}
            />
        </Figure>
    );
}

// ── Blocks ───────────────────────────────────────────────────────────────────

export const trigNamingSidesBlocks: ReactElement[] = [
    <StackLayout key="layout-trig-sides-heading" maxWidth="xl">
        <Block id="trig-sides-heading" padding="md">
            <EditableH2 id="h2-trig-sides-heading" blockId="trig-sides-heading">
                Which Side Is Which
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-sides-setup" maxWidth="xl">
        <Block id="trig-sides-setup" padding="sm">
            <EditableParagraph id="para-trig-sides-setup" blockId="trig-sides-setup">
                Every{" "}
                <InlineTooltip
                    id="tooltip-trig-sides-right-triangle"
                    tooltip="A triangle with one 90° corner, the right angle, marked by a small square."
                    color="#2563EB"
                    bgColor="rgba(37, 99, 235, 0.12)"
                >
                    right triangle
                </InlineTooltip>{" "}
                has a longest side, the{" "}
                <InlineLinkedHighlight
                    varName="sidesHighlight"
                    highlightId="hypotenuse"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("sidesHighlight"))}
                    color="#F7B23B"
                    bgColor="rgba(247, 178, 59, 0.22)"
                >
                    hypotenuse
                </InlineLinkedHighlight>
                , lying across from the right angle. The other two earn their names from
                the corner you are standing in. Drag the teal marker along the hypotenuse
                to{" "}
                <InlineTrigger
                    id="trigger-trig-sides-far-corner"
                    varName="markedVertex"
                    value={1}
                    color="#62CCF9"
                    bgColor="rgba(98, 204, 249, 0.18)"
                >
                    the far corner
                </InlineTrigger>{" "}
                and keep an eye on those two names.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-sides-figure" maxWidth="xl">
        <Block id="trig-sides-figure" padding="sm" hasVisualization>
            <NamedSidesFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-sides-reflect" maxWidth="xl">
        <Block id="trig-sides-reflect" padding="sm">
            <EditableParagraph id="para-trig-sides-reflect" blockId="trig-sides-reflect">
                So{" "}
                <InlineLinkedHighlight
                    id="link-trig-sides-reflect-opposite"
                    varName="sidesHighlight"
                    highlightId="opposite"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("sidesHighlight"))}
                    color="#62D0AD"
                    bgColor="rgba(98, 208, 173, 0.22)"
                >
                    opposite
                </InlineLinkedHighlight>{" "}
                means across from the{" "}
                <InlineSpotColor
                    id="spot-trig-sides-reflect-angle"
                    varName="markedAngle"
                    {...spotColorPropsFromDefinition(getVariableInfo("markedAngle"))}
                >
                    marked angle
                </InlineSpotColor>
                , and{" "}
                <InlineLinkedHighlight
                    id="link-trig-sides-reflect-adjacent"
                    varName="sidesHighlight"
                    highlightId="adjacent"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("sidesHighlight"))}
                    color="#8E90F5"
                    bgColor="rgba(142, 144, 245, 0.22)"
                >
                    adjacent
                </InlineLinkedHighlight>{" "}
                means alongside it. Move the marker and the very same plank of wood becomes
                the other one. Only the{" "}
                <InlineSpotColor
                    id="spot-trig-sides-reflect-hypotenuse"
                    varName="sideHypotenuse"
                    {...spotColorPropsFromDefinition(getVariableInfo("sideHypotenuse"))}
                >
                    hypotenuse
                </InlineSpotColor>{" "}
                holds its name, because it reports to the right angle instead.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-sides-question" maxWidth="xl">
        <Block id="trig-sides-question" padding="sm">
            <EditableParagraph id="para-trig-sides-question" blockId="trig-sides-question">
                <RevealOnInteraction varName="sidesExplored">
                    The tall vertical side is the{" "}
                    <InlineSpotColor
                        id="spot-trig-sides-question-opposite"
                        varName="sideOpposite"
                        {...spotColorPropsFromDefinition(getVariableInfo("sideOpposite"))}
                    >
                        opposite
                    </InlineSpotColor>{" "}
                    when the bottom corner is marked. Mark the top corner instead and that same side becomes the{" "}
                    <InlineFeedback
                        varName="answerSideSwap"
                        correctValue="adjacent"
                        position="terminal"
                        successMessage="— right, it is now alongside the marked angle rather than across from it"
                        failureMessage="— have another look."
                        hint="Stand in the top corner and ask which side you are leaning against"
                        visualizationHint={{
                            blockId: "trig-sides-figure",
                            hintKey: "trig-sides-feedback-hint",
                            label: "Discover it yourself",
                            resetVars: { markedVertex: 0 },
                            steps: [
                                {
                                    gesture: "drag",
                                    label: "Drag the marker to the top corner and read the tall side's new name",
                                    position: { x: "15%", y: "83%" },
                                    completionVar: "markedVertex",
                                    completionValue: 1,
                                    completionTolerance: 0.4,
                                },
                            ],
                        }}
                    >
                        <InlineClozeChoice
                            varName="answerSideSwap"
                            correctAnswer="adjacent"
                            options={["hypotenuse", "opposite", "adjacent"]}
                            {...choicePropsFromDefinition(getVariableInfo("answerSideSwap"))}
                        />
                    </InlineFeedback>.
                </RevealOnInteraction>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
