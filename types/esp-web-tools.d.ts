/**
 * Type declarations for the esp-web-tools custom element.
 * Loaded dynamically via CDN in FirmwareFlashPanel.tsx.
 * @see https://esphome.github.io/esp-web-tools/
 */

declare namespace JSX {
  interface IntrinsicElements {
    "esp-web-install-button": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        manifest?: string;
        /** Overrides whether to show erase prompt */
        "show-log"?: boolean;
        /** log level: "verbose" | "debug" | "info" | "error" | "off" */
        "log-level"?: string;
      },
      HTMLElement
    >;
  }
}
