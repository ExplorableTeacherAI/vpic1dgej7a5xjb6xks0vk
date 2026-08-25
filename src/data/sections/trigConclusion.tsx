/**
 * Section 5 — Wrapping Up
 * Text-only close: the skatepark promise kept, the one idea worth carrying,
 * and where the ratios lead next.
 */

import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph } from "@/components/atoms";

export const trigConclusionBlocks: ReactElement[] = [
    <StackLayout key="layout-trig-close-heading" maxWidth="xl">
        <Block id="trig-close-heading" padding="md">
            <EditableH2 id="h2-trig-close-heading" blockId="trig-close-heading">
                Wrapping Up
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-close-settled" maxWidth="xl">
        <Block id="trig-close-settled" padding="sm">
            <EditableParagraph id="para-trig-close-settled" blockId="trig-close-settled">
                So the argument at the skatepark has an answer. Steepness was never a
                length; it is a ratio between two lengths, and that ratio stays exactly
                where it is however big you build the ramp.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-close-idea" maxWidth="xl">
        <Block id="trig-close-idea" padding="sm">
            <EditableParagraph id="para-trig-close-idea" blockId="trig-close-idea">
                That is the whole of sine, cosine and tangent. Stand in a corner, name the
                three sides from where you are, then divide the pair you need: opposite
                over hypotenuse, adjacent over hypotenuse, opposite over adjacent. Three
                divisions, three names, one decimal that belongs to the angle and to
                nothing else.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-close-next" maxWidth="xl">
        <Block id="trig-close-next" padding="sm">
            <EditableParagraph id="para-trig-close-next" blockId="trig-close-next">
                Which is why the sin button on a calculator seems to know things nobody
                told it. Hand it an angle and it hands back a ratio. Next comes the
                genuinely useful reverse trick: one side, one angle, and the ratio quietly
                tells you a length you could never reach with a tape measure, like the
                height of the building you are standing beside.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
