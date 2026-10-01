import React, { type JSX, useEffect, useRef, useState } from "react";
import { InnerPanel } from "components/ui/Panel";
import classNames from "classnames";

// Mobile and short screens size the split view through the modal height rules
// in styles.css; the measured caps below only apply outside them. Mirrors the
// breakpoints of those rules - keep the two in sync.
const DESKTOP_QUERY = "(min-width: 640px) and (min-height: 500px)";

/**
 * The props for the component.
 * @param divRef The parent div reference. It is used to link up the parentDivRef prop of the <Box/> component.
 * @param tallMobileContent On mobile and short screens, sizes the whole modal to its maximum height even when the content is short. Without it the modal is only capped at that height, so short content keeps it small. Defaults to false.
 * @param wideModal true if the panel modal is using a wider variant, else false. Defaults to false.
 * @param showPanel Whether to show the top or right panel view or not.
 * @param contentScrollable Whether the content view is scrollable or not.
 * @param panel The top or right panel view.
 * @param content The bottom or left content view.
 * @param mobileReversePanelOrder Whether to show the panel below the content on mobile.
 * @param matchPanelHeight On desktop, caps the content column's height to the panel column's actual rendered height (measured live), instead of a fixed max-height, so the two columns' borders line up regardless of how much either side renders.
 * @param growToPanelHeight On desktop, lets the content column grow past its fixed max-height up to the panel column's height (measured live) when the panel is taller. Never shrinks it below the fixed max-height.
 */
interface Props {
  divRef?: React.RefObject<HTMLDivElement | null>;
  tallMobileContent?: boolean;
  tallDesktopContent?: boolean;
  wideModal?: boolean;
  showPanel?: boolean;
  contentScrollable?: boolean;
  panel: JSX.Element;
  content: JSX.Element;
  mobileReversePanelOrder?: boolean;
  matchPanelHeight?: boolean;
  growToPanelHeight?: boolean;
}

/**
 * The view for displaying item name, details, crafting requirements and action.
 * @props The component props.
 */
export const SplitScreenView: React.FC<Props> = ({
  divRef,
  tallMobileContent = false,
  wideModal = false,
  showPanel: showHeader = true,
  contentScrollable = true,
  mobileReversePanelOrder = false,
  panel: header,
  content,
  tallDesktopContent = false,
  matchPanelHeight = false,
  growToPanelHeight = false,
}) => {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [panelHeight, setPanelHeight] = useState<number | undefined>(undefined);
  const measurePanel = matchPanelHeight || growToPanelHeight;

  useEffect(() => {
    if (!measurePanel || !showHeader || !headerRef.current) return;

    const node = headerRef.current;

    const measure = () => {
      if (window.matchMedia(DESKTOP_QUERY).matches) {
        setPanelHeight(node.offsetHeight);
      } else {
        setPanelHeight(undefined);
      }
    };

    // ResizeObserver fires its callback once on observe() with the node's
    // initial size, so it handles the first measurement too — no direct
    // setState in the effect body is needed.
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measurePanel, showHeader]);

  const getContentStyle = (): React.CSSProperties | undefined => {
    if (!showHeader || !panelHeight) return undefined;
    if (matchPanelHeight) return { maxHeight: `${panelHeight}px` };
    if (growToPanelHeight) {
      const defaultCap = tallDesktopContent ? "30rem" : "24rem";
      return { maxHeight: `max(${defaultCap}, ${panelHeight}px)` };
    }
    return undefined;
  };

  return (
    <div
      data-modal-body
      data-tall-mobile={tallMobileContent || undefined}
      className="flex flex-col sm:flex-row"
    >
      <InnerPanel
        data-split-content
        className={classNames("w-full sm:w-3/5 h-fit p-1 flex content-start", {
          "sm:max-h-96": !tallDesktopContent,
          "sm:max-h-[30rem]": tallDesktopContent,
          "lg:w-3/4": wideModal,
          "flex-wrap overflow-y-auto scrollable overflow-x-hidden sm:mr-1":
            contentScrollable,
          "flex-col": !contentScrollable,
          "mt-1 sm:mt-0": !mobileReversePanelOrder,
        })}
        style={getContentStyle()}
        divRef={divRef}
      >
        {content}
      </InnerPanel>
      {showHeader && (
        <InnerPanel
          data-split-panel
          className={classNames("w-full sm:w-2/5 h-fit scrollable", {
            "lg:w-1/4": wideModal,
            "mt-1 sm:mt-0": mobileReversePanelOrder,
            // order rather than flex-col-reverse: a reversed column overflows
            // upwards, where the clipped top of a tall panel can't be scrolled to
            "max-sm:order-first": !mobileReversePanelOrder,
          })}
          divRef={headerRef}
        >
          {header}
        </InnerPanel>
      )}
    </div>
  );
};
