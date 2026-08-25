/**
 * Section 1 — Sine, Cosine and Tangent (orientation)
 * Text-only opening: the skatepark hook, the promise, and the two skills
 * students already have (writing a ratio, dividing to a decimal).
 */

import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH1, EditableParagraph } from "@/components/atoms";

export const trigOrientBlocks: ReactElement[] = [
    <StackLayout key="layout-trig-orient-title" maxWidth="xl">
        <Block id="trig-orient-title" padding="md">
            <EditableH1 id="h1-trig-orient-title" blockId="trig-orient-title">
                Sine, Cosine and Tangent
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-orient-hook" maxWidth="xl">
        <Block id="trig-orient-hook" padding="sm">
            <EditableParagraph id="para-trig-orient-hook" blockId="trig-orient-hook">
                Skaters argue about ramps constantly. One says his ramp is steeper, the
                other says hers is bigger. They are not talking about the same thing, and
                there is a tidy piece of maths that settles it.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-orient-promise" maxWidth="xl">
        <Block id="trig-orient-promise" padding="sm">
            <EditableParagraph id="para-trig-orient-promise" blockId="trig-orient-promise">
                Every ramp has a height and a sloping surface you ride up. Divide one
                length by the other and you get a single decimal that pins down the
                steepness exactly, whatever the size of the ramp. That decimal has a name
                you have seen on a calculator: sine, along with its partners cosine and
                tangent.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trig-orient-prereq" maxWidth="xl">
        <Block id="trig-orient-prereq" padding="sm">
            <EditableParagraph id="para-trig-orient-prereq" blockId="trig-orient-prereq">
                By the end you will be able to take any right-angled triangle, pick the
                two sides you need, and write down its sine, cosine and tangent. You
                already have everything that takes: writing a ratio of two lengths, and
                dividing to get a decimal.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
