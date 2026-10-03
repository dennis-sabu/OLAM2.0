import React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "esp-web-install-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          manifest?: string;
          "show-log"?: boolean;
          "log-level"?: string;
        },
        HTMLElement
      >;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "esp-web-install-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          manifest?: string;
          "show-log"?: boolean;
          "log-level"?: string;
        },
        HTMLElement
      >;
    }
  }
}
