"use client";

import { useEffect, useState } from "react";

// Input types that never raise the soft keyboard — a checkbox or a file picker taking
// focus must not be mistaken for the user typing.
const NON_TEXT_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

function isTextEntry(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  if (el.tagName === "TEXTAREA") return true;
  if (el.tagName !== "INPUT") return false;
  return !NON_TEXT_INPUT_TYPES.has((el as HTMLInputElement).type);
}

// The keyboard eats roughly a third of the screen; 15% is comfortably below that and
// comfortably above the ~10% a collapsing browser address bar accounts for.
const KEYBOARD_VIEWPORT_RATIO = 0.85;

/**
 * True while the on-screen keyboard is (almost certainly) covering the bottom of the
 * screen, so bottom-anchored chrome can get out of the way.
 *
 * Focus is the primary signal because it is the one thing every mobile browser agrees
 * on. visualViewport only refines it: iOS keeps focus on the field after the keyboard
 * is dismissed with its "Done" key, and without the height check the bar would stay
 * hidden behind a keyboard that is no longer there.
 */
export function useSoftKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    // Height measured while nothing is being typed into — reassigned rather than
    // maxed so a rotation re-baselines instead of reading as a permanent keyboard.
    let baseline = vv?.height ?? window.innerHeight;
    let frame = 0;

    const sync = () => {
      cancelAnimationFrame(frame);
      // focusout fires before the next element takes focus, so activeElement is
      // momentarily <body>; measuring a frame later stops the bar flickering back in
      // when the user moves straight from one field to the next.
      frame = requestAnimationFrame(() => {
        const typing = isTextEntry(document.activeElement);
        if (!typing && vv) baseline = vv.height;
        setOpen(typing && (!vv || vv.height < baseline * KEYBOARD_VIEWPORT_RATIO));
      });
    };

    sync();
    document.addEventListener("focusin", sync);
    document.addEventListener("focusout", sync);
    vv?.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("focusin", sync);
      document.removeEventListener("focusout", sync);
      vv?.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, []);

  return open;
}
